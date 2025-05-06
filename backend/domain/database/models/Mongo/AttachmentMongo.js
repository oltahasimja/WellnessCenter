const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: String, required: true }, // base64 string
    cardId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'CardMongo', 
      required: true 
    },
    createdAt: { type: Date, default: Date.now }
  });
  
  // Add index for better query performance
  AttachmentSchema.index({ cardId: 1 });
  
  module.exports = mongoose.model('Attachment', AttachmentSchema);