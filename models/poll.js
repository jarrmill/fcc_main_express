const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const pollSchema = new Schema({
  //_id: ObjectId,
  email: String,
  title: String,
  options: Schema.Types.Mixed,
  voters: Array
});

const PollClass = mongoose.model('poll', pollSchema);
// Export the model
module.exports = PollClass;
