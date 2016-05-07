var sql = require("mssql");

var dbConfig = {
    server: "PC106-4B\\SQLEXPRESS",
    database: "eRPT",
    user: "test",
    password: "testpassword",
    port: 1433
};

var exports = module.exports = {};

exports.getExample = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "SELECT * from dbo.Person where dbo.Person.person_ID = " + req.user.id;
        request.query(queryString, function (err, queryData) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.data = queryData;
                conn.close();
                return next();
            }
        });
    });
};

exports.getBinders = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        request.query("SELECT * from dbo.Binder", function (err, recordset) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.recordset = recordset;
                conn.close();
                return next();
            }
        });
    });
};

exports.getPerson = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        request.query("SELECT * from dbo.Person", function (err, recordset) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.recordset = recordset;
                conn.close();
                return next();
            }
        });
    });
};

exports.uploadDoc = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        request.query("INSERT INTO [dbo].[Files] ( file_ID, content ) SELECT NEWID(), bulkcolumn FROM OPENROWSET(BULK 'C:/test1/samplepdf.pdf', SINGLE_BLOB) AS x SELECT * FROM dbo.files", function (err, queryData) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                console.log("attempted to upload doc");
                res.file = queryData;
                conn.close();
                return next();
            }
        });
    });
};

exports.getDoc = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "SELECT content from dbo.Files WHERE file_Desc = '123Delay'";
        request.query(queryString, function (err, queryData) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                //console.log(queryData);
                res.doc = queryData;
                conn.close();
                return next();
            }
        });
    });
};



exports.getDocAndAnno = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "SELECT content from dbo.Files WHERE file_Name = 'Group4ProjectPlanFINAL.pdf'";
        //var queryString = "SELECT annotationContent from dbo.Annotations WHERE annotation_ID = 2";
        //queryString = queryString + " UNION ALL SELECT content from dbo.Files WHERE file_Name = 'Group4ProjectPlanFINAL.pdf'";
        queryString = queryString + " UNION ALL SELECT annotationContent from dbo.Annotations WHERE annotation_ID = 2";
        request.query(queryString, function (err, queryData) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                console.log(queryData);
                res.data = queryData;
                //THEN DO SECOND QUERY? LOAD RESULTS INTO DATA[1]? I'm a little confused as to why that can't or hasn't been done.
                conn.close();
                return next();
            }
        });
    });
};

exports.testerDocuments = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "SELECT File_ID from dbo.PersonBF WHERE Person_ID = " + req.user.id;
        request.query(queryString, function (err, queryData) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            for(i = 0; i < queryData.length; i++) {
                queryData[i] = queryData[i].File_ID;
            }
            queryString = "SELECT content from dbo.Files WHERE File_ID = '" + queryData[0] + "'";
            for(i = 1; i < queryData.length; i++) {
                queryString = queryString + " UNION ALL SELECT content from dbo.Files WHERE File_ID = '" + queryData[i] + "'";
            }
            request.query(queryString, function (err, data) {
                if (err) {
                    console.log(err);
                    conn.close();
                    return next();
                }
                console.log(data);
                res.data = data;
                conn.close();
                return next();
            });
        });
    });
};

exports.createNewBinder = function(req, res, next){
    var binder_Name_String = req.body.binder_Name;
    binder_Name_String = binder_Name_String.replace(/\s+/g, '');
    console.log(binder_Name_String);
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "INSERT INTO dbo.Binder(submitted_Status, binder_Name) VALUES ('Not submitted' ,'"+ req.user.username + req.user.id + "');" +
                //Insert into BinderRole table role, person_ID, binder_ID (from Binder Table)
            " INSERT INTO dbo.BinderRole(binder_Role, person_ID, binder_ID) VALUES (0, " + req.user.id +
            ", (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = +'" + req.user.username + req.user.id +"'));" +
                //Update binder_Name so we can add more binders
            " UPDATE dbo.Binder SET binder_Name = '" + binder_Name_String + "' WHERE binder_Name = '" + req.user.username + req.user.id + "';";

        //Insert into Binder table a temp name for binder, binder_ID is auto increment
        request.query(queryString, function (err, queryData) {
                if (err) {
                    console.log(err);
                    conn.close();
                    return next();
                }
                else {
                    conn.close();
                    return next();
                }
            });
    });
};

exports.getDynamicBinder = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT B.binder_Name, B.binder_ID, B.submitted_Status " +
                            "FROM dbo.Binder As B " +
                            "INNER JOIN BinderRole As BR " +
                            "ON B.binder_ID = BR.binder_ID " +
                            "INNER JOIN Person As P " +
                            "ON BR.person_ID = P.person_ID " +
                            "WHERE BR.binder_Role = '0' " +
                            "AND P.person_ID = " + req.user.id;
        request.query(queryString, function (err, binders) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.binders = binders;
                conn.close();
                return next();
            }
        });
    });
};

exports.getDynamicBinderOrganizer = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   " SELECT B.binder_Name, B.binder_ID, B.submitted_Status " +
                            " FROM dbo.Binder As B " +
                            " INNER JOIN BinderRole As BR " +
                            " ON B.binder_ID = BR.binder_ID " +
                            " INNER JOIN Person As P " +
                            " ON BR.person_ID = P.person_ID " +
                            " WHERE BR.binder_Role = '1' " +
                            " AND P.person_ID = " + req.user.id;
        request.query(queryString, function (err, binders) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.binders = binders;
                conn.close();
                return next();
            }
        });
    });
};

exports.getDynamicBinderEvaluation = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   " SELECT B.binder_Name, B.binder_ID " +
                            " FROM dbo.Binder As B " +
                            " INNER JOIN BinderRole As BR " +
                            " ON B.binder_ID = BR.binder_ID " +
                            " INNER JOIN Person As P " +
                            " ON BR.person_ID = P.person_ID " +
                            " WHERE BR.binder_Role = '2' " +
                            " AND P.person_ID = " + req.user.id;
        request.query(queryString, function (err, binders) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.binders = binders;
                conn.close();
                return next();
            }
        });
    });
};

exports.getAnno = function(req, res, next){
    console.log("req.body.binder_ID in getAnno = " + req.query.binder);
    console.log("req.user.id in getAnno = " + req.user.id);
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "SELECT annotationContent from dbo.Annotations WHERE person_ID = " + req.user.id + " AND binder_ID = " + req.query.binder;
        request.query(queryString, function (err, queryData) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.anno = queryData[0].annotationContent.slice(2);
                conn.close();
                return next();
            }
        });
    });
};

exports.addBlankAnnotation = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "INSERT INTO dbo.Annotations(binder_ID,person_ID,annotationContent) VALUES ('" + req.body.binder_ID + "','" + req.body.person_ID + "','CONVERT(varbinary(max),'0x')";
        request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                conn.close();
                return next();
            }
        });
    });
};

exports.saveAnnotation = function(req, res, next){
    var annotationContenttextString = req.body.annotationContent;
    var textConverted = '0x';
    var holdIt = '';
    for (var charN = 0; charN < annotationContenttextString.length; charN++) {

        holdIt = annotationContenttextString.charAt(charN).charCodeAt().toString(16);
        if (holdIt.length == 1) {
            holdIt = '0' + holdIt;
        }
        textConverted += holdIt;

    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "UPDATE dbo.Annotations SET annotationContent = CONVERT(varbinary(max),'" + textConverted + "') WHERE binder_ID = '" + req.body.binder_ID + "' AND person_ID = '" + req.user.id + "'";
        request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                conn.close();
                return next();
            }
        });
    });
};

exports.addFileDB = function(req, res, next){
    if (req.query.binder == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
       }
        //protect against same file names
        var queryString =   "INSERT INTO dbo.Files(file_Name, file_Desc, file_Path, file_ID, content) " +
                            "VALUES ('tempFileName" + req.user.id + "', '" + req.body.pdfDesc + "', NULL, NEWID(), CONVERT(varbinary(max),'" + req.body.pdfString + "',1))" +

                            "INSERT INTO dbo.BinderFile(binder_ID, file_ID, binder_Tab)" +
                            "VALUES(" + req.query.binder + ", (SELECT F.file_ID FROM dbo.Files as F WHERE file_Name = '" + "tempFileName" + req.user.id + "'), "+ req.body.tabToPush + ")" +

                            "INSERT INTO dbo.PersonBF(binder_ID, person_ID, level, file_ID) VALUES " +
                            "(" + req.query.binder + "," + req.user.id + " , 0, (SELECT file_ID FROM dbo.Files WHERE file_Name = +'" + "tempFileName" + req.user.id +"'))" +

                            "UPDATE dbo.Files SET file_Name = '" + req.body.pdfName + "' WHERE file_Name = 'tempFileName" +  req.user.id + "'";

        request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                setTimeout(function () {
                    conn.close();
                    return next();
                }, 2000);
            }
        });
    });
};

exports.removeFileDB = function(req, res, next){
    console.log("req.query.binder = " + req.query.binder);
    console.log("req.body.file_ID = " + req.body.file_ID);
    console.log("req.body.binder_Tab = " + req.body.binder_Tab);

    if (req.query.binder == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }


    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        //protect against same file names
        var queryString =   " DELETE FROM dbo.BinderFile WHERE binder_ID = " + req.query.binder +
                            " AND file_ID = '" + req.body.file_ID + "'" +
                            " AND binder_Tab = " + req.body.binder_Tab;

        request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                setTimeout(function () {
                    conn.close();
                    return next();
                }, 2000);
            }
        });
    });
};

exports.addFileDBEvaluation = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        //protect against same file names
        var queryString =   "INSERT INTO dbo.Files(file_Name, file_Desc, file_Path, file_ID, content) " +
            "VALUES ('tempFileName" + req.user.id + "', '" + req.body.pdfDesc + "', NULL, NEWID(), CONVERT(varbinary(max),'" + req.body.pdfString + "',1))" +

            "INSERT INTO dbo.BinderFile(binder_ID, file_ID, binder_Tab)" +
            "VALUES(" + req.query.binder + ", (SELECT F.file_ID FROM dbo.Files as F WHERE file_Name = '" + "tempFileName" + req.user.id + "'), "+ req.body.tabToPush + ")" +

            "INSERT INTO dbo.PersonBF(binder_ID, person_ID, level, file_ID) VALUES " +
            "(" + req.query.binder + "," + req.user.id + " , 2, (SELECT file_ID FROM dbo.Files WHERE file_Name = +'" + "tempFileName" + req.user.id +"'))" +

            "UPDATE dbo.Files SET file_Name = '" + req.body.pdfName + "' WHERE file_Name = 'tempFileName" +  req.user.id + "'";

       request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                console.log("adding file");
                setTimeout(function () {
                    conn.close();
                    return next();
                }, 2000);
            }
        });
    });
};

exports.getBinderFiles = function(req, res, next){
    if (req.query.binder == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT DISTINCT P.person_ID, F.content, F.file_ID, F.file_Name, BF.binder_Tab, PBF.level " +
                            "FROM [dbo].[Person] as P " +

                            "INNER JOIN PersonBF as PBF " +
                            "ON P.person_ID = PBF.person_ID " +

                            "INNER JOIN dbo.BinderRole as BR " +
                            "ON P.person_ID = BR.person_ID " +

                            "INNER JOIN dbo.Binder as B " +
                            "ON BR.binder_ID = B.binder_ID " +

                            "INNER JOIN dbo.BinderFile as BF " +
                            "ON B.binder_ID = BF.binder_ID " +

                            "INNER JOIN dbo.Files as F " +
                            "ON BF.file_ID = F.file_ID " +
                            "WHERE B.Binder_ID = " + req.query.binder +
                            "AND P.person_ID =" + req.user.id +
                            "AND PBF.level = 0 " +
                            " ORDER BY BF.binder_Tab ASC";

        request.query(queryString, function (err, binderFiles) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.binderFiles = binderFiles;
                conn.close();
                return next();
            }
        });
    });
};

exports.getBinderFilesOrganizer = function(req, res, next){
    if (req.query.binder == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT DISTINCT P.person_ID, F.content, F.file_ID, F.file_Name, BF.binder_Tab, PBF.level " +
            "FROM [dbo].[Person] as P " +

            "INNER JOIN PersonBF as PBF " +
            "ON P.person_ID = PBF.person_ID " +

            "INNER JOIN dbo.BinderRole as BR " +
            "ON P.person_ID = BR.person_ID " +

            "INNER JOIN dbo.Binder as B " +
            "ON BR.binder_ID = B.binder_ID " +

            "INNER JOIN dbo.BinderFile as BF " +
            "ON B.binder_ID = BF.binder_ID " +

            "INNER JOIN dbo.Files as F " +
            "ON BF.file_ID = F.file_ID " +

            "INNER JOIN dbo.BinderFile as BF2 " +
            "ON BF2.binder_ID = PBF.binder_ID " +

            "WHERE B.Binder_ID = " + req.query.binder +
            "AND P.person_ID = " + req.user.id +
            "AND PBF.level = 1" +
            " ORDER BY BF.binder_Tab ASC";

        request.query(queryString, function (err, binderFiles) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.binderFiles = binderFiles;
                console.log(res.binderFiles);
                conn.close();
                return next();
            }
        });
    });
};

exports.getBinderFilesEvaluation = function(req, res, next){
    /*if (req.query.binder == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }*/
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT DISTINCT P.person_ID, F.content, F.file_ID, F.file_Name, BF.binder_Tab, PBF.level " +
                            "FROM [dbo].[Person] as P " +

                            "INNER JOIN PersonBF as PBF " +
                            "ON P.person_ID = PBF.person_ID " +

                            "INNER JOIN dbo.BinderRole as BR " +
                            "ON P.person_ID = BR.person_ID " +

                            "INNER JOIN dbo.Binder as B " +
                            "ON BR.binder_ID = B.binder_ID " +

                            "INNER JOIN dbo.BinderFile as BF " +
                            "ON B.binder_ID = BF.binder_ID " +

                            "INNER JOIN dbo.Files as F " +
                            "ON BF.file_ID = F.file_ID " +

                            "INNER JOIN dbo.BinderFile as BF2 " +
                            "ON BF2.binder_ID = PBF.binder_ID " +

                            "WHERE B.Binder_ID = " + req.query.binder +
                            "AND P.person_ID = " + req.user.id +
                            "AND PBF.level = 2" +
                            " ORDER BY BF.binder_Tab ASC";

        request.query(queryString, function (err, binderFiles) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.binderFiles = binderFiles;
                conn.close();
                return next();
            }
        });
    });
};

exports.getBinderID = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        queryString = "";
       request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                req.binder_ID = req.body.binder_ID;
                req.session.binder_ID = req.body.binder_ID;
                console.log("req.session.binder_ID = " + req.session.binder_ID);
                conn.close();
                return next();
            }
        });
    });
    return next();
};


exports.getOrganizersCommittees = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "SELECT comm_Name FROM dbo.Committee AS C " +
            "INNER JOIN CommMember AS CM " +
            "ON C.comm_ID = CM.comm_ID " +
            "INNER JOIN Person AS P " +
            "ON CM.person_ID = P.person_ID " +
            "WHERE commHead = 1 " +
            "AND P.person_ID = " + req.user.id + " ORDER BY comm_Name";
        request.query(queryString, function (err, organizersCommittees) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                console.log(organizersCommittees);
                res.organizersCommittees = organizersCommittees;
                conn.close();
                return next();
            }
        });
    });
};

exports.getCommitteeEvaluators = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT person_First_Name, person_Last_Name, comm_Name, person_Zagweb_ID " +
            "FROM dbo.Person as P " +
            "INNER JOIN CommMember As CM " +
            "ON P.person_ID = CM.person_ID " +
            "INNER JOIN Committee as C " +
            "ON CM.comm_ID = C.comm_ID " +
            "ORDER BY person_Last_Name";
        request.query(queryString, function (err, committeeEvaluators) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.committeeEvaluators = committeeEvaluators;
                conn.close();
                return next();
            }
        });
    });
};

exports.getAdminCommittees = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT comm_Name, comm_ID FROM dbo.Committee " +
                            "ORDER BY comm_Name";
        request.query(queryString, function (err, allCommittees) {
           if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.allCommittees = allCommittees;
                conn.close();
                return next();
            }
        });
    });
};

exports.assignEvaluatorToCommittee = function(req, res, next){
    if(res.currentlyAnEvaluator) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var commiteeNameString = req.body.comm_Name;
        commiteeNameString = (commiteeNameString + "").trim();
        var evaluatorNameString = req.body.orgZagID;
        evaluatorNameString = (evaluatorNameString + "").trim();
        var queryString = "INSERT INTO commMember(comm_ID,person_ID,commHead) VALUES " +
            "((SELECT comm_ID FROM dbo.Committee AS C WHERE C.comm_Name = '" + commiteeNameString + "'), " +
            "(SELECT person_ID FROM dbo.Person AS P WHERE P.person_Zagweb_ID = '" + evaluatorNameString + "'), " +
            "0)";
        console.log(queryString);
        console.log(req.body.committee);
        console.log(req.body.organizer);
        request.query(queryString, function (err, newEvaluatorAssignment) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.newEvaluatorAssignment = newEvaluatorAssignment;
                conn.close();
                return next();
            }
        });
    });
};

exports.getCommitteeOrganizers = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT person_First_Name, person_Last_Name, comm_Name, person_Zagweb_ID " +
            "FROM dbo.Person as P " +
            "INNER JOIN CommMember As CM " +
            "ON P.person_ID = CM.person_ID " +
            "INNER JOIN Committee as C " +
            "ON CM.comm_ID = C.comm_ID " +
            "WHERE commHead = 1 " +
            "ORDER BY person_Last_Name";
        request.query(queryString, function (err, allOrganizers) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.allOrganizers = allOrganizers;
                conn.close();
                return next();
            }
        });
    });
};

exports.getOrganizersForSubmission = function(req, res, next){
    if (req.query.binder == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT DISTINCT P.person_ID, person_Zagweb_ID, person_First_Name, person_Last_Name " +
                            "FROM dbo.Person as P " +
                            "INNER JOIN CommMember As CM " +
                            "ON P.person_ID = CM.person_ID " +
                            "WHERE commHead = 1 " +
                            "ORDER BY person_Last_Name";
        request.query(queryString, function (err, uniqueOrganizers) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                console.log("query for organizers worked!");
                res.uniqueOrganizers = uniqueOrganizers;
                conn.close();
                return next();
            }
        });
    });
};

exports.getUniqueOrganizers = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT DISTINCT person_Zagweb_ID, person_First_Name, person_Last_Name " +
                            "FROM dbo.Person as P " +
                            "INNER JOIN CommMember As CM " +
                            "ON P.person_ID = CM.person_ID " +
                            "WHERE commHead = 1 " +
                            "ORDER BY person_Last_Name";
        request.query(queryString, function (err, uniqueOrganizers) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.uniqueOrganizers = uniqueOrganizers;
                conn.close();
                return next();
            }
        });
    });
};

exports.getUniqueCommitteeEvaluators = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT DISTINCT person_Zagweb_ID, person_First_Name, person_Last_Name " +
            "FROM dbo.Person as P " +
            "INNER JOIN CommMember As CM " +
            "ON P.person_ID = CM.person_ID " +
            "INNER JOIN Committee as C " +
            "ON CM.comm_ID = C.comm_ID " +
            "ORDER BY person_Last_Name";
        request.query(queryString, function (err, uniqueCommitteeEvaluators) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.uniqueCommitteeEvaluators = uniqueCommitteeEvaluators;
                conn.close();
                return next();
            }
        });
    });
};


exports.addCommittee = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "INSERT INTO dbo.Committee(comm_Name) VALUES ('" + req.body.comm_Name + "');";
        request.query(queryString, function (err, newCommittee) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.newCommittee = newCommittee;
                conn.close();
                return next();
            }
        });
    });
};


exports.addOrganizer = function(req, res, next){
    if (res.invalidOrganizerID || res.invalidCommName || res.alreadyAnOrganizer) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "INSERT INTO commMember(comm_ID,person_ID,commHead) VALUES " +
            "((SELECT comm_ID FROM dbo.Committee AS C WHERE C.comm_Name = '" + req.body.comm_Name + "'), " +
            "(SELECT person_ID FROM dbo.Person AS P WHERE P.person_Zagweb_ID = '" + req.body.orgZagID + "'), " +
            "1)";
        request.query(queryString, function (err, newOrganizer) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.newOrganizer = newOrganizer;
                conn.close();
                return next();
            }
        });
    });
};

exports.checkIfAlreadyInCommittee = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var userCommitteeNameString = req.body.comm_Name;
        userCommitteeNameString = (userCommitteeNameString + "").trim();
        var userOrganizerNameString = req.body.orgZagID;
        userOrganizerNameString = (userOrganizerNameString + "").trim();
        var queryString = "SELECT C.comm_Name, CM.comm_ID, CM.person_ID, CM.commHead FROM dbo.commMember AS CM " +
            "INNER JOIN dbo.Committee AS C " +
            "ON CM.comm_ID = C.comm_ID " +
            "INNER JOIN dbo.Person AS P " +
            "ON P.person_ID = CM.person_ID " +
            "WHERE P.person_Zagweb_ID = '" + userOrganizerNameString + "'";
        request.query(queryString, function (err, allCommMembers) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            for(var i = 0; i < allCommMembers.length; i++) {
                var committeeNamesString = allCommMembers[i].comm_Name;
                committeeNamesString = (committeeNamesString + "").trim();
                if ((committeeNamesString == userCommitteeNameString) && (allCommMembers[i].commHead == 1)) {
                    res.alreadyAnOrganizer = true;
                    conn.close();
                    return next();
                }
                else if ((committeeNamesString == userCommitteeNameString) && (allCommMembers[i].commHead == 0)) {
                    res.currentlyAnEvaluator = true;
                    conn.close();
                    return next();
                }
            }
            res.alreadyAnOrganizer = false;
            res.currentlyAnEvaluator = false;
            conn.close();
            return next();
        });
    });
};

exports.assignOrganizerToCommittee = function(req, res, next){
    if(res.alreadyAnOrganizer) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var commiteeNameString = req.body.committee;
        commiteeNameString = (commiteeNameString + "").trim();
        var organizerNameString = req.body.organizer;
        organizerNameString = (organizerNameString + "").trim();
        var queryString = "INSERT INTO commMember(comm_ID,person_ID,commHead) VALUES " +
            "((SELECT comm_ID FROM dbo.Committee AS C WHERE C.comm_Name = '" + commiteeNameString + "'), " +
            "(SELECT person_ID FROM dbo.Person AS P WHERE P.person_Zagweb_ID = '" + organizerNameString + "'), " +
            "1)";
        request.query(queryString, function (err, newOrganizerAssignment) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.newOrganizerAssignment = newOrganizerAssignment;
                conn.close();
                return next();
            }
        });
    });
};

exports.checkIfValidZagwebID = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "SELECT person_Zagweb_ID FROM dbo.Person";
        request.query(queryString, function (err, allZagwebs) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            for(var i = 0; i < allZagwebs.length; i++) {
                var allZagwebString = allZagwebs[i].person_Zagweb_ID;
                allZagwebString = (allZagwebString + "").trim();
                var orgZagIDString = (req.body.orgZagID + "").trim();
                if (allZagwebString == orgZagIDString) {
                    res.invalidOrganizerID = false;
                    conn.close();
                    return next();
                }
            }
            res.invalidOrganizerID = true;
            conn.close();
            return next();
        });
    });
};

exports.checkIfValidCommitteeName = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "SELECT comm_Name FROM dbo.Committee";
        request.query(queryString, function (err, committeeNames) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            for(var i = 0; i < committeeNames.length; i++) {
                var committeeNamesString = committeeNames[i].comm_Name;
                committeeNamesString = (committeeNamesString + "").trim();
                var commNameString = (req.body.comm_Name + "").trim();
                if (committeeNamesString == commNameString) {
                    res.invalidCommName = false;
                    conn.close();
                    return next();
                }
            }
            res.invalidCommName = true;
            conn.close();
            return next();
        });
    });
};

exports.checkIfValidOrganizerCommittee = function(req, res, next){
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "SELECT comm_Name FROM dbo.Committee AS C " +
            "INNER JOIN CommMember AS CM " +
            "ON C.comm_ID = CM.comm_ID " +
            "INNER JOIN Person AS P " +
            "ON CM.person_ID = P.person_ID " +
            "WHERE commHead = 1 " +
            "AND P.person_ID = " + req.user.id + " ORDER BY comm_Name";
        request.query(queryString, function (err, organizersCommittees) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            for(var i = 0; i < organizersCommittees.length; i++) {
                var organizersCommitteesString = organizersCommittees[i].comm_Name;
                organizersCommitteesString = (organizersCommitteesString + "").trim();
                var commNameString = (req.body.comm_Name + "").trim();
                if (organizersCommitteesString == commNameString) {
                    res.invalidCommName = false;
                    conn.close();
                    return next();
                }
            }
            res.invalidCommName = true;
            conn.close();
            return next();
        });
    });
};

exports.addEvaluator = function(req, res, next){
    if (res.invalidOrganizerID || res.invalidCommName || res.currentlyAnEvaluator) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = "INSERT INTO commMember(comm_ID,person_ID,commHead) VALUES " +
            "((SELECT comm_ID FROM dbo.Committee AS C WHERE C.comm_Name = '" + req.body.comm_Name + "'), " +
            "(SELECT person_ID FROM dbo.Person AS P WHERE P.person_Zagweb_ID = '" + req.body.orgZagID + "'), " +
            "0)";
        request.query(queryString, function (err, newOrganizer) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            else {
                res.newOrganizer = newOrganizer;
                conn.close();
                return next();
            }
        });
    });
};

exports.delayPeriod = function(req, res, next){
    setTimeout(function(){console.log("delayed for now");},2500);
    return next();
    //CAN WIPE, TRIED TO DO DELAY
};

exports.validBinderQuery = function(req, res, next){
    res.invalid = true;
    if (req.query.binder == null) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT B.binder_Name, B.binder_ID " +
            "FROM dbo.Binder As B " +
            "INNER JOIN BinderRole As BR " +
            "ON B.binder_ID = BR.binder_ID " +
            "INNER JOIN Person As P " +
            "ON BR.person_ID = P.person_ID " +
            "WHERE BR.binder_Role = '0' " +
            "AND P.person_ID = " + req.user.id +
            "AND B.binder_ID = " + req.query.binder;
        request.query(queryString, function (err, queryData) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            if (queryData[0] == null) {
                res.invalid = true;
                conn.close();
                return next();
            }
            else {
                res.invalid = false;
                conn.close();
                return next();
            }

        });
    });
};

exports.validBinderPost = function(req, res, next){
    res.invalid = true;
    if (req.body.binder_ID == null) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT B.binder_Name, B.binder_ID " +
            "FROM dbo.Binder As B " +
            "INNER JOIN BinderRole As BR " +
            "ON B.binder_ID = BR.binder_ID " +
            "INNER JOIN Person As P " +
            "ON BR.person_ID = P.person_ID " +
            "WHERE BR.binder_Role = '0' " +
            "AND P.person_ID = " + req.user.id +
            "AND B.binder_ID = " + req.body.binder_ID;
        request.query(queryString, function (err, queryData) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            if (queryData[0] == null) {
                res.invalid = true;
                conn.close();
                return next();
            }
            else {
                res.invalid = false;
                conn.close();
                return next();
            }

        });
    });
};

exports.validBinderQueryOrganizer = function(req, res, next){
    res.invalid = true;
    if (req.query.binder == null) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT B.binder_Name, B.binder_ID " +
            "FROM dbo.Binder As B " +
            "INNER JOIN BinderRole As BR " +
            "ON B.binder_ID = BR.binder_ID " +
            "INNER JOIN Person As P " +
            "ON BR.person_ID = P.person_ID " +
            "WHERE BR.binder_Role = '1' " +
            "AND P.person_ID = " + req.user.id +
            "AND B.binder_ID = " + req.query.binder;
        request.query(queryString, function (err, queryData) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            if (queryData[0] == null) {
                console.log("invalid binder");
                res.invalid = true;
                conn.close();
                return next();
            }
            else {
                res.invalid = false;
                conn.close();
                return next();
            }

        });
    });
};

exports.validBinderPostOrganizer = function(req, res, next){
    res.invalid = true;
    if (req.body.binder_ID == null) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT B.binder_Name, B.binder_ID " +
            "FROM dbo.Binder As B " +
            "INNER JOIN BinderRole As BR " +
            "ON B.binder_ID = BR.binder_ID " +
            "INNER JOIN Person As P " +
            "ON BR.person_ID = P.person_ID " +
            "WHERE BR.binder_Role = '1' " +
            "AND P.person_ID = " + req.user.id +
            "AND B.binder_ID = " + req.body.binder_ID;
        request.query(queryString, function (err, queryData) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            if (queryData[0] == null) {
                console.log("invalid binder");
                res.invalid = true;
                conn.close();
                return next();
            }
            else {
                res.invalid = false;
                conn.close();
                return next();
            }

        });
    });
};

exports.validBinderEvaluation = function(req, res, next){
    if (req.query.binder == null) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString =   "SELECT B.binder_Name, B.binder_ID " +
            "FROM dbo.Binder As B " +
            "INNER JOIN BinderRole As BR " +
            "ON B.binder_ID = BR.binder_ID " +
            "INNER JOIN Person As P " +
            "ON BR.person_ID = P.person_ID " +
            "WHERE BR.binder_Role = '2' " +
            "AND P.person_ID = " + req.user.id +
            "AND B.binder_ID = " + req.query.binder;
        request.query(queryString, function (err, queryData) {
            if (err) {
                console.log(err);
                conn.close();
                return next();
            }
            if (queryData[0] == null) {
                console.log("invalid binder");
                res.invalid = true;
                conn.close();
                return next();
            }
            else {

                res.invalid = false;
                conn.close();
                return next();
            }

        });
    });
};

exports.clone = function(req, res, next){
    if (req.body.binder_ID == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        console.log("binder_ID to clone: " + req.body.binder_ID);
        var queryStringBinder =      "INSERT INTO dbo.Binder(submitted_Status, binder_Name) VALUES ('Cloned','"+ req.user.username + req.user.id + "');";

        var queryStringBinderRole = " INSERT INTO dbo.BinderRole(binder_Role, person_ID, binder_ID) VALUES (0, " + req.user.id +
                                    ", (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = +'" + req.user.username + req.user.id +"'));";

        var queryStringBinderFile = //binder_Tab 3: (we do this because it is difficult to select multiple at once)
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 3), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 3))" +

                                    //binder_Tab 4: (we do this because it is difficult to select multiple at once)
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                    //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                    //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 4), " +

                                    //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 4))" +

                                    //binder_Tab 5:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    "(SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 5), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 5)) " +

                                    //binder_Tab 6:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 6), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 6)) " +

                                        //binder_Tab 7:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 7), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 7)) " +

                                        //binder_Tab 8:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 8), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 8)) " +

                                        //binder_Tab 9:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 9), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 9)) " +

                                        //binder_Tab 10:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 10), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 10)) ";

                                    //personBF binder_Tab = 3
        var queryStringPersonBF =   " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 3 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                    //personBF binder_Tab = 4
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 4 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                    //personBF binder_Tab = 5
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 5 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                    //personBF binder_Tab = 6
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 6 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                    //personBF binder_Tab = 7
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 7 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                    //personBF binder_Tab = 8
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 8 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                    //personBF binder_Tab = 9
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 9 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                    //personBF binder_Tab = 10
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 10 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                    //update the binder name
                                    " UPDATE dbo.Binder SET binder_Name = REPLACE(LTRIM(RTRIM((SELECT binder_Name FROM Binder WHERE binder_ID =" + req.body.binder_ID + "))), '  ', ' ') + '_copy'  WHERE binder_Name = '" + req.user.username + req.user.id + "'";
        var queryString = queryStringBinder + queryStringBinderRole + queryStringBinderFile + queryStringPersonBF;
        request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                console.log("error occured!");
                conn.close();
                return next();
            }
            else {
                console.log("binder cloned.");
                conn.close();
                return next();
            }

        });
    });
};

exports.cloneForSubmission = function(req, res, next){
    if (req.body.binder_ID == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        console.log("binder_ID to clone: " + req.body.binder_ID);
        var queryStringBinder =      "INSERT INTO dbo.Binder(submitted_Status, binder_Name) VALUES ('Cloned','"+ req.user.username + req.user.id + "');";

        var queryStringBinderRole = " INSERT INTO dbo.BinderRole(binder_Role, person_ID, binder_ID) VALUES (0, " + req.user.id +
                                    ", (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = +'" + req.user.username + req.user.id +"'));";

        var queryStringBinderFile = //binder_Tab 3: (we do this because it is difficult to select multiple at once)
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 3), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 3))" +

                                        //binder_Tab 4: (we do this because it is difficult to select multiple at once)
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 4), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 4))" +

                                        //binder_Tab 5:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    "(SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 5), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 5)) " +

                                        //binder_Tab 6:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 6), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 6)) " +

                                        //binder_Tab 7:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 7), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 7)) " +

                                        //binder_Tab 8:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 8), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 8)) " +

                                        //binder_Tab 9:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 9), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 9)) " +

                                        //binder_Tab 10:
                                    " INSERT INTO dbo.binderFile(binder_ID, file_ID, binder_Tab) " +
                                    " VALUES (" +
                                        //binder_ID
                                    " (SELECT binder_ID FROM dbo.Binder " +
                                    " WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +

                                        //file_ID
                                    " (SELECT file_ID FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + " AND binder_Tab = 10), " +

                                        //binder_TAB
                                    " (SELECT binder_Tab FROM dbo.BinderFile as BF " +
                                    " WHERE BF.binder_ID = " + req.body.binder_ID + "AND binder_Tab = 10)) ";

        //personBF binder_Tab = 3
        var queryStringPersonBF =   " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 3 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                        //personBF binder_Tab = 4
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 4 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                        //personBF binder_Tab = 5
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 5 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                        //personBF binder_Tab = 6
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 6 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                        //personBF binder_Tab = 7
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 7 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                        //personBF binder_Tab = 8
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 8 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                        //personBF binder_Tab = 9
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 9 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                        //personBF binder_Tab = 10
                                    " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(0,(SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id +"'), " +
                                    req.user.id + ", " +

                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 10 AND binder_ID = " +
                                    " (SELECT binder_ID FROM dbo.Binder WHERE binder_Name = '" + req.user.username + req.user.id + "') ) ) " +

                                        //update the binder name
                                    " UPDATE dbo.Binder SET submitted_Status ='Submitted', binder_Name = REPLACE(LTRIM(RTRIM((SELECT binder_Name FROM Binder WHERE binder_ID =" + req.body.binder_ID + "))), '  ', ' ') + '_copy'  WHERE binder_Name = '" + req.user.username + req.user.id + "'";
        var queryString = queryStringBinder + queryStringBinderRole + queryStringBinderFile + queryStringPersonBF;
        request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                console.log("error occured!");
                conn.close();
                return next();
            }
            else {
                console.log("binder cloned.");
                conn.close();
                return next();
            }

        });
    });
};

exports.rename = function(req, res, next){
    if (req.body.binder_ID == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }
    var binder_Name_String = req.body.binder_Name;
    binder_Name_String = binder_Name_String.replace(/\s+/g, '');
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryString = " UPDATE dbo.Binder SET binder_Name = '" + binder_Name_String + "' WHERE binder_ID = '" + req.body.binder_ID + "';";
        request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                console.log("error occured!");
                conn.close();
                return next();
            }
            else {
                console.log("binder renamed to " + binder_Name_String);
                conn.close();
                return next();
            }

        });
    });
};

exports.removeApplicantBinder = function(req, res, next){
    if (req.body.binder_ID == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }
    var binder_Name_String = req.body.binder_Name;
    binder_Name_String = binder_Name_String.replace(/\s+/g, '');
    console.log("binder_ID to delete: " + req.body.binder_ID);
    console.log("binder_Name to delete: " + binder_Name_String);
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        console.log("binder_ID to Rename: " + req.body.binder_ID);
        var queryString = "DELETE FROM dbo.Binder WHERE binder_ID = " + req.body.binder_ID + " AND binder_Name = '" + binder_Name_String + "'";
        request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                console.log("error occured!");
                conn.close();
                return next();
            }
            else {
                console.log("query worked!");
                conn.close();
                return next();
            }

        });
    });
};

exports.submitBinderToOrganizer = function(req, res, next){
    if (req.body.binder_ID == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }

    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~binder submitted: " + req.body.binder_ID);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~organizer chosen: " + req.body.organizer_ID);
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryStringBinderRole =         " UPDATE dbo.BinderRole " +
                                            " SET binder_Role = 1, person_ID = " + req.body.organizer_ID +
                                            " WHERE binder_ID = " + req.body.binder_ID;

        var queryStringPersonBF =           " UPDATE dbo.PersonBF " +
                                            " SET level = 1, person_ID =  " + req.body.organizer_ID +
                                            " WHERE binder_ID = " + req.body.binder_ID;

        var queryStringBinder =             " UPDATE dbo.Binder " +
                                            " SET submitted_Status = 'Not submitted to evaluators' " +
                                            " WHERE binder_ID = " + req.body.binder_ID;

        var queryString = queryStringBinderRole + queryStringPersonBF + queryStringBinder;

        request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                console.log("error occured!");
                conn.close();
                return next();
            }
            else {
                console.log("submitting to organizer!");
                conn.close();
                return next();
            }
        });
    });
};

exports.submitBinderToOrganizerFromOrganizer = function(req, res, next){
    if (req.body.binder_ID == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }

    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~binder submitted: " + req.body.binder_ID);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~organizer chosen: " + req.body.organizer_ID);
    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryStringBinder =     " INSERT INTO dbo.BinderRole(binder_ID, binder_Role, person_ID) " +
                                    " VALUES (" + req.body.binder_ID + ", 1, " + req.body.organizer_ID + ")";


        //var queryStringPersonBF =   " UPDATE dbo.PersonBF " +
        //                            " SET level = 1, person_ID =  " + req.body.organizer_ID +
        //                            " WHERE binder_ID = " + req.body.binder_ID;


        var queryStringPersonBF =   " INSERT INTO dbo.PersonBF(level, binder_ID, person_ID, file_ID) " +
                                    " VALUES(2," + req.body.binder_ID +", " + req.body.organizer_ID + ", " +
                                    " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 3 AND binder_ID = " + req.body.binder_ID + "))";



        //var queryStringPersonBF = "";
        var queryString = queryStringBinder + queryStringPersonBF;

        request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                console.log("error occured!");
                conn.close();
                return next();
            }
            else {
                console.log("submitting to organizer from organizer!");
                conn.close();
                return next();
            }
        });
    });
};

exports.releaseBinderToEvaluators = function(req, res, next){

    if (req.body.binder_ID == null) {
        return next();
    }
    if (res.invalid) {
        return next();
    }

    var conn = new sql.Connection(dbConfig);
    var request = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Error: couldn't connect to the db");
            return next();
        }
        var queryEvaluatorBinderRole =  " INSERT INTO dbo.BinderRole(binder_ID, person_ID, binder_Role) " +
                                        " SELECT " + req.body.binder_ID + ", C.person_ID, 2 " +
                                        " FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0";

                                        // binder_Tab = 0
        var queryEvaluatorPersonBF =    " INSERT INTO dbo.PersonBF(level, binder_ID, file_ID, person_ID) " +
                                        " SELECT 2, " + req.body.binder_ID + ", " +
                                        " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 0 AND binder_ID = " + req.body.binder_ID + ")," +
                                        " C.person_ID FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0 " +

                                        // binder_Tab = 1
                                        " INSERT INTO dbo.PersonBF(level, binder_ID, file_ID, person_ID) " +
                                        " SELECT 2, " + req.body.binder_ID + ", " +
                                        " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 1 AND binder_ID = " + req.body.binder_ID + ")," +
                                        " C.person_ID FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0 " +

                                        // binder_Tab = 2
                                        " INSERT INTO dbo.PersonBF(level, binder_ID, file_ID, person_ID) " +
                                        " SELECT 2, " + req.body.binder_ID + ", " +
                                        " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 2 AND binder_ID = " + req.body.binder_ID + ")," +
                                        " C.person_ID FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0 " +

                                        // binder_Tab = 3
                                        " INSERT INTO dbo.PersonBF(level, binder_ID, file_ID, person_ID) " +
                                        " SELECT 2, " + req.body.binder_ID + ", " +
                                        " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 3 AND binder_ID = " + req.body.binder_ID + ")," +
                                        " C.person_ID FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0 " +

                                        // binder_Tab = 4
                                        " INSERT INTO dbo.PersonBF(level, binder_ID, file_ID, person_ID) " +
                                        " SELECT 2, " + req.body.binder_ID + ", " +
                                        " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 4 AND binder_ID = " + req.body.binder_ID + ")," +
                                        " C.person_ID FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0 " +

                                        // binder_Tab = 5
                                        " INSERT INTO dbo.PersonBF(level, binder_ID, file_ID, person_ID) " +
                                        " SELECT 2, " + req.body.binder_ID + ", " +
                                        " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 5 AND binder_ID = " + req.body.binder_ID + ")," +
                                        " C.person_ID FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0 " +

                                        // binder_Tab = 6
                                        " INSERT INTO dbo.PersonBF(level, binder_ID, file_ID, person_ID) " +
                                        " SELECT 2, " + req.body.binder_ID + ", " +
                                        " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 6 AND binder_ID = " + req.body.binder_ID + ")," +
                                        " C.person_ID FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0 " +

                                        // binder_Tab = 7
                                        " INSERT INTO dbo.PersonBF(level, binder_ID, file_ID, person_ID) " +
                                        " SELECT 2, " + req.body.binder_ID + ", " +
                                        " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 7 AND binder_ID = " + req.body.binder_ID + ")," +
                                        " C.person_ID FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0 " +

                                        // binder_Tab = 8
                                        " INSERT INTO dbo.PersonBF(level, binder_ID, file_ID, person_ID) " +
                                        " SELECT 2, " + req.body.binder_ID + ", " +
                                        " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 8 AND binder_ID = " + req.body.binder_ID + ")," +
                                        " C.person_ID FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0 " +

                                        // binder_Tab = 9
                                        " INSERT INTO dbo.PersonBF(level, binder_ID, file_ID, person_ID) " +
                                        " SELECT 2, " + req.body.binder_ID + ", " +
                                        " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 9 AND binder_ID = " + req.body.binder_ID + ")," +
                                        " C.person_ID FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0 " +

                                        // binder_Tab = 10
                                        " INSERT INTO dbo.PersonBF(level, binder_ID, file_ID, person_ID) " +
                                        " SELECT 2, " + req.body.binder_ID + ", " +
                                        " (SELECT file_ID FROM dbo.binderFile BF WHERE binder_Tab = 10 AND binder_ID = " + req.body.binder_ID + ")," +
                                        " C.person_ID FROM CommMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0 ";

        var queryAddBlankAnnotation =   " INSERT INTO dbo.Annotations(binder_ID, annotationContent, person_ID) " +
                                        " SELECT " + req.body.binder_ID + ", CONVERT(varbinary(max),'0x'), " + "C.person_ID " +
                                        " FROM commMember C " +
                                        " WHERE comm_ID = " + req.body.comm_ID + " AND commHead = 0";

        var queryStringUpdateSubmittedStatus = "UPDATE dbo.Binder SET submitted_Status = 'Submitted to Evaluation Committee' WHERE binder_ID = " + req.body.binder_ID;
        var queryString = queryEvaluatorBinderRole + queryEvaluatorPersonBF + queryAddBlankAnnotation + queryStringUpdateSubmittedStatus;
        request.query(queryString, function (err) {
            if (err) {
                console.log(err);
                console.log("error occured!");
                conn.close();
                return next();
            }
            else {
                console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~binder to udpate: " + req.body.binder_ID);
                console.log("Committee selected: " + req.body.comm_ID);
                conn.close();
                return next();
            }

        });
    });
};

