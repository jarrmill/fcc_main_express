const request = require('request');
const rp = require('request-promise');
const Restaurant = require('../models/Restaurant');
const Promise = require('bluebird');
const https = require('https');
const _ = require('lodash');

const bt = "ESnoZK_asVC0oAPVx9kNmcDn7kxNimeQcagnVQXcshMyah-l3sUtiD_GmDF0ml4u3WQHKgElCgHsPHPzW3zhcF-Pjl25XOSC1eGGbx8ErFAeEvGfX7PMyjbSxpvqWXYx";
const url_root = "https://api.yelp.com/v3/businesses/search";
const term = "bars";

//====================================================
//Export Functions (Routes)
//====================================================
exports.test = function(req, res, next) {
  return res.status(200).send("Welcome to get city!!!");
}
exports.getRestaurants = function(req, res, next){
  if (!req.headers.city){
    return res.status(406).send("Please attach a city header with city name");
  }
  var cityName = req.headers.city;
  //CityInfoOrBust will either contain query data listing all restaurants
  // or will contain False
  var CityInfoOrBust = doCityRestaurantsExist(cityName);
  if(doCityRestaurantsExist(cityName)){
    console.log("City restaurants found for city: ", cityName);
    res.status(200).send(CityInfoOrBust);
  }else{
    console.log("No records exist yet for city: ", cityName);
    getCity(cityName).then(results => {
      createRestaurantsByCity(results, cityName);
      return res.status(200).send(results);
    }).catch(err => {
      console.log("Error wee woo: ", err);
      return res.status(200).send("Getting your results! (not really something is wrong)");
    });
  }
};
exports.incGoing = function(req, res, next){
  if(!req.body.id){
    res.status(406).send("Please attach restaurant id in body.");
  }
  var query = {_id: req.body.id};
  var update = { $inc: {vote_count: 1}};
  var options = {new: true};
  Restaurant.update(query, update, function (err, doc){
    if(err){
      console.log("Something went wrong when updating data!");
      res.status(500).send([false, err]);
    }
    console.log("Updated ", req.body.id, " by 1");
    res.status(200).send([true, doc]);
  });
}
exports.deincGoing = function(req, res, next){
  if (!req.body.id){
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
}
//==========================================
//Regular Ole Functions
//==========================================
function createRestaurantsByCity(data, cityName){
  _.map(data.businesses).map(function(restaurant, i){
    createRestaurant(restaurant);
  });
  return doCityRestaurantsExist(cityName);
}
function createRestaurant(rest) {
  const restaurant = new Restaurant ({
    name : rest.name,
    city : rest.location.city,
    rating: rest.rating,
    url:  rest.url,
    image_url: rest.image_url,
    location: rest.location,
    vote_count: 0
  });

  restaurant.save(function(err){
    if (err) {return next(err)};
    console.log("New restaurant: ", rest.name, " in ", rest.location.city);
  });
}
function doCityRestaurantsExist(cityName){
  Restaurant.find({name: cityName}, function(err, existingPolls){
    if (existingPolls){
      console.log("Restaurants found in the city of ", cityName);
      return existingPolls;
    } else {
      console.log("No restaurants exist for the city of ", cityName);
      return false;
    }
  });
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


//Yelp Client ID
//Mk0PLLlGbRmAsoZL4j1e5g
//
//Yelp Client secret
//902MWNCbGI8BFBcqH0Kh7nErn0hfzxsZmAjEIEhfs7XzDbVp4GHro58t8mnMLOMN
//
//{"access_token": "ESnoZK_asVC0oAPVx9kNmcDn7kxNimeQcagnVQXcshMyah-l3sUtiD_GmDF0ml4u3WQHKgElCgHsPHPzW3zhcF-Pjl25XOSC1eGGbx8ErFAeEvGfX7PMyjbSxpvqWXYx", "expires_in": 638936120, "token_type": "Bearer"}
//
