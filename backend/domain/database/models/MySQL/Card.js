const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Card = sequelize.define('Card', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdById: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users', // Changed to string reference
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  listId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Lists', // Changed to string reference
      key: 'id',
    },
    allowNull: false,
    onDelete: 'CASCADE',
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  labels: {
    type: DataTypes.JSON, // Change this to JSON type
    defaultValue: [],
  },
  attachments: {
    type: DataTypes.JSON, // Change this to JSON type
    defaultValue: [],
  },
  checklist: {
    type: DataTypes.JSON, // This should be fine as JSON
    defaultValue: [],
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});



module.exports = Card;
