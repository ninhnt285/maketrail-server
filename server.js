import fs from 'fs';
import path from 'path';
import express from 'express';

import { PORT } from './config';

const app = express();

function renderTrip(urlPath) {
  let id = urlPath.replace('/trip/');
  if (id.indexOf('/') !== -1) {
    id = id.substr(0, id.indexOf('/'));
  }
  
}

app.use('*', (req, res) => {
  const filePath = path.join(__dirname, '../maketrail-web/build/index.html');
  fs.readFile(filePath, 'utf8', function(err, data) {
    if (err) {
      throw err;
    }

    let type = 'default';

    if (req.params[0].indexOf('/trip/') === 0) {
      type = 'trip';
    }

    if (req.params[0].indexOf('/profile/') === 0) {
      type = 'profile';
    }

    const newData = data.replace('<!-- Share Meta -->', `<!--Share Meta Replace ${type}-->`);

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(newData);
    res.end();
  });
});

app.get('/', function() {

});

app.listen(PORT, function() {
  console.log('API Server is running at localhost:%s', PORT);
});
