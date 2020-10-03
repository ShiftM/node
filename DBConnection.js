const  mysql = require('mysql');


function getConnection () {
    var connection = mysql.createConnection({
        host:"testdatabase-1.c7rplytalvfe.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "12345678",
        port: "3306",
    });
    return connection;
}

module.exports.getConnection = getConnection;