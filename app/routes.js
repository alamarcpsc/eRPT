// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/', inSession, function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('index.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/', passport.authenticate('local-login', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // HOME SECTION ========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/home', isLoggedIn, function(req, res) {
        res.render('home.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // MYBINDER SECTION ====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/myBinder', isLoggedIn, function(req, res) {
        res.render('myBinder.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // EVALUATION SECTION ==================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/evaluation', isLoggedIn, function(req, res) {
        res.render('evaluation.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // EVALUATIONEXAMPLE SECTION ===========
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/evaluationExample', isLoggedIn, function(req, res) {
        res.render('evaluationExample.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // WORKBENCH SECTION ===================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/workbench', isLoggedIn, function(req, res) {
        res.render('workbench.ejs', {
            user : req.user // get the user out of session and pass to template
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
