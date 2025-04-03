const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ListMongo',
    required: true,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  labels: {
    type: [String], // Example: ["urgent", "feature"]
    default: [],
  },
  attachments: {
    type: [
      {
        fileUrl: String,
        fileName: String,
        fileType: String,
        uploadedBy: mongoose.Schema.Types.ObjectId,
        uploadedAt: Date,
      }
    ],
    default: [],
  },
  checklist: {
    type: [
      {
        text: String,
        done: Boolean,
      }
    ],
    default: [],
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const CardMongo = mongoose.model('CardMongo', cardSchema);
module.exports = CardMongo;
