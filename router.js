const multer = require('multer');
const passport = require('passport');
const passportService = require('./services/passport');
const Authentication = require('./controllers/authentication');
const Polls = require('./controllers/polls');
const Nightlife = require('./controllers/nightlife');
const Bookclub = require('./controllers/bookclub');
const config = require('./config');
const jwt = require('express-jwt');

const upload = multer();
const requireSignin = passport.authenticate('local', {session: false});
const secret = config.shared_secret;
module.exports = function(app) {
  app.get('/', function (req, res){
    res.status(200).send('Hello!');
  });
  app.post('/signup', Authentication.signup);
  app.post('/signin', requireSignin, Authentication.signin);
  app.post('/createpoll', Polls.createPoll);
  app.post('/deletepoll', Polls.deletePoll);
  app.post('/vote', Polls.vote);
  app.post('/newoption', Polls.addNewOption);
  app.get('/findpoll', Polls.findPoll);
  app.get('/listpolls', Polls.findAllPolls);
  app.get('/listuserpolls', Polls.findUserPolls);
  //nightlife
  app.get('/nightlife', Nightlife.test);
  app.get('/nightlife/getcity', Nightlife.getRestaurants);
  app.post('/nightlife/rsvp', Nightlife.rsvp);
  //booktrade
  app.post('/bookclub/addbook', upload.single('avatar'), Bookclub.addBook);
}
