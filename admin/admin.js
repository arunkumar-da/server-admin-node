const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = 4011;

// Middleware
app.use(cors());
app.use(express.json()); // Use express.json() to parse JSON bodies

// Database connection
const dbConnection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'systemian',
    password: 'systemian',
    database: 'admin'
});

dbConnection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Authentication endpoint
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const query = 'SELECT * FROM admin WHERE email = ?';
    dbConnection.query(query, [email], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database query failed.' });
        }

        if (results.length > 0) {
            const user = results[0];
            // Directly compare the password (assuming passwords are stored in plaintext, which is not recommended)
            if (user.password === password) {
                return res.status(200).json({ message: 'Authentication successful.', user });
            } else {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }
        } else {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
    });
});

// SSL options
const sslOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/www.noraasoft.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.noraasoft.com/fullchain.pem')
};

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Server running on https://www.noraasoft.com:${PORT}`);
});

