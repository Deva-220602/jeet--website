require('dotenv').config();
const mysql = require('mysql2');

console.log("=================================");
console.log("AIVEN MYSQL CONNECTION TEST");
console.log("=================================");

console.log("Host:", process.env.DB_HOST);
console.log("Port:", process.env.DB_PORT);
console.log("Database:", process.env.DB_NAME);
console.log("User:", process.env.DB_USER);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS jeet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    contact VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

pool.getConnection((err, connection) => {

    if (err) {
        console.error("❌ CONNECTION FAILED");
        console.error(err);
        return;
    }

    console.log("✅ CONNECTED TO AIVEN MYSQL");

    connection.query(
        "SELECT DATABASE() AS current_db",
        (err, result) => {

            if (err) {
                console.error("❌ DATABASE CHECK FAILED");
                console.error(err);
            } else {
                console.log("Current Database:", result[0].current_db);
            }

            console.log("Creating table 'jeet'...");

            connection.query(
                createTableQuery,
                (err, result) => {

                    if (err) {
                        console.error("❌ TABLE CREATION FAILED");
                        console.error(err);
                        connection.release();
                        return;
                    }

                    console.log("✅ TABLE CREATED / VERIFIED");
                    console.log(result);

                    connection.query(
                        "SHOW TABLES",
                        (err, tables) => {

                            if (err) {
                                console.error("❌ SHOW TABLES FAILED");
                                console.error(err);
                            } else {
                                console.log("\nAVAILABLE TABLES:");
                                console.table(tables);
                            }

                            connection.release();
                            pool.end();

                            console.log("\n✅ TEST COMPLETED");
                        }
                    );
                }
            );
        }
    );
});