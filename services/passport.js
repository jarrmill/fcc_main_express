const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const TwitterStrategy = require('passport-twitter');

const localOptions = { usernameField: 'email'};
const localLogin = new LocalStrategy(localOptions, function(email, password, done){
  console.log("Deciding access for user: ", email);
  User.findOne({email: email}, function (err, user){
    if (err) { return done(err); }
    if (!user) { return done(null, false); }

    user.comparePassword(password, function(err, isMatch) {
        if (err) { return done(err); }
        if (!isMatch) {  return done(null, false); }

	return done(null, user);
    });
  });
});

const twitterKey = process.env.TWITTER_CONSUMER_KEY;
const twitterSecret = process.env.TWITTER_CONSUMER_SECRET;

const twitterLogin = new TwitterStrategy({
  consumerKey: twitterKey,
  consumerSecret: twitterSecret,
  callbackURL: "https://pacific-scrubland-65914.herokuapp.com/twitter/callback"
}, function(token, tokenSecret, profile, cb){
    User.findOrCreate({ email: profile.id}, function(err, user)
    {
      return cb(err, user);
    });
  });
passport.use(twitterLogin);
passport.use(localLogin);
