/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

var	qs = require('querystring');

processSession = function(socket) {
    if (socket.sessionId) {
        return true;
    }
    try {
        var rawCookie = socket.handshake.headers.cookie;
        var cookie = qs.parse(rawCookie, '; ');
        var sessionId = cookie['connect.sid'].split('.')[0];
        var unsignedSessionId = sessionId.split(':')[1].replace(/\s/g, '+');
        return socket.sessionId = unsignedSessionId;
    } catch (e) {
        console.log('Warning: connect.sid session cookie not detected. User may have cookies disabled or session cookie has expired');
        return false;
    }
};

module.exports = function(io, sessionStore, dataAdapter) {
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        if (processSession(socket)) {
            socket.on('data_access', function () {
                var args = [].slice.call(arguments);
                // Check for callback
                if (typeof(args[args.length - 1]) === "function") {
                    sessionStore.get(socket.sessionId, function (err, session) {
                        if (!session.passport.user) {
                            var cb = args.pop();
                            cb({ redirect: "/login" });
                        }
                        if (dataAdapter) {
                            dataAdapter.execute.apply(dataAdapter, args);
                        }
                    });
                }
            });
        }
    });
}