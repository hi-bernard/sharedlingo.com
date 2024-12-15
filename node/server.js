var config = require('./config');
var fs = require('fs');

var server = require('https').createServer({
  key: fs.readFileSync(config.ssl.keyFile),
  cert: fs.readFileSync(config.ssl.crtFile)
}, onRequest);

var peerServer = require('peer').PeerServer({
    port: config.peer.port,
    path: config.peer.path,
    ssl: {
        key: fs.readFileSync(config.ssl.keyFile),
        cert: fs.readFileSync(config.ssl.crtFile)
    }
});

var io = require('socket.io')(server);
var mongoose = require('mongoose');
var db = require('./db').create(config, mongoose);
var app = require('./app').create(config, io, db);

io.on('connection', function (socket) {

    app.addSocket(socket);

    socket.on('mail sent', function(toId){

        if (!app.isAuth(socket)) { return; }

        if (!app.isLogged(toId)) { return; }

        db.members.findById(toId, function(err, member){

            app.getSocket(toId).emit('mail unread', member.inbox_unread);

        });

    });

});

function onRequest(request, response) {

    if (request.url === '/online'){

        var onlineMembers = app.getSocketsCount();

        app.getController('reports').getPendingReportsCount(function(pendingReports){

            response.writeHead(200, {"Content-Type": "text/plain"});

            response.write(onlineMembers.toString());

            if (pendingReports > 0){
                response.write(' (' + pendingReports.toString() + ')');
            }

            response.end();

        });

        return;

    }

    var host = 'http://' + request.headers.host.split(':')[0];

    response.writeHead(301, {Location: host});
    response.end();

}

server.listen(config.port);
