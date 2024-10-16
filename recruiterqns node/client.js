const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5016; // Use environment variable for flexibility

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: '127.0.0.1', // Fixed typo from '127.0.01' to '127.0.0.1'
  user: 'systemian',
  password: 'systemian',
  database: 'client'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

// Get all clients
app.get('/client', (req, res) => {
  db.query('SELECT * FROM customers', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// DELETE endpoint to remove a client
app.delete('/client', (req, res) => {
  const { email } = req.body; // Assuming email is unique for deletion
  db.query('DELETE FROM customers WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Client deleted successfully' });
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

