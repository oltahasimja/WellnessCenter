const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const OrderSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    index: true
  },

  customerName: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });


const OrderMongo = mongoose.model('OrderMongo', OrderSchema);

module.exports = OrderMongo;
