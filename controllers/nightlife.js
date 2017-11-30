const request = require('request');
const rp = require('request-promise');
const Restaurant = require('../models/Restaurant');
const Promise = require('bluebird');
const https = require('https');
const _ = require('lodash');
const moment = require('moment');

const bt = "ESnoZK_asVC0oAPVx9kNmcDn7kxNimeQcagnVQXcshMyah-l3sUtiD_GmDF0ml4u3WQHKgElCgHsPHPzW3zhcF-Pjl25XOSC1eGGbx8ErFAeEvGfX7PMyjbSxpvqWXYx";
const url_root = "https://api.yelp.com/v3/businesses/search";
const term = "bars";

//====================================================
//Export Functions (Routes)
//====================================================
exports.test = function(req, res, next) {
  return res.status(200).send("Welcome to get city!!!");
}

//this is really convoluted code, so Sorry
//this wouldn't be so difficult if I could run a scheduler on Heroku's Mongo MLab
//but I can't, so I have to do resets, comparisons and logic here.
exports.getRestaurants = function(req, res, next){
  if (!req.headers.city){
    return res.status(406).send("Please attach a city header with city name");
  }
  var cityName = req.headers.city;
  console.log("--STEP 1--");
  console.log("-Check to see if restaurants already exist for city");
  console.log("----------");
  var doRestsExist = doCityRestaurantsExist(cityName);
  doRestsExist.exec(function(err, rests){
    if(err){console.log(err)};
    if(rests[0]){
    ///Rests do exist, need to check for freshness
      console.log("***Step 1 Complete");
      console.log("--STEP 2--");
      console.log("--Checking for Freshness--");
      console.log("----------");
      var string = "Results found for city of " + cityName;
      //if Rests are current, send them. If not, get new rests (old ones are deleted);
      if(checkForFreshness(rests[0])){
        console.log("--STEP 3--");
        console.log("--Sending Final Results");
        console.log("\nDone!\n");
        return res.status(200).json(rests);
      }else{
        getCity(cityName).then(results => {
          createRestaurantsByCity(results, cityName).then(() =>{
            var finalCheck = doCityRestaurantsExist(cityName);
            finalCheck.exec(function(err, rests){
              if(err){console.log(err)};
              if(rests[0]){
                console.log("--STEP 3--");
                console.log("--Sending Fresh Results--");
                console.log("\nDone!\n");
                res.status(200).json(rests);
              }
              else{
                res.status(200).send("Something went wrong with final update");
              }
            });
          }).catch(err=>{
            console.log(err);
            res.status(200).send("Something went wrong with final promise/update");
          });
        }).catch(err =>{
          console.log("Error creating results");
          return res.status(200).send(null);
        });
      }
    }else{
      console.log("--STEP 2.B--");
      console.log("Generate new results");
      console.log("------------");
      getCity(cityName).then(results => {
        createRestaurantsByCity(results, cityName).then(() =>{
          var finalCheck = doCityRestaurantsExist(cityName);
          finalCheck.exec(function(err, rests){
            if(err){console.log(err)};
            if(rests[0]){
              console.log("--STEP 3--");
              console.log("--Sending Fresh Results");
              res.status(200).json(rests);
            }
            else{
              res.status(200).send("Something went wrong with final update");
            }
          });
        }).catch(err=>{
          console.log(err);
          res.status(200).send("Something went wrong with final promise/update");
        });
      }).catch(err =>{
        console.log("Error creating results");
        return res.status(200).send(null);
      });
    };
  });
};
exports.rsvp = function(req, res, next){
  console.log("RSVP change request received.");
  if(!req.body.rsvps || !req.body.id) {
    res.status(406).send("Please rsvp array & restaurant id in body.");
  }
  var newRSVPS = req.body.rsvps;
  var query = {_id: req.body.id};
  var update = { rsvps: newRSVPS};
  var options = {new: true};
  Restaurant.update(query, update, function (err, doc){
    if(err){
      console.log("Something went wrong when updating data!");
      return res.status(500).send([false, err]);
    }
    console.log("Updated rsvp list");
    return res.status(200).json(doc);
  });
}
/*exports.deincGoing = function(req, res, next){
  if (!req.body.email){
    res.status(406).send("Please attach restaurant id in body.");
  }
  var query = {_id: req.body.id};
  var update = { $inc: {vote_count: -1}};
  var options = {new: true};
  Restaurant.update(query, update, function (err, doc){
    if(err){
      console.log("Something went wrong when updating data!");
      res.status(500).send([false, err]);
    }
    console.log("Updated ", req.body.id, " by -1");
    res.status(200).send([true, doc]);
  });
}*/
//==========================================
//Regular Ole Functions
//==========================================
function createRestaurantsByCity(data, cityName){
  console.log("Making restaurants now!");
  return new Promise(function(resolve, reject){
    _.map(data.businesses).map(function(restaurant, i){
      createRestaurant(restaurant, resolve, reject);
    });
  });
}
function createRestaurant(rest, resolve, reject) {
  var newDate = Date.now();
  const restaurant = new Restaurant ({
    name : rest.name,
    city : rest.location.city,
    rating: rest.rating,
    url:  rest.url,
    image_url: rest.image_url,
    location: rest.location,
    rsvps: [],
    date: newDate
  });

  restaurant.save(function(err){
    if (err) {
      return reject();
    };
    console.log("New restaurant: ", rest.name, " in ", rest.location.city);
    return resolve();
  });
}
function doCityRestaurantsExist(cityName){
  var query = Restaurant.find({city: cityName});
  return query;
}
function getRestaurantsByCity(cityName, callback){
  Restaurant.find({city: cityName}, function(err, existingPolls){
    if(err){
      console.log("ERROR!!", err);
      callback(err, null);
    };
    console.log("Existing polls for ", cityName, " : ", typeof(existingPolls));
    callback(null, existingPolls);
  });
}
//this function checks to see if date object is more than one day old.
// If so, deletes entire city collection and returns false;

function checkForFreshness(rest){
  console.log("--Step 2: Checking freshness for: ", rest.city);
  const now = Date.now();
  const difference = now - rest.date;
  //takes diff and makes sure it is under 16 hours (57,600,000 milliseconds);
  if(difference < 57600000){
    console.log("City Data is Fresh.");
    console.log("City Data is", (difference / 3600000.0), "hours old." );
    return true;
  }else{
    console.log("City Data is Stale. Deleting Data Now");
    Restaurant.remove({city: rest.city}, function(err){
      if(err){console.log(err)};
    });
    return false;
  }

}
function getCity(cityName) {
  var options = {
    uri: `${url_root}?location=${cityName}&term=${term}`,
    headers: {'Authorization': `Bearer ${bt}`},
  }
  return rp(options).then(body => {
    let responseJSON = JSON.parse(body);
    return responseJSON;
  });
}
/*var doRestsExist = restQuery.exec(function(err, resturants){
  if(err){
    console.log("Error searching for restaurants");
  }
  if(restaurants){
    console.log("Restaurants found, returning true", restaurants);
    return true;
  }
  console.log("Nothing found, but still returning true");
  console.log("---", restaurants);
  return true;
});*/

//Yelp Client ID
//Mk0PLLlGbRmAsoZL4j1e5g
//
//Yelp Client secret
//902MWNCbGI8BFBcqH0Kh7nErn0hfzxsZmAjEIEhfs7XzDbVp4GHro58t8mnMLOMN
//
//{"access_token": "ESnoZK_asVC0oAPVx9kNmcDn7kxNimeQcagnVQXcshMyah-l3sUtiD_GmDF0ml4u3WQHKgElCgHsPHPzW3zhcF-Pjl25XOSC1eGGbx8ErFAeEvGfX7PMyjbSxpvqWXYx", "expires_in": 638936120, "token_type": "Bearer"}
//
