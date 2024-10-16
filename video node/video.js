const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const port = process.env.PORT || 5003; // Use environment variable for flexibility
const baseDir = '/root/resume'; // Base directory for videos

app.use(cors());

// Endpoint to get list of videos for a specific role
app.get('/videos/:role', (req, res) => {
  const roleDir = path.join(baseDir, req.params.role);

  fs.readdir(roleDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Unable to scan directory: ' + err);
    }
    const videos = files.filter(file => file.endsWith('.webm')); // Filter video files
    res.json(videos);
  });
});

// Endpoint to serve a video file
app.get('/videos/:role/:filename', (req, res) => {
  const filePath = path.join(baseDir, req.params.role, req.params.filename);

  // Check if the file exists before trying to send it
  fs.stat(filePath, (err, stat) => {
    if (err) {
      console.error('Error checking file:', err);
      return res.status(404).send('File not found');
    }

    // Set headers for serving the video
    res.writeHead(200, {
      'Content-Type': 'video/webm',
      'Content-Length': stat.size,
    });

    // Create a readable stream and pipe it to the response
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

    // Handle stream errors
    readStream.on('error', (streamErr) => {
      console.error('Error streaming video:', streamErr);
      res.status(500).end();
    });

    // Handle request abortion
    req.on('aborted', () => {
      console.warn('Request aborted');
      readStream.destroy(); // Stop the stream if the request was aborted
    });
  });
});

// Endpoint to delete a video
app.delete('/videos/:role/:filename', (req, res) => {
  const filePath = path.join(baseDir, req.params.role, req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting video:', err);
      return res.status(500).send('Unable to delete video: ' + err);
    }
    res.status(200).send('Video deleted');
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

