module.exports.create = function(app){
    return new MapController(app);
};

function MapController(app){

    var controller = this;

    this.addSocket = function(socket) {

        socket.on('set coords', function(coords){

            app.db.members.update({ _id: socket.userId }, {$set: {coords: coords}}, function(){});

            var member = app.getMember(socket.userId);

            member.coords = {lat: coords.lat, lng: coords.lng};

            app.io.emit('member new coords', member);

        });

    };

    this.connect = function(socket){

        var member = app.getMember(socket.userId);

        if (!member.coords.lat){
            socket.emit('get coords');
        }

    };

}