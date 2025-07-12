require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
  // Access the URL from the form submission
  const url = req.body.url;
  console.log('Submitted URL:', url);

  if (!url) {
    return res.json({ error: 'invalid url' });
  }

  const shortUrl = Math.floor(Math.random() * 99999) + 1;
  db.push({ short_url: shortUrl, original_url: url });
  console.log('Generated short URL ID:', shortUrl);

  res.json({
    original_url: url,
    short_url: shortUrl
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const shortUrlId = req.params.id;
  console.log('Short URL ID requested:', shortUrlId);

  const originalUrl = db.find(entry => entry.short_url == shortUrlId)?.original_url;
  console.log('Original URL found:', originalUrl)

  res.redirect(originalUrl);

  res.json({
    original_url: originalUrl,
    short_url: shortUrlId
  });
});