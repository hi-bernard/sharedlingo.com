module.exports.create = function(app){
    return new ReportsController(app);
};

function ReportsController(app){

    var controller = this;

    this.addSocket = function(socket) {

        socket.on('member reported', function(data){
            memberReported(socket, data);
        });

        socket.on('report resolved', function(reportId){
            broadcastReportsCount();
        });

    };

    this.connect = function(socket) {

        if (app.isStaff(socket)){
            app.db.reports.count({result: 0}, function(err, count){
                socket.emit('reports count', count);
            });
        }

    };

    this.getPendingReportsCount = function(callback){

        app.db.reports.count({result: 0}, function(err, count){
            callback(count);
        });
        
    };

    function memberReported(socket, data){

        if (!app.isAuth(socket)) { return; }

        if (app.isLogged(data.suspectId)){

            var suspectLog = app.getMember(data.suspectId).log;

            app.db.reports.update({
                _id: data.reportId
            }, {
                $set:{
                    'suspect.log': suspectLog
                }
            }, {multi: false}, function(){});

        }

        if (app.isLogged(data.reporterId)){

            var reporterLog = app.getMember(data.reporterId).log;

            app.db.reports.update({
                _id: data.reportId
            }, {
                $set:{
                    'reporter.log': reporterLog
                }
            }, {multi: false}, function(){});

        }

        broadcastReportsCount();

    }

    function broadcastReportsCount(){
        app.db.reports.count({result: 0}, function(err, count){
            app.io.to('staff').emit('reports count', count);
        });
    }

}