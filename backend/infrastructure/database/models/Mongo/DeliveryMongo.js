const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deliverySchema = new Schema({
  orderMysqlId: {
    type: String,
    required: false 
  },
  orderMongoId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'MongoDB Order reference is required'],
  },
  clientEmail: {
    type: String,
    required: [true, 'Client email is required'],
    match: [/\S+@\S+\.\S+/, 'Email format is invalid'],
  },
  deliveryAddress: {
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    street: {
      type: String,
      required: [true, 'Street is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
    },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value > new Date();
      },
      message: 'Delivery date must be in the future',
    }
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
}, {
  timestamps: true,
});

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;
