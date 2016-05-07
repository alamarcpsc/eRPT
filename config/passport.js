// config/passport.js

var fs              = require('fs');
var LocalStrategy   = require('passport-local').Strategy;
var ldap            = require('ldapjs');
var sql             =
    require("mssql");

var dbConfig = {
    server: "PC106-4B\\SQLEXPRESS",
    database: "eRPT",
    user: "test",
    password: "testpassword",
    port: 1433
};

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
        console.log(user.username + " logged in");
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        var conn = new sql.Connection(dbConfig);
        var request = new sql.Request(conn);

        conn.connect(function (err) {
            if (err) {
                console.log("Error: couldn't connect to the db");
                return done(null, err);
            }
            else {
                var queryString = "SELECT person_Zagweb_ID from dbo.Person where dbo.Person.person_ID = " + id;
                request.query(queryString, function (err, username) {
                    if (err) {
                        console.log("Error: invalid query");
                        conn.close();
                        return done(null, err);
                    }
                    else {
                        if (username[0] != null) {
                            username[0].person_Zagweb_ID = username[0].person_Zagweb_ID.replace(/\s/g, '');
                            var user = {
                                username : username[0].person_Zagweb_ID,
                                id : id
                            }
                            conn.close();
                            done(null, user);
                            console.log(user.username + " made a request");
                        }
                        else {
                            console.log("Error: user not in database");
                            conn.close();
                            return done(null, false);
                        }
                    }
                });
            }
        });
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

        email = username + "@gonzaga.edu";

        var tlsOptions = {
            rejectUnauthorized : false,
            ca : fs.readFileSync('./certificates/dc-ad-gonzaga.cer')
        }
        var client = ldap.createClient({
            url: "ldaps://dc-ad-gonzaga.gonzaga.edu",
            tlsOptions : tlsOptions
        });
        client.bind(email, password, function(err) {
            client.unbind();
            if (err) {
                return done(null, false);
            }

            var conn = new sql.Connection(dbConfig);
            var request = new sql.Request(conn);
            conn.connect(function (err) {
                if (err) {
                    console.log("Error: couldn't connect to the db");
                    return done(null, false);
                }
                var queryString = "SELECT person_Zagweb_ID from dbo.Person where dbo.Person.person_Zagweb_ID = '" + username + "'";
                request.query(queryString, function (err, name) {
                    if (err) {
                        console.log("Error: invalid query");
                        conn.close();
                        return done(null, false);
                    }
                    else if(name[0] != null) {
                        queryString = "SELECT person_ID from dbo.Person where dbo.Person.person_Zagweb_ID = '" + username + "'";
                        request.query(queryString, function (err, id) {
                            if (err) {
                                console.log("Error: invalid query");
                                conn.close();
                                return done(null, false);
                            }
                            else if(id[0] != null) {
                                var user = {
                                    username : username,
                                    id : id[0].person_ID
                                }
                                conn.close();
                                return done(null, user);
                            }
                            else {
                                console.log("Error: user not in database");
                                conn.close();
                                return done(null, false);
                            }
                        });
                    }
                    else {
                        queryString = "INSERT INTO dbo.Person(person_Zagweb_ID) VALUES ('" + username + "')";
                        request.query(queryString, function (err) {
                            if (err) {
                                console.log("Error: invalid insert new person query");
                                conn.close();
                                return done(null, false);
                            }
                        });
                        queryString = "SELECT person_ID from dbo.Person where dbo.Person.person_Zagweb_ID = '" + username + "'";
                        request.query(queryString, function (err, id) {
                            if (err) {
                                console.log("Error: invalid select new person query");
                                conn.close();
                                return done(null, false);
                            }
                            else if(id[0] != null) {
                                var user = {
                                    username : username,
                                    id : id[0].person_ID
                                }
                                conn.close();
                                return done(null, user);
                            }
                            else {
                                console.log("Error: new user not in database");
                                conn.close();
                                return done(null, false);
                            }
                        });
                    }
                });
            });
        });
    }));
};
