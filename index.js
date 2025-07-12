require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns'); // Using require for consistency
const { URL } = require('url'); // For URL parsing
const app = express();

// Basic Configuration
let db = [{}];

const port = process.env.PORT || 3000;

app.use(cors());

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;

  if (!url) {
    return res.json({ error: 'empty url' });
  }

  try {
    // Parse the URL to extract hostname
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Validate the URL using DNS lookup
    dns.lookup(hostname, (err, address) => {
      if (err) {
        console.log('DNS lookup failed:', err.message);
        return res.json({ error: 'invalid url' });
      } else {
        console.log('Submitted URL:', url);
        console.log('Resolved address:', address);

        const shortUrl = Math.floor(Math.random() * 99999) + 1;
        db.push({ short_url: shortUrl, original_url: url });
        console.log('Generated short URL ID:', shortUrl);

        res.json({
          original_url: url,
          short_url: shortUrl
        });
      }
    });
  } catch (error) {
    // Invalid URL format
    console.log('Invalid URL format:', error.message);
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:id', (req, res) => {
  const shortUrlId = req.params.id;
  console.log('Short URL ID requested:', shortUrlId);

  const entry = db.find(entry => entry.short_url == shortUrlId);

  if (!entry) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  const originalUrl = entry.original_url;
  console.log('Original URL found:', originalUrl);

  // Redirect to the original URL
  res.redirect(originalUrl);
});