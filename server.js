const express = require('express');

const common = require('./public/scripts/platform/common.js');
const node = require('./public/scripts/platform/node.js');
const handlers = require('./public/scripts/routes/root.js');

const app = express();
const getCompiledTemplate = common.getCompiledTemplate;

const assetPath = 'public/assets/';
const dataPath = 'public/data/';

getCompiledTemplate(`${assetPath}templates/body.html`);




app.get('/', (req, res, next) => {
    handlers.root(dataPath, assetPath)
      .then(response => node.responseToExpressStream(res, response));         
});








function checkHttps(req, res, next) {
  // protocol check, if http, redirect to https
  if(req.get('X-Forwarded-Proto').indexOf("https")!=-1) {
    return next();
  } else {
    res.redirect('https://' + req.hostname + req.url);
  }
}

app.all('*', checkHttps);
app.use(express.static('public'));
app.listen(8080);