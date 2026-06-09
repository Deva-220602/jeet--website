require('dotenv').config(); // This must be the first line to retrieve secret details
const path = require('path');
const express = require('express');
const mysql = require('mysql2'); // Connecting the mysql2 package

const app = express();

// Aiven Online Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false } // This is strictly required for Aiven Cloud security
});

// Middleware required to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// To make the folder containing your CSS and other files public:
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    // If 'index.html' is your website's file name:
    res.sendFile(path.join(__dirname, 'WEBSITE.html')); 
});

// Route to receive data from the HTML form and save to MySQL
app.post('/submit-form', (req, res) => {
    // Extracting data using HTML 'name' attributes
    const { name, company, contact, email, address } = req.body;

    // Printing data to the console
    console.log("--- New Form Data Received ---");
    console.log(`Name: ${name}`);
    console.log(`Company: ${company}`);
    console.log(`Contact: ${contact}`);
    console.log(`Email: ${email}`);
    console.log(`Address: ${address}`);

    // SQL Query to save data into the MySQL database
    // (Note: Your table name is temporarily set as 'users_table')
    const sqlQuery = "INSERT INTO jeet (name, company, contact, email, address) VALUES (?, ?, ?, ?, ?)";
    
    pool.query(sqlQuery, [name, company, contact, email, address], (err, result) => {
        if (err) {
            console.error("Database Insertion Error: ", err);
            return res.status(500).send('<h1>Something went wrong. Data not saved!</h1>');
        }
        console.log("Data saved to Aiven MySQL Successfully!");
        // Response message displayed on the user's screen
        res.send('<h1>Data saved successfully in Database!</h1>');
    });
});

// Starting the server using Environment Port for Render hosting
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

