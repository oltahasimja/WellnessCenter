
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountrySchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    index: true  
  },
  name: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Country = mongoose.model('CountryMongo', CountrySchema);

module.exports = Country;
