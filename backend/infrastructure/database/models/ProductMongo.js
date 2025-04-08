const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
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
  categoryId: {
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
