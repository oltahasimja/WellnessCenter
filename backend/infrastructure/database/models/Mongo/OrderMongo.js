const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
  mysqlId: {
    type: String,
    required: true,
  },
  clientData: {
    name: String,
    lastname: String,
    city: String,
    street: String,
    country: String,
    email: String,
    phone: String,
  },
  cart: [
    {
      productId: { 
        type: String,
        required: true 
      },
      quantity: { 
        type: Number, 
        default: 1 
      },
      price: Number,
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
