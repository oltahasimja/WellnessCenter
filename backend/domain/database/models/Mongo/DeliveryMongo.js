const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deliverySchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    unique: true, 
    index: true  
  },
  
  orderMongoId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'MongoDB Order reference is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  deliveryDate: {
    type: Date,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  estimatedDelivery: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true 
});

const DeliveryMongo = mongoose.model('DeliveryMongo', deliverySchema);

module.exports = DeliveryMongo;