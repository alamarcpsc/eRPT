// app/routes.js

dbconnection = require("../sql/dbconnection.js");

module.exports = function(app, passport) {

    // redirects http to https
    app.all('*', ensureSecure);

    // =====================================
    // LOGIN ===============================
    // =====================================
    app.get('/', inSession, function(req, res) {
        res.render('index.ejs');
    });

    app.post('/', passport.authenticate('local-login', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the login page if there is an error
    }));

    // =====================================
    // HOME ================================
    // =====================================
    app.get('/home', isLoggedIn, function(req, res) {
        res.render('home.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // MYBINDER ============================
    // =====================================
    app.get('/myBinder', isLoggedIn, function(req, res) {
        res.render('myBinder.ejs', {
            user : req.user
        });
    });

    // =====================================
    // TESTER ==============================
    // =====================================
    app.get('/tester', isLoggedIn, dbconnection.getBinders, function(req, res) {
        res.render('tester.ejs', {
            user : req.user,
            recordset : res.recordset
        });
    });

    // =====================================
    // 2013BINDER ==========================
    // =====================================
    app.get('/2013Binder', isLoggedIn, function(req, res) {
        res.render('2013Binder.ejs', {
            user : req.user
        });
    });

    // =====================================
    // FILLEDBINDER ========================
    // =====================================
    app.get('/filledBinder', isLoggedIn, function(req, res) {
        res.render('filledBinderExample.ejs', {
            user : req.user
        });
    });

    // =====================================
    // BINDERSUBMISSION ==========================
    // =====================================
    app.get('/binderSubmission', isLoggedIn, function(req, res) {
        res.render('binderSubmission.ejs', {
            user : req.user
        });
    });

    // =====================================
    // newBinder ==========================
    // =====================================
    app.get('/newBinder', isLoggedIn, function(req, res) {
        res.render('newBinder.ejs', {
            user : req.user
        });
    });

    // =====================================
    // ORGANIZER ===========================
    // =====================================
    app.get('/organizer', isLoggedIn, function(req, res) {
        res.render('organizer.ejs', {
            user : req.user
        });
    });

    // =====================================
    // ORGANIZE EXAMPLE ====================
    // =====================================
    app.get('/organizeExample', isLoggedIn, function(req, res) {
        res.render('organizeExample.ejs', {
            user : req.user
        });
    });

    // =====================================
    // EVALUATION ==========================
    // =====================================
    app.get('/evaluation', isLoggedIn, function(req, res) {
        res.render('evaluation.ejs', {
            user : req.user
        });
    });

    // =====================================
    // EVALUATION EXAMPLE ==================
    // =====================================
    app.get('/evaluationExample', isLoggedIn, function(req, res) {
        res.render('evaluationExample.ejs', {
            user : req.user
        });
    });

    // =====================================
    // HELP ================================
    // =====================================
    app.get('/help', isLoggedIn, function(req, res) {
        res.render('help.ejs', {
            user : req.user
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    // if they aren't redirect them to the index page
    if (req.isAuthenticated()) {
        req.session.lastAccess = new Date().getTime();
        return next();
    } else {
        res.redirect('/');
    }
}

// route middleware to redirect to /home if in session
function inSession(req, res, next) {
    // if user is authenticated redirect them to the home page
    // if they aren't, carry on
    if (req.isAuthenticated()) {
        res.redirect('/home');
    } else {
        return next();
    }
}

// route middleware to redirect http to https
function ensureSecure(req, res, next){
    if(req.secure){
        return next();
    } else {
        res.redirect('https://'+req.host+req.url); // handle port numbers if non 443
    }
}
