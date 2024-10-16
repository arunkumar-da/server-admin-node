// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4012;

app.use(cors());
app.use(bodyParser.json());

let otpStore = {}; // Temporary storage for OTPs

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

// Send OTP via Email
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  otpStore[email] = otp;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'info@systemian.com', // Your email
    pass: 'dckprwvrsxekzkfz',                // Your password
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Use environment variable
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  console.log('Sending email with options:', mailOptions); // Log mail options

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP', error: error.toString() });
  }
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] === otp) {
    delete otpStore[email]; // Clear OTP after verification
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

// SSL options
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.noraasoft.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.noraasoft.com/fullchain.pem'),
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Server running on https://www.noraasoft.com:${PORT}`);
});

