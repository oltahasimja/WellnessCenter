const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
    mysqlId: {
        type: String,
        required: true,
      },
    productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const CartSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  
      required: true,
    },
    items: [CartItemSchema],  
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);
