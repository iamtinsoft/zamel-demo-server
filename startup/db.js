const winston = require("winston");
const mysql = require("mysql2");
const config = require("config");

module.exports = function () {
  const db_host = process.env.db_host;
  const db_user = process.env.db_user;
  const db_password = process.env.db_password;
  const db_database = process.env.db_database;

  let connection = mysql.createConnection({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database,
  });
  connection.connect(function (err) {
    if (err) throw err;
    winston.info(`Connected to ${db_host}...`);
  });
  return connection;
  //connection.connect().then(() => winston.info(`Connected to ${db}...`));
};
