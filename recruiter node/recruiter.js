// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5015;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create MySQL connection for employees
const dbEmployees = mysql.createConnection({
  host: '127.0.0.1',
  user: 'systemian',
  password: 'systemian',
  database: 'employees'
});

// Create MySQL connection for questions
const dbQuestion = mysql.createConnection({
  host: '127.0.0.1',
  user: 'systemian',
  password: 'systemian',
  database: 'question'
});

// Connect to MySQL for employees
dbEmployees.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the employees database');
});

// Connect to MySQL for questions
dbQuestion.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the questions database');
});

// Endpoint to fetch roles
app.get('/api/roles', (req, res) => {
  const query = 'SELECT DISTINCT role FROM question';
  dbQuestion.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching roles:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Endpoint to add a recruiter
app.post('/api/recruiter', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const query = 'INSERT INTO employees (email, password) VALUES (?, ?)';
  dbEmployees.query(query, [email, password], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Recruiter added successfully', id: result.insertId });
  });
});

// SSL options
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.noraasoft.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.noraasoft.com/fullchain.pem'),
};

// Start the server
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Server is running on https://www.noraasoft.com:${PORT}`);
});

