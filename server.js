import fs from 'fs';
import path from 'path';
import express from 'express';
import request from 'request-promise';

import { PORT, SERVER_URL } from './config';

// Get Meta from Request
const getMetaFromUrl = async (path) => {
  // Get Meta for Trip
  if (path.indexOf('/trip/') === 0) {
    let id = path.substr(6);
    if (id.indexOf('/') !== -1) {
      id = id.substr(0, id.indexOf('/'));
    }
    if (id.length === 24) {
      const tripMeta = await getTripMeta(id);
      if (tripMeta) {
        return tripMeta;
      }
    }
  }

  // Get Meta for Profile

  // Return Default Meta
  return `
    <!-- for Google -->
    <meta name="description" content="MakeTrail Website" />
    <meta name="keywords" content="travel, hotel, tour, plan, flight, video, maketrail" />
    <meta name="copyright" content="MakeTrail" />
    <meta name="application-name" content="MakeTrail" />

    <!-- for Facebook -->
    <meta property="fb:app_id" content="573300052811759" />
    <meta property="og:title" content="MakeTrail Website" />
    <meta property="og:type" content="article" />
    <meta property="og:image" content="http://static.maketrail.com/noImage/trip/1.jpg" />
    <meta property="og:url" content="http://maketrail.com" />
    <meta property="og:description" content="New way to explore the world" />

    <!-- for Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="MakeTrail Website" />
    <meta name="twitter:description" content="New way to explore the world" />
    <meta name="twitter:image" content="http://static.maketrail.com/noImage/trip/1.jpg" />
  `;
}

// Get Trip Meta
const getTripMeta = async (id) => {
  var options = {
    method: 'POST',
    uri: SERVER_URL,
    form: { query: `{viewer{Trip(id: "${id}"){id,name,previewPhotoUrl}}}` }
  };

  try {
    const body = await request(options);
    const result = JSON.parse(body);
    if (result.data.viewer.Trip) {
      const trip = result.data.viewer.Trip;
      const metaStr = `
      <!-- for Google -->
      <meta name="description" content="${trip.name}" />
      <meta name="keywords" content="travel, video, maketrail" />
      <meta name="copyright" content="MakeTrail" />
      <meta name="application-name" content="MakeTrail" />
      <!-- for Facebook -->
      <meta property="fb:app_id" content="573300052811759" />
      <meta property="og:title" content="${trip.name}" />
      <meta property="og:type" content="article" />
      <meta property="og:image" content="${trip.previewPhotoUrl.replace('%s', '')}" />
      <meta property="og:url" content="http://maketrail.com/trip/${trip.id}" />
      <meta property="og:description" content="MakeTrail Trip" />
      <!-- for Twitter -->
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="${trip.name}" />
      <meta name="twitter:description" content="MakeTrail Trip" />
      <meta name="twitter:image" content="${trip.previewPhotoUrl.replace('%s', '')}" />
      `;
      return metaStr;
    }
    return false;
  } catch(e) {
    return false;
  }
}

// Read HTML File Content
const getHtml = () => {
  const filePath = path.join(__dirname, '../maketrail-web/build/index.html');
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, 'utf8', function(err, data) {
      if (err) {
        reject(err);
      }
      return resolve(data);
    });
  });
}

// Express Middleware & Router
const app = express();

let wrap = fn => (...args) => fn(...args).catch(args[2]);

app.use('*', wrap(async (req, res, next) => {
  // Get HTML Default
  let data = '';
  try {
    data = await getHtml();
  } catch(e) {
    res.send('Welcome to MakeTrail.com');
    next();
  }

  // Insert Meta Tags
  try {
    const metaData = await getMetaFromUrl(req.params[0]);
    data = data.replace('<!-- Share Meta -->', metaData);
  } catch(e) {
    data = data.replace('<!-- Share Meta -->', '');
  }

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(data);
  res.end();
  next();
}));

app.get('/', function() {});

app.listen(PORT, function() {
  console.log('API Server is running at localhost:%s', PORT);
});
