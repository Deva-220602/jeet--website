const path = require('path')
const express = require('express');
const app = express();
const port = 3000;


// Middleware required to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// To make the folder containing your CSS and other files public:
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    // If 'index.html' is your website's file name:
    res.sendFile(path.join(__dirname, 'WEBSITE.html')); 
});


// Route to receive data from the HTML form
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

    // Response message displayed on the user's screen
    res.send('<h1>Data saved successfully!</h1>');
});

// Starting the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

