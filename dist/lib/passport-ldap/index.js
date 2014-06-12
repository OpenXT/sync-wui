/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

var passport = require('passport')
    , nconf = require('nconf')
    , util = require('util')
    , ldapAuth = require('ldapauth');

var ldap = new ldapAuth({
    url: nconf.get("ldap:url"),
    adminDn: nconf.get("ldap:adminDn"),
    adminPassword: nconf.get("ldap:adminPassword"),
    searchBase: nconf.get("ldap:searchBase"),
    searchFilter: util.format("(%s={{username}})", nconf.get("ldap:searchMap")),
    cache: true
});

function Strategy(options) {
    options = options || {};

    this._usernameField = options.usernameField || 'username';
    this._passwordField = options.passwordField || 'password';

    passport.Strategy.call(this);
    this.name = 'ldap';
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req) {

    var username = req.body[this._usernameField];
    var password = req.body[this._passwordField];

    if (!username || !password) {
        return this.fail(new Error('Missing Username or password'));
    }

    var self = this;

    ldap.authenticate(username, password, function (err, user) {
        if (err) {
            console.log(err.message);
            self.fail(new Error("Incorrect Username or password"));
        } else {
            self.success({ username: username, displayName: user.displayName });
        }
    });
};

exports.Strategy = Strategy;