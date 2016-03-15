// server.js

// set up ======================================================================
// get https ready
var fs = require('fs');
var hskey = fs.readFileSync('./certificates/erpt.gonzaga.edu.key');
var hscert = fs.readFileSync('./certificates/www_erpt_gonzaga_edu_cert.cer')
var credentials = {
    key: hskey,
    cert: hscert
};

// get all the tools we need
var express   = require('express');
var app       = express();
var http      = require("http");
var https     = require("https");
var httpPort  = process.env.PORT || 80;
var httpsPort = process.env.PORT || 443;
var passport  = require('passport');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use(express.static('public')); // allows a public folder

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'RuPerT2016', // session secret
    cookie: { maxAge: 2700000 } // set timeout to 45 min
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
var httpServer  = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// start http server
httpServer.listen(httpPort);
httpServer.on('error', function(err) {
    console.log('error:' + err);
});
httpServer.on('listening', function(){
    console.log('Listening on port: ' + httpPort);
});

// start https server
httpsServer.listen(httpsPort);
httpsServer.on('error', function(err) {
    console.log('error:' + err);
});
httpsServer.on('listening', function(){
    console.log('Listening on port: ' + httpsPort);
});
