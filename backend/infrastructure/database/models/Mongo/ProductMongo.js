const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.String,
    ref: 'CategoryMongo',
    required: true
  },
  image: {
    type: String,
  }
}, { timestamps: true });

const Product = mongoose.model('ProductMongo', ProductSchema);

module.exports = Product;
