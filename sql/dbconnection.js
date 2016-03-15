var sql = require("mssql");

var dbConfig = {
    server: "PC106-4B\\SQLEXPRESS",
    database: "eRPT",
    user: "test",
    password: "testpassword",
    port: 1433
};

module.exports = {
    getBinders: function(req, res, next){
        var conn = new sql.Connection(dbConfig);
        var req = new sql.Request(conn);

        conn.connect(function (err) {
            if (err) {
                console.log("Error: couldn't connect to the db");
                return next();
            }
            req.query("SELECT * from dbo.Binder", function (err, recordset) {
                if (err) {
                    console.log(err);
                    return next();
                }
                else {
                    res.recordset = recordset;
                    return next();
                }
                conn.close();
                return next();
            });
        });
    },
    getName: function(username){
        var conn = new sql.Connection(dbConfig);
        var request = new sql.Request(conn);

        conn.connect(function (err) {
            if (err) {
                console.log("Error: couldn't connect to the db");
                req = "1";
                return;
            }
            var queryString = "SELECT person_Zagweb_ID from dbo.Person where dbo.Person.person_Zagweb_ID = '" + username + "'";
            request.query(queryString, function (err) {
                if (err) {
                    console.log("Error: couldn't find the username");
                    req = "2";
                    return;
                }
                else {
                    req = "3";
                    return;
                }
                conn.close();
                return;
            });
        });
    }
}
