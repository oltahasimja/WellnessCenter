const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Certification = sequelize.define("Certification", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issuingOrganization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true, // Nëse certifikata nuk skadon
  },
  credentialId: {
    type: DataTypes.STRING,
    allowNull: true, // ID unike e certifikatës
  },
  credentialUrl: {
    type: DataTypes.STRING,
    allowNull: true, // URL për të verifikuar certifikatën online
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Changed to string reference
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  trainingId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Certifikimi mund të jetë i pavarur nga trajnimi
    references: {
      model: 'Trainings',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  }
}, {
  timestamps: false,
});

// // Lidhjet me përdoruesit dhe trajnimet
// User.hasMany(Certification, { foreignKey: 'userId' });
// Certification.belongsTo(User, { foreignKey: 'userId' });

// Training.hasMany(Certification, { foreignKey: 'trainingId' });
// Certification.belongsTo(Training, { foreignKey: 'trainingId' });

module.exports = Certification;