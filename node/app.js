var escape = require('escape-html');
var extend = require('util')._extend;

module.exports.create = function(config, io, db){
    return new App(config, io, db);
};

function App(config, io, db){

    var controllersList = [
        'admin',
        'friends',
        'games',
        'requests',
        'reports',
        'rooms',
        'textchat',
        'voicechat',
        'map',
        'members'
    ];

    var stats = {};

    var statsLimit = 90000000000000;

    var app = this;

    this.config = config;
    this.io = io;
    this.db = db;

    var year = (new Date()).getFullYear();

    var controllers = {};
    var members = {};
    var sockets = {};

    init();

    function init(){

        controllersList.forEach(function(controllerId){
            controllers[controllerId] = require('./controllers/' + controllerId).create(app);
        });

        app.rooms = controllers.rooms;

        initStats();

    }

    this.addSocket = function(socket){

        socket.userId = 0;

        socket.on('handshake', function(data){

            db.members.findByIdAndUpdate(data.userId, {$set: { online: true }}, function(err, member){

                if (member.banned) { socket.disconnect(); return; }
                if (data.token !== member.token) { socket.disconnect(); return; }
                if (data.userId in members) { return; }

                socket.userId = data.userId;

                var memberRecord = app.parseMember(member);

                sockets[data.userId] = socket;
                members[data.userId] = memberRecord;

                var handshakeData = {
                    members: members,
                    mailUnread: member.inbox_unread,
                    publicCounts: app.rooms.getPublicCounts(),
                    voiceChatCount: app.getController('voicechat').getOnlineCount(),
                    gamesCount: app.getController('games').getGamesCount()
                };

                socket.emit('handshake', handshakeData);

                socket.broadcast.emit('member in', memberRecord);

                eachController(function(){
                    if ('connect' in this){
                        this.connect(socket);
                    }
                });

                updateStats();

            });

        });

        socket.on('disconnect', function(){

            if (!socket.userId) { return; }
            if (!app.isAuth(socket)) { return; }

            eachController(function(){
                if ('disconnect' in this){
                    this.disconnect(socket);
                }
            });

            delete sockets[socket.userId];
            delete members[socket.userId];

            db.members.update({ _id: socket.userId }, {$set: { online: false }}, function(){});

            io.emit('member out', socket.userId);
            io.emit('voice member out', socket.userId);
            io.emit('voice chat count', app.getController('voicechat').getOnlineCount());

            updateStats();

        });

        eachController(function(){
            if ('addSocket' in this){
                this.addSocket(socket);
            }
        });

    };

    function eachController(callback){
        Object.keys(controllers).forEach(function(controllerId){
            var controller = controllers[controllerId];
            callback.call(controller);
        });
    }

    function updateStats(){

        var date = getCurrentDate();

        if (date.string != stats.date) { resetStats(date); }

        var membersOnline = Object.keys(members).length;

        if (membersOnline > stats.max) {
            stats.max = membersOnline;
            stats.maxTime = date.time;
        }

        if (stats.ticks < statsLimit && stats.avgSumm < statsLimit){
            stats.ticks++;
            stats.avgSumm += membersOnline;
            stats.avg = Math.round(stats.avgSumm / stats.ticks);
        }

        db.stats.update({date: date.string}, {
            date: date.string,
            day: date.day,
            month: date.month,
            year: date.year,
            max: stats.max,
            max_time: new Date(Number(stats.maxTime)),
            avg: stats.avg,
            avg_summ: stats.avgSumm,
            ticks: stats.ticks
        }, {
            upsert: true
        }, function(err){});

    };

    function initStats(){

        var date = getCurrentDate();

        resetStats(date);

        db.stats.findOne({date: date.string}, function(err, data){

            if (data === null) {
                return;
            }

            stats = {
                date: data.date,
                day: data.day,
                month: data.month,
                year: data.year,
                max: data.max,
                maxTime: data.max_time.getTime(),
                avg: data.avg,
                avgSumm: data.avg_summ,
                ticks: data.ticks
            };

        });

    };

    function resetStats(date){

        stats = {
            date: date.string,
            day: date.day,
            month: date.month,
            year: date.year,
            max: 0,
            maxTime: new Date().getTime(),
            avg: 0,
            avgSumm: 0,
            ticks: 0
        };

    }

    this.parseMember = function(member){
        return {
            id: member._id.toString(),
            name: {
                first: escape(member.name.first),
                last: escape(member.name.last),
                full: escape(member.name.full),
                color: member.premium || member.admin ? (member.name.color ? member.name.color : false) : false
            },
            langs: member.langs,
            location: {
                countryCode: member.location.countryCode,
                city: escape(member.location.city),
            },
            dates: member.dates,
            bornYear: member.bornYear,
            gender: member.gender,
            age: year - member.bornYear,
            friends: member.friends,
            admin: member.admin,
            moderator: member.moderator,
            premium: member.premium,
            blacklist: member.blacklist ? member.blacklist : [],
            coords: member.coords,
            log: []
        };
    };

    this.getController = function(controllerName){
        return controllers[controllerName];
    };

    this.escape = function(string){
        return escape(string);
    };

    this.extend = function(source, dest){
        return extend(source, dest);
    };

    this.getSocket = function(userId){
        return sockets[userId];
    };

    this.getSocketsCount = function(){
        return Object.keys(sockets).length;
    };

    this.getMember = function(userId){
        return members[userId];
    };

    this.getMembers = function(){
        return members;
    };

    this.updateMember = function(id, member){

        members[id] = member;

        eachController(function(){
            if ('onMemberUpdate' in this){
                this.onMemberUpdate(id, member);
            }
        });

    };

    this.isLogged = function(userId){
        return (userId in sockets);
    };

    this.isAuth = function(socket){
        return ((socket.userId in sockets) && (socket.userId in members));
    };

    this.isStaff = function(socket){
        return this.isAuth(socket) && (members[socket.userId].admin || members[socket.userId].moderator);
    };

    this.isAdmin = function(socket){
        return this.isAuth(socket) && members[socket.userId].admin;
    };

    this.isInBlackList = function(socket, userId){

        var member = members[userId];

        if (!member.blacklist){ return false; }

        if (member.blacklist.indexOf(socket.userId) < 0) { return false; }

        return true;

    };

    this.getRandomInt = function(low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    };

    function getCurrentDate(){

        var d = new Date();

        var date = {
            time: d.getTime(),
            day: d.getDate(),
            month: d.getMonth() + 1,
            year: d.getFullYear()
        };

        date.string = [
            date.day>9 ? date.day : '0'+date.day,
            date.month>9 ? date.month : '0'+date.month,
            date.year,
        ].join('-');

        return date;

    };

}
