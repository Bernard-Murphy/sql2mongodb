const mysql = require('mysql');
const mongo = require('mongodb').MongoClient;
const crypto = require('crypto');



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

                id = () => new Promise((resolve, reject) => {
                    /**
                     * Returns random hex string length 16 for mongo ID
                     */
                    crypto.randomBytes(16, (err, buffer) => {
                        if (err){
                            console.log(err);
                            reject();
                        } else resolve(buffer.toString('hex'));
                    });
                });

                dumpTable = table => new Promise((resolve, reject) => sql.query(`SELECT * FROM ${table}`, async (err, results) => {
                    if (err){
                        console.log(`An error occurred while connecting to ${table}`, err);
                        return reject();
                    } 
                    else {
                        try {
                            for (let i = 0; i < results.length; i++) {
                                const _id = await id();
                                await db.collection(table).insertOne({
                                    _id: _id,
                                    ...results[i]
                                });
                            }
                            return resolve();
                        } catch(err){
                            console.log(err);
                            return reject();
                        }
                    }
                }));

                for (let t = 0; t < tables.length; t++){
                    const table = tables[t][`Tables_in_${process.env.MYSQL_DB}`];
                    console.log(`Dumping ${table}...`)
                    await dumpTable(table);
                }
                client.close();
                sql.end();
            }
        });
    }
});
