var sql = require("mssql");

var dbConfig = {
    server: "PC106-4B\\SQLEXPRESS",
    database: "eRPT",
    user: "test",
    password: "testpassword",
    port: 1433
};

module.exports = {
    getEMP: function(req, res, next){
        var conn = new sql.Connection(dbConfig);
        var req = new sql.Request(conn);

        conn.connect(function (err) {
            if (err) {
                console.log(err);
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
    }
}
