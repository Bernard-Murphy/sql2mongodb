const mysql = require('mysql');
const mongo = require('mongodb').MongoClient;

const sql = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
})

sql.connect();

sql.query('SHOW TABLES', (err, results) => {
    if (err) console.log('error', err);
    else {
        console.log(results);
    }
});

sql.end();