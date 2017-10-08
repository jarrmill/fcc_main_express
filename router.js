const passport = require('passport');
const passportService = require('./services/passport');
const Authentication = require('./controllers/authentication');
const Polls = require('./controllers/polls');

const requireSignin = passport.authenticate('local', {session: false});

module.exports = function(app) {
  app.get('/', function (req, res){
    res.status(200).send('Hello!');
  });
  app.post('/signup', Authentication.signup);
  app.post('/signin', requireSignin, Authentication.signin);
  app.post('/createpoll', Polls.createPoll);
  app.post('/vote', Polls.vote);
  app.get('/findpoll', Polls.findPoll);
  app.get('/listpolls', Polls.findAllPolls);
  app.get('/listuserpolls', Polls.findUserPolls);
}
