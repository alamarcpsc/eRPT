// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var ldap            = require('ldapjs');

// expose this function to our app using module.exports
module.exports = function(passport) {

    var users = [{"id":1, "username":"test", "password":"tester"}];

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, users[0].id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        done(null, users[0]);
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form

        username = username + "@gonzaga.edu";
        var client = ldap.createClient({
            url: "ldap://dc-ad-gonzaga.gonzaga.edu"
        });
        client.bind(username, password, function(err) {
            client.unbind();
            if (err) {
                return done(null, false, req.flash('loginMessage', 'Invalid user name or password!')); // create the loginMessage and save it to session as flashdata
            } else {
                return done(null, users[0]);
            }
        });
    }));

};
