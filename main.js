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
        const tables = [].slice.call(results);
        mongo.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, async (err, client) => {
            if (err) console.log('MONGO CONNECT ERROR:\n', err);
            else {
                const db = client.db(process.env.MONGO_DB);
                for (let t = 0; t < tables.length; t++){
                    const table = tables[t][`Tables_in_${process.env.MYSQL_DB}`];
                    console.log(`Dumping ${table}...`)
                    sql.query(`SELECT * FROM ${table}`, (err, results) => {
                        if (err) console.log(`An error occurred while connecting to ${table}`, err);
                        else {
                            console.log(results.length);
                        }
                    });
                }
            }
        });
    }
});

sql.end();