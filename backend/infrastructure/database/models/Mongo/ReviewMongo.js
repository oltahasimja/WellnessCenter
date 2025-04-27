const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    mysqlId: {
        type: String,
        required: true,
        index: true
      },
    
    reviewId: {
    type: Number,
    required: true
  },
  userId: {
    type: Number,
    required: true
  },
  productId: {
    type: Number,
    default: null
  },
  serviceId: {
    type: Number,
    default: null
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ReviewMongo', reviewSchema);
