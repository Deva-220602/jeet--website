require('dotenv').config(); // Must be first

const path = require('path');
const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer'); // 1. Added Nodemailer module

const app = express();

// ======================
// NODEMAILER SETUP
// ======================
// 2. Configured the email sender using secure environment variables
const transporter = nodemailer.createTransport({
    host: '://gmail.com',
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ======================
// DATABASE CONNECTION
// ======================

console.log("Database Configuration:");
console.log({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

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

// ======================
// TEST CONNECTION
// ======================

pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ MySQL Connection Failed:");
        console.error(err);
        return;
    }

    console.log("✅ Connected to Aiven MySQL Successfully!");

    connection.query("SELECT DATABASE() AS db", (err, result) => {
        if (err) {
            console.error("Database Check Error:", err);
        } else {
            console.log("Connected Database:", result[0].db);
        }
    });

    connection.release();
});

// ======================
// CREATE TABLE
// ======================

const createTableQuery = `
CREATE TABLE IF NOT EXISTS jeet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    contact VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

pool.query(createTableQuery, (err, result) => {
    if (err) {
        console.error("❌ Table Creation Error:");
        console.error(err);
        return;
    }

    console.log("✅ Table 'jeet' verified/created successfully!");
});

// ======================
// SHOW TABLES
// ======================

pool.query("SHOW TABLES", (err, rows) => {
    if (err) {
        console.error("❌ Error fetching tables:");
        console.error(err);
        return;
    }

    console.log("Available Tables:");
    console.table(rows);
});

// ======================
// MIDDLEWARE
// ======================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// ======================
// ROUTES
// ======================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'WEBSITE.html'));
});

// ======================
// SAVE FORM DATA & SEND EMAIL
// ======================

app.post('/submit-form', (req, res) => {

    const { name, company, contact, email, address } = req.body;

    console.log("\n--- New Form Submission ---");
    console.log({
        name,
        company,
        contact,
        email,
        address
    });

    const sqlQuery = `
        INSERT INTO jeet
        (name, company, contact, email, address)
        VALUES (?, ?, ?, ?, ?)
    `;

    pool.query(
        sqlQuery,
        [name, company, contact, email, address],
        (err, result) => {

            if (err) {
                console.error("❌ Insert Error:");
                console.error(err);

                return res.status(500).send(`
                    <h1>Database Error</h1>
                    <p>Could not save data.</p>
                `);
            }

            console.log("✅ Record inserted successfully!");
            console.log("Inserted ID:", result.insertId);

            // 3. Send immediate success response to stop browser loading spin
            res.send(`
                <h1>Success!</h1>
                <p>Your data has been saved successfully.</p>
            `);

            // 4. Construct the team notification email layout
            const mailOptions = {
                from: `"Website Form" <${process.env.EMAIL_USER}>`,
                to: `${process.env.HR_EMAIL}, ${process.env.COLLEAGUE_EMAIL}`, 
                subject: `New Lead: ${name} from ${company || 'N/A'}`,
                html: `
                    <h2>New Form Submission Logged (ID: ${result.insertId})</h2>
                    <table border="1" cellpadding="10" style="border-collapse: collapse; font-family: sans-serif;">
                        <tr style="background-color: #f2f2f2;"><td><strong>Field</strong></td><td><strong>Value</strong></td></tr>
                        <tr><td><strong>Name</strong></td><td>${name}</td></tr>
                        <tr><td><strong>Company Name</strong></td><td>${company || 'Not Provided'}</td></tr>
                        <tr><td><strong>Contact Number</strong></td><td>${contact}</td></tr>
                        <tr><td><strong>Email ID</strong></td><td>${email}</td></tr>
                        <tr><td><strong>Address</strong></td><td>${address || 'Not Provided'}</td></tr>
                    </table>
                `
            };

            // 5. Send email quietly in the background
            transporter.sendMail(mailOptions, (mailErr, info) => {
                if (mailErr) {
                    return console.error("❌ Background Email Failed to Send:", mailErr);
                }
                console.log("✅ Background notification email sent to team successfully!", info.response);
            });
        }
    );
});

// ======================
// START SERVER
// ======================

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
 
