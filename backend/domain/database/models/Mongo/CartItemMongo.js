// models/CartMongo.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const CartSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
    unique: true,
    index: true,
  },
  items: [CartItemSchema], // ✅ embedded array of CartItem
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const CartMongo = mongoose.model('CartMongo', CartSchema);
module.exports = CartMongo;
