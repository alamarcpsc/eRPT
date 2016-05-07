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
        failureRedirect : '/' // redirect back to the login page if there is an error
    }));

    // =====================================
    // HOME ================================
    // =====================================
    app.get('/home', isLoggedIn, function(req, res) {
        res.render('home.ejs', {
            user : req.user // get the user out of the session and pass to the template
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
    // ADMIN ===============================
    // =====================================
    app.get('/admin', isLoggedIn, dbconnection.getAdminCommittees, dbconnection.getCommitteeOrganizers, dbconnection.getUniqueOrganizers, function(req, res) {
        res.render('admin.ejs', {
            user : req.user,
            allCommittees : res.allCommittees,
            allOrganizers : res.allOrganizers,
            uniqueOrganizers : res.uniqueOrganizers
        });
    });

    app.post('/adminAddCommittee', isLoggedIn, dbconnection.addCommittee, function(req, res) {
        res.redirect('/admin');
    });

    app.post('/adminAddOrganizer', isLoggedIn, dbconnection.checkIfValidZagwebID, dbconnection.checkIfValidCommitteeName, dbconnection.checkIfAlreadyInCommittee, dbconnection.addOrganizer, function(req, res) {
        res.redirect('/admin');
    });

    app.post('/adminAssignOrganizerToCommittee', isLoggedIn, dbconnection.checkIfAlreadyInCommittee, dbconnection.assignOrganizerToCommittee, function(req, res) {
        res.redirect('/admin');
    });

    // =====================================
    // ADMIN VIEW ==========================
    // =====================================
    app.get('/adminView', isLoggedIn, dbconnection.getAdminCommittees, dbconnection.getCommitteeOrganizers, function(req, res) {
        res.render('adminView.ejs', {
            user : req.user,
            allCommittees : res.allCommittees,
            allOrganizers : res.allOrganizers
        });
    });

    // =====================================
    // TESTERADAM ==========================
    // =====================================
    app.get('/testerAdam', isLoggedIn, function(req, res) {
        var passedVariable = req.query.valid;
        console.log(passedVariable);
        res.render('testerAdam.ejs', {
            user : req.user
        });
    });

    app.post('/testerAdam', isLoggedIn, function(req, res) {
        var string = encodeURIComponent(req.body.input);
        res.redirect('/testerAdam/?valid=' + string);
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
    // ORGANIZER ===========================
    // =====================================
    //get organizer page
    app.get('/organizer', isLoggedIn, dbconnection.getDynamicBinderOrganizer, function(req, res) {
        res.render('organizer.ejs', {
            user : req.user,
            data : res.data,
            binders : res.binders
        });
    });

    //post open organizer page
    app.post('/organizerOPEN', isLoggedIn, function(req, res) {
        var string = encodeURIComponent(req.body.binder_ID);
        res.redirect('/organizerViewBinder/?binder=' + string);
    });

    /*
    //post clone organizer page
    app.post('/organizerCLONE', isLoggedIn, dbconnection.validBinderPostOrganizer, dbconnection.clone, function(req, res) {
        res.redirect('/organizer');
    });
    */

    // =====================================
    // ORGANIZER BINDER=====================
    // =====================================
    //get organizer binder page
    app.get('/organizerViewBinder', isLoggedIn, dbconnection.validBinderQueryOrganizer, dbconnection.getBinderFilesOrganizer, dbconnection.getAdminCommittees, dbconnection.getOrganizersForSubmission, function(req, res) {
        if (req.query.binder == null) {
            res.redirect('/organizer');
        }
        else if (res.invalid) {
            res.redirect('/organizer');
        }
        else {
            res.render('binderTemplateOrganizer.ejs', {
                user : req.user,
                binderFiles : res.binderFiles,
                binder_ID : req.query.binder,
                binder_Name : req.query.binder_Name,
                allCommittees : res.allCommittees,
                uniqueOrganizers: res.uniqueOrganizers
            });
        }
    });

    //post add file organizer binder page
    app.post('/organizerViewBinder', isLoggedIn, dbconnection.validBinderQueryOrganizer, dbconnection.addFileDB, function(req, res) {
        if (req.query.binder == null) {
            res.redirect('/organizer');
        }
        else if (res.invalid) {
            res.redirect('/organizer');
        }
        else {
            var string = encodeURIComponent(req.query.binder);
            res.redirect('/organizerViewBinder/?binder=' + string);
        }
    });

    //post remove file binder page
    app.post('/organizerViewBinderREMOVE', isLoggedIn, dbconnection.validBinderQueryOrganizer, dbconnection.removeFileDB, function(req, res) {
        console.log("In /organizerViewBinderREMOVE");
        if (req.query.binder == null) {
            res.redirect('/organizer');
        }
        else if (res.invalid) {
            res.redirect('/organizer');
        }
        else {
            var string = encodeURIComponent(req.query.binder);
            res.redirect('/organizerViewBinder/?binder=' + string);
        }
    });

    app.post('/releaseBinderToEvaluators', isLoggedIn, dbconnection.releaseBinderToEvaluators, function(req, res) {
        console.log(res.invalid);
        console.log(req.body.binder_ID);
        res.redirect('/organizer');
    });

    app.post('/submitBinderToOrganizerFromOrganizer', isLoggedIn, dbconnection.validBinderPostOrganizer, dbconnection.submitBinderToOrganizerFromOrganizer, function(req, res) {
        res.redirect('/organizer');
    });

    // =====================================
    // ORGANIZER EDIT ======================
    // =====================================
    app.get('/organizerEdit', isLoggedIn, dbconnection.getOrganizersCommittees, dbconnection.getUniqueCommitteeEvaluators, function(req, res) {
        res.render('organizerEdit.ejs', {
            user : req.user,
            organizersCommittees : res.organizersCommittees,
            uniqueCommitteeEvaluators : res.uniqueCommitteeEvaluators
        });
    });

    app.post('/organizerAddEvaluator', isLoggedIn, dbconnection.checkIfValidZagwebID, dbconnection.checkIfValidOrganizerCommittee, dbconnection.checkIfAlreadyInCommittee, dbconnection.addEvaluator, function(req, res) {
        res.redirect('/organizerEdit');
    });

    app.post('/organizerAssignEvaluatorToCommittee', isLoggedIn, dbconnection.checkIfAlreadyInCommittee, dbconnection.assignEvaluatorToCommittee, function(req, res) {
        res.redirect('/organizerEdit');
    });

    // =====================================
    // ORGANIZER VIEW ======================
    // =====================================
    app.get('/organizerView', isLoggedIn, dbconnection.getOrganizersCommittees, dbconnection.getCommitteeEvaluators, function(req, res) {
        res.render('organizerView.ejs', {
            user : req.user,
            organizersCommittees : res.organizersCommittees,
            committeeEvaluators : res.committeeEvaluators
        });
    });

    // =====================================
    // ORGANIZE EXAMPLE ====================
    // =====================================
    app.get('/organizerExample', isLoggedIn, function(req, res) {
        res.render('organizerExample.ejs', {
            user : req.user
        });
    });

    // =====================================
    // ORGANIZER SUBMIT ====================
    // =====================================
    app.get('/organizerSubmit', isLoggedIn, function(req, res) {
        res.render('organizerSubmit.ejs', {
            user : req.user
        });
    });

    // =====================================
    // EVALUATION ==========================
    // =====================================

    // =====================================
    // EVALUATION BINDER====================
    // =====================================

    app.get('/evaluation', isLoggedIn, dbconnection.getDynamicBinderEvaluation, function(req, res) {
        res.render('evaluation.ejs', {
            user : req.user,
            data : res.data,
            binders : res.binders
        });
    });


    app.get('/evaluationViewBinder', isLoggedIn, dbconnection.validBinderEvaluation, dbconnection.getBinderFilesEvaluation, dbconnection.getAnno, function(req, res) {
        if (req.query.binder == null) {
            res.redirect('/evaluation');
        }
        else if (res.invalid) {
            res.redirect('/evaluation');
        }
        else {
            res.render('binderTemplateEvaluation.ejs', {
                user : req.user,
                binderFiles : res.binderFiles,
                binder_ID : req.query.binder,
                annotations : res.anno,
                binder_Name : req.query.binder_Name
            });
        }
    });

    app.post('/evaluationOPEN', isLoggedIn, function(req, res) {
        var string = encodeURIComponent(req.body.binder_ID);
        res.redirect('/evaluationViewBinder/?binder=' + string);
    });

    app.post('/evaluationViewBinder', isLoggedIn, dbconnection.addFileDBEvaluation, function(req, res) {
        var string = encodeURIComponent(req.query.binder);
        res.redirect('/evaluationViewBinder/?binder=' + string);
    });

    app.post('/submitAnnotation', isLoggedIn, dbconnection.saveAnnotation,  function(req,res) {
        var string = encodeURIComponent(req.body.binder_ID);
        res.redirect('/evaluationViewBinder/?binder=' + string);
    });

    // =====================================
    // EVALUATION EXAMPLE ==================
    // =====================================
    app.get('/evaluationExample', isLoggedIn, dbconnection.getDoc, dbconnection.getAnno, function(req, res) {
        res.render('evaluationExample.ejs', {
            user : req.user,
            documents : res.doc,
            annotations : res.anno
        });
    });

    // =====================================
    // DYNAMICBINDER =======================
    // =====================================
    //get dynamic binder page
    app.get('/dynamicBinder', isLoggedIn, dbconnection.getDynamicBinder, function(req, res) {
        res.render('dynamicBinder.ejs', {
            user : req.user,
            data : res.data,
            binders : res.binders
        });
    });

    //post open binder dynamic binder page
    app.post('/dynamicBinderOPEN', isLoggedIn, function(req, res) {
        var string = encodeURIComponent(req.body.binder_ID);
        res.redirect('/Binder/?binder=' + string);
    });

    //post create binder dynamic binder page
    app.post('/createNewBinder', isLoggedIn, dbconnection.createNewBinder, function(req, res) {
        res.redirect('/dynamicBinder');
    });

    //post delete binder dynamic binder page
    app.post('/removeApplicantBinder', isLoggedIn, dbconnection.validBinderPost, dbconnection.removeApplicantBinder, function(req, res) {
        res.redirect('/dynamicBinder');
    });

    //post clone binder dynamic binder page
    app.post('/dynamicBinderCLONE', isLoggedIn, dbconnection.validBinderPost, dbconnection.clone, function(req, res) {
        res.redirect('/dynamicBinder');
    });

    //post rename binder dynamic binder page
    app.post('/dynamicBinderRENAME', isLoggedIn, dbconnection.validBinderPost, dbconnection.rename, function(req, res) {
        res.redirect('/dynamicBinder');
    });

    // =====================================
    // BINDER ==============================
    // =====================================
    //get binder page
    app.get('/Binder', isLoggedIn, dbconnection.validBinderQuery, dbconnection.getBinderFiles, dbconnection.getOrganizersForSubmission, function(req, res) {
        if (req.query.binder == null) {
            res.redirect('/dynamicBinder');
        }
        else if (res.invalid) {
            res.redirect('/dynamicBinder');
        }
        else {
            res.render('binderTemplate.ejs', {
                user : req.user,
                binderFiles : res.binderFiles,
                binder_ID : req.query.binder,
                binder_Name : req.query.binder_Name,
                uniqueOrganizers: res.uniqueOrganizers
            });
        }
    });

    //post add file binder page
    app.post('/Binder', isLoggedIn, dbconnection.validBinderQuery, dbconnection.addFileDB, function(req, res) {
        if (req.query.binder == null) {
            res.redirect('/dynamicBinder');
        }
        else if (res.invalid) {
            res.redirect('/dynamicBinder');
        }
        else {
            var string = encodeURIComponent(req.query.binder);
            res.redirect('/Binder/?binder=' + string);
        }
    });

    //post remove file binder page
    app.post('/BinderREMOVE', isLoggedIn, dbconnection.validBinderQuery, dbconnection.removeFileDB, function(req, res) {
        console.log("In /BinderREMOVE");
        if (req.query.binder == null) {
            res.redirect('/dynamicBinder');
        }
        else if (res.invalid) {
            res.redirect('/dynamicBinder');
        }
        else {
            var string = encodeURIComponent(req.query.binder);
            res.redirect('/Binder/?binder=' + string);
        }
    });

    //post submit binder page
    app.post('/submitBinderToOrganizer', isLoggedIn, dbconnection.validBinderPost, dbconnection.cloneForSubmission, dbconnection.submitBinderToOrganizer, function(req, res) {
        res.redirect('/dynamicBinder');
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

    // =====================================
    // 404 =================================
    // =====================================
    app.get('*', function(req, res){
        res.redirect('/home');
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
