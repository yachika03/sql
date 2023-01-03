var mysql = require("mysql");
var conn = mysql.createConnection({
    host : "localhost",
    user:"root",
    password:"",
    database: "sql_login_page"
});
console.log("mysql is connected ")

module.exports = conn;