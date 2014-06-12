/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

var chokidar, consoleMessage, cssExtensions, lastRun, pathlib,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

pathlib = require('path');

chokidar = require('chokidar');

lastRun = {
    refresh_css: Date.now(),
    refresh_site: Date.now()
};

cssExtensions = ['.css', '.styl', '.stylus', '.less'];

consoleMessage = {
    refresh_css: 'CSS files changed. Updating browser...',
    refresh_site: 'Client files changed. Reloading browser...'
};

module.exports = function(io, dirs) {
    var dir, onChange, watchDirs, watcher;
    watcher = chokidar.watch(dirs, {
        ignored: /(\/\.|~$)/
    });
    watcher.on('add', function(path) {
        return onChange(path, 'added');
    });
    watcher.on('change', function(path) {
        return onChange(path, 'changed');
    });
    watcher.on('unlink', function(path) {
        return onChange(path, 'removed');
    });
    watcher.on('error', function(error) {
        return console.log('✎', ("Error: " + error));
    });
    return onChange = function(path, event) {
        var action, _ref;
        action = (_ref = pathlib.extname(path), __indexOf.call(cssExtensions, _ref) >= 0) ? 'refresh_css' : 'refresh_site';
        if ((Date.now() - lastRun[action]) > 1000) {
            console.log('✎', consoleMessage[action]);
            io.sockets.emit(action);
            return lastRun[action] = Date.now();
        }
    };
};