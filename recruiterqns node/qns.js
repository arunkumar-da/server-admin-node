const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5019; // Use environment variable for port

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'systemian',
  password: 'systemian',
  database: 'question'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

// Get all questions
app.get('/questions', (req, res) => {
  db.query('SELECT * FROM question', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Add a new question
app.post('/questions', (req, res) => {
  const { role, qns } = req.body;
  db.query('INSERT INTO question (role, qns) VALUES (?, ?)', [role, qns], (err) => {
    if (err) throw err;
    res.status(201).send('Question added');
  });
});

// Delete a question based on role and question
app.delete('/questions', (req, res) => {
  const { role, question } = req.body;
  db.query('DELETE FROM question WHERE role = ? AND qns = ?', [role, question], (err) => {
    if (err) {
      return res.status(500).send('Error deleting question');
    }
    res.send('Question deleted');
  });
});

// SSL options
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.noraasoft.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.noraasoft.com/fullchain.pem'),
};

// Start the server
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`Server is running on https://www.noraasoft.com:${port}`);
});

