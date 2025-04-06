const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
