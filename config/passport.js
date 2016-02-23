// config/passport.js

var LocalStrategy   = require('passport-local').Strategy;
var ldap            = require('ldapjs');

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

    // =====================================
    // LOCAL LOGIN =========================
    // =====================================

    passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, username, password, done) { // callback with username and password from our form
        users[0].username = username;
        username = username + "@gonzaga.edu";
        var client = ldap.createClient({
            url: "ldap://dc-ad-gonzaga.gonzaga.edu"
        });
        client.bind(username, password, function(err) {
            client.unbind();
            if (err) {
                return done(null, false, req.flash('loginMessage', 'Invalid user name or password!')); // create the loginMessage and save it to session as flashdata
            } else {
                console.log(username + " logged in");
                return done(null, users[0]);
            }
        });
    }));

};
