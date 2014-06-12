/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

var express = require('express')
    , socketio = require('socket.io')
    , hbs = require('hbs')
    , nconf = require('nconf')
    , path = require('path')
    , passport = require('passport')
    , flash = require('connect-flash')
    , http = require('http')
    , fs = require('fs');

// Configuration
nconf.argv().env();
if (fs.existsSync(path.join(__dirname, 'user.json'))) {
    nconf.file('user', path.join(__dirname, 'user.json'));
}
nconf.file('global', path.join(__dirname, 'config.json'));

// Variables
var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);
var sessionStore = new express.session.MemoryStore();
var reloadPaths = [path.join(__dirname, 'static'), path.join(__dirname, 'views')];

// Configuration
app.configure(function() {
    app.locals.title = "XenClient™ XT";
    app.set('views', __dirname + '/views');
    app.set('view engine', 'hbs');
    app.use(express.bodyParser());
    app.use(express.cookieParser('sync-wui'));
    app.use(express.session({ store: sessionStore, cookie: { httpOnly: false } }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'static')));
});

// Development
if (nconf.get("environment") == "debug") {
    app.use(express.static(path.join(__dirname, '../')));
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
    reloadPaths.push(path.join(__dirname, '../widgets'));
    app.locals.suffix = "?" + Date.now();
} else {
    app.locals.release = true;
}
// need to put this somewhere else with a file watcher if we want to support icon addition/deletion after server is started
app.locals.defaulticons = fs.readdirSync("./static/images/vms/default");
app.locals.defaultwallpapers = fs.readdirSync("./static/images/wallpaper/default");
app.locals.pluginicons = fs.readdirSync("./static/images/vms/plugins");
app.locals.pluginwallpapers = fs.readdirSync("./static/images/wallpaper/plugins");

// Libraries
var strategy = require('./lib/passport-ldap').Strategy;
var account = require('./controllers/account')(strategy);
var controllers = require('./controllers/index');
var dataAdapter = require('./data_access/sync-ui-helper');
require('./lib/socket-wrapper')(io, sessionStore, dataAdapter);
require('./lib/live-reload')(io, reloadPaths);
require('./lib/hbs-block')(hbs);

// Routes
app.get('/', account.authenticated, controllers("home"));
app.get('/login', account.login);
app.get('/logout', account.logout);
app.post('/login', account.authenticate); 

// Start
var address = nconf.get("address");
if(address && address != "") {
    server.listen(nconf.get("port"), nconf.get("address"), function() {
        console.log("node server listening on port " + nconf.get("port") + " and address " + nconf.get("address"));
    });
} else {
    server.listen(nconf.get("port"), function() {
        console.log("node server listening on port " + nconf.get("port"));
    });
}
