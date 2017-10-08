const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const uristring = process.env.MONGODB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:auth/auth';
const router = require('./router');
app.set('port', (process.env.PORT || 3091));

app.use(cors());
app.use(bodyParser.json({ type: '*/*'}));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

mongoose.connect(uristring, function(err, res){
  if (err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uristring);
  }
});
router(app);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
