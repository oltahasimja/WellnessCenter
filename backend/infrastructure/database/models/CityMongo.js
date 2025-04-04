const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CitySchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    index: true  
  },
  name: {
    type: String,
    required: true
  },
  countryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CountryMongo',  
    index: true  
  }
}, { timestamps: true });

const City = mongoose.model('CityMongo', CitySchema);
module.exports = City;
