module.exports.create = function(config, mongoose){
    return new DB(config, mongoose);
};

function DB(config, mongoose){

    var dbConnection;

    this.members = null;
    this.messages = null;

    var wordModels = {};
    var wordSchema;

    init(this);

    function init(db){

        mongoose.connect('mongodb://localhost/' + config.dbName);

        dbConnection = mongoose.connection;

        wordSchema = mongoose.Schema({
            _id: Number,
            word: String
        });

        var helperSchema = mongoose.Schema({
            _id: Number,
            helper: String
        });

        var memberSchema = mongoose.Schema({
            token: String,
            name: {
                first: String,
                full: String,
                last: String,
                color: String
            },
            langs: {
                natives: Array,
                learns: Array
            },
            location: {
                countryCode: String,
                city: String
            },
            dates: {
                signed: Number,
                online: Number
            },
            inbox_unread: Number,
            bornYear: Number,
            gender: String,
            online: Boolean,
            admin: Boolean,
            moderator: Boolean,
            premium: Boolean,
            banned: Boolean,
            ban_reason: String,
            ban_until: Date,
            blacklist: Array,
            friends: Array,
            coords: {
                lat: Number,
                lng: Number
            }
        });

        var messageSchema = mongoose.Schema({
            roomId: String,
            sender: {
                id: String,
                name: String
            },
            sent: {
                type: Date,
                default: Date.now
            },
            text: String
        });

        var roomLogSchema = mongoose.Schema({
            from: String,
            to: {
                id: String,
                name: String
            },
            messages_count: Number,
            created: {
                type: Date,
                default: Date.now
            }
        });

        var reportSchema = mongoose.Schema({
            created: Date,
            reason: String,
            message: String,
            result: Number,
            suspect: {
                id: String,
                name: String,
                log: Array
            },
            reporter: {
                id: String,
                name: String,
                log: Array
            }
        });

        var statsSchema = mongoose.Schema({
            date: String,
            day: Number,
            month: Number,
            year: Number,
            max: Number,
            max_time: Date,
            avg: Number,
            avg_summ: Number,
            ticks: Number
        });

        db.members = mongoose.model('members', memberSchema);
        db.messages = mongoose.model('messages', messageSchema);
        db.reports = mongoose.model('reports', reportSchema);
        db.stats = mongoose.model('day_stats', statsSchema);
        db.helpers = mongoose.model('helpers_en', helperSchema, 'helpers_en');
        db.roomLog = mongoose.model('log_rooms', roomLogSchema);
        db.roomMessagesLog = mongoose.model('log_messages', messageSchema);

        db.members.update({}, {$set: { online: false }}, {multi: true}, function(){});

    }

    this.words = function(lang){

        if (lang in wordModels){
            return wordModels[lang];
        }

        var collection = 'words_' + lang.toLowerCase();

        wordModels[lang] = mongoose.model(collection, wordSchema, collection);

        return wordModels[lang];

    };

}
