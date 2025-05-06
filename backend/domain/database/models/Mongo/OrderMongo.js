const mongoose = require('mongoose');
const { Schema } = mongoose;

const counterSchema = new Schema({
  name: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

const orderSchema = new Schema({
  mysqlId: {
    type: Number, 
    required: true,
    unique: true,
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
        required: true,
      },
      quantity: { 
        type: Number,
        default: 1,
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

//auto incrementing mysql
orderSchema.pre('save', async function(next) {
  const order = this;

  if (order.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: 'orderId' },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    order.mysqlId = counter.sequence_value;
  }

  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
