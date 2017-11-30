const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
  //_id: ObjectId,
  name: String,
  city: String,
  rating: String,
  url: String,
  image_url: String,
  location: Schema.Types.Mixed,
  rsvps: Array,
  date: Date,
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
// Export the model
module.exports = Restaurant;
