const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const User = require('../models/User');
const Training = require('../models/Training');

const TrainingApplication = sequelize.define("TrainingApplication", {
 status: {
    type: DataTypes.ENUM('në pritje', 'miratuar', 'refuzuar'),
     allowNull: false,
    defaultValue: 'në pritje',
    },
    applicationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  trainingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Training,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  }
}, {
  timestamps: false,
});

User.hasMany(TrainingApplication, { foreignKey: 'userId' });
TrainingApplication.belongsTo(User, { foreignKey: 'userId' });

Training.hasMany(TrainingApplication, { foreignKey: 'trainingId' });
TrainingApplication.belongsTo(Training, { foreignKey: 'trainingId' });

module.exports = TrainingApplication;
