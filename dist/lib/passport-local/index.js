/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

var passport = require('passport')
    , nconf = require('nconf')
    , util = require('util');

var users = nconf.get("passport-local:users");

function Strategy(options) {
    options = options || {};

    this._usernameField = options.usernameField || 'username';
    this._passwordField = options.passwordField || 'password';

    passport.Strategy.call(this);
    this.name = 'local';
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req) {

    var username = req.body[this._usernameField];
    var password = req.body[this._passwordField];

    if (!username || !password) {
        return this.fail(new Error('Missing Username or password'));
    }

    var self = this;

    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        if (user.username === username && user.password === password) {
            return self.success({ username: username, displayName: user.displayname });
        }
    }

    self.fail(new Error("Incorrect Username or password"));
};

exports.Strategy = Strategy;