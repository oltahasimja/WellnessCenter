const mongoose = require('mongoose');

// Define the schema
const orderProductSchema = new mongoose.Schema({
  mysqlId: {
    type: String,  
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order',  
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',  
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

const OrderProductMongo = mongoose.model('OrderProduct', orderProductSchema);

module.exports = OrderProductMongo;
