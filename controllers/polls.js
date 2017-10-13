const Poll = require('../models/poll');

exports.createPoll = function(req, res, next) {
  const title = req.body.title;
  const email = req.body.email;
  const options = req.body.options;

  console.log(typeof(options));

  if (!email || !options){
    return res.status(422).send({error: 'incomplete data you stupid cunt'});
  }

  const poll = new Poll ({
    title: title,
    email: email,
    options: options
  });

  poll.save(function(err){
    if (err) {return next(err)}
    return res.send(poll);
  });
}
exports.deletePoll = function(req, res, next) {
  var pollID = req.body.id;

  if (!pollID){
    return res.status(422).send({error: 'you must provide a poll id!'});
  }
  var conditions = {_id: pollID};

  Poll.fineOneAndDelete(conditions, function(err, newDoc){
    if (err){
      return res.status(422).send({error: 'uh oh an error'});
    }
    console.log(NewDoc);
    return res.status(200).send('success!');
  })
}
exports.vote = function(req, res, next) {
  var pollId = req.body.id;
  var vote = req.body.vote;
  var voter = req.body.email;
  var incValue = 1;
  //return res.status(200).send(pollId);

  if (!pollId){
    return res.status(422).send({error: 'you must provide a poll id!'});
  }
  var conditions = { "options.x" : vote };
  var update = { $inc: {"options.$.y" : incValue }};
  //var update = { options: new_options, $push: { voters: voter}};
  var options = { multi: false, "new": true};
  //var voterPush = { $push: { voters: voter} };

  Poll.findOneAndUpdate(conditions, update, options, function(err, newDoc){

    if (err) {
      console.log(err);
    };
    return res.status(200).json(newDoc);
  });
}
exports.findPoll = function(req, res, next) {
  const pollId = req.headers.id;

  if (!pollId){
    return res.status(422).send({error: 'you must provide poll id!'});
  }

  Poll.findOne({_id: pollId}, function(err, existingPoll) {
    if (err) {return next(err);}
    return res.json(existingPoll);
  });
}
exports.findAllPolls = function(req, res, next) {
  Poll.find(function (err, pollList){
    if (err) return handlerError(err);
    return res.status(200).send(pollList);
  });
}
exports.findUserPolls = function(req, res, next) {
  var userEmail = req.headers.email;
  Poll.find({'email': [userEmail]}, function (err, userPollList){
    if (err) return handlerError(err);
    return res.status(200).send(userPollList);

  })
}
