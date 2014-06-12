/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

var querystring = require('querystring')
	, passport = require('passport')
    , util = require('util');

module.exports = function(strategy) {

    var passportStrategy = new strategy();
    
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use(passportStrategy);

    return {
        login: function(req, res) {
        	res.render('login', { login: true, message: req.flash('error') });
        },

        logout: function(req, res) {
        	req.logout();
        	res.redirect('/');
        },

        authenticate: function(req, res, next) {
        	var returnUrl = req.query.returnUrl || "/";
        	var query = querystring.stringify({ returnUrl: returnUrl });
        	passport.authenticate(passportStrategy.name, { successRedirect: returnUrl, failureRedirect: util.format('/login?%s', query), failureFlash: true })(req, res, next);
        },

        authenticated: function(req, res, next) {
          	if (req.isAuthenticated()) {
          		res.locals.user = req.user;
        		return next();
          	}
          	var query = querystring.stringify({ returnUrl: req.url });
          	res.redirect(util.format('/login?%s', query));
        }
    }
}