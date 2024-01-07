// index.js
// where your node app starts

// init project
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const {lookup} = require('dns');
const mongoDb = require('./db.mongo.js');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res) {
  let originalUrl = req.body.url || '';
  // remove the slash at the end of the URL if exists
  originalUrl = originalUrl.trim().replace(/\/$/, '');

  if (!originalUrl) {
    return res.json({error: 'invalid url'});
  }

  // add https:// if missing
  if (!/^https?:\/\//.test(originalUrl)) {
    originalUrl = 'https://' + originalUrl;
  }

  // remove http:// or https://
  let hostname = originalUrl.replace(/^https?:\/\//, '');

  lookup(hostname, function(err) {
    // If you pass an invalid URL that doesn't follow the valid `http://www.example.com` format, the JSON response will contain `{ error: 'invalid url' }`
    if (err) {
      return res.json({error: err});
    }

    // You can POST a URL to `/api/shorturl` and get a JSON response
    // with `original_url` and `short_url` properties. Here's an example:
    // `{ original_url : 'https://freeCodeCamp.org', short_url : 1}`
    mongoDb.findSiteByOriginalUrl(originalUrl, (err, doc) => {
      if (err) {
        return mongoDb.createAndSaveSite(originalUrl, (err, doc) => {
          if (err) {
            return res.json({'error': 'invalid url'});
          }

          res.json({original_url: originalUrl, short_url: doc._id});
        });
      }

      res.json({original_url: originalUrl, short_url: doc._id});
    });
  });
});

app.get('/api/shorturl/:id', function(req, res) {
  // When you visit `/api/shorturl/<short_url>`, you will be redirected to the original URL.
  var shortUrl = req.params.id;

  if (!shortUrl || (shortUrl != parseInt(shortUrl))) {
    return res.json({'error': 'Wrong format'});
  }

  mongoDb.findSiteByShortUrl(shortUrl, (err, doc) => {
    if (err) {
      return res.json({'error': 'No short URL found for the given input'});
    }

    res.redirect(doc.original_url);
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
