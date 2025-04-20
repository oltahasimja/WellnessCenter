const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../config/database');
const Order = require('./Order');

class Delivery extends Model {}

Delivery.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
      validate: {
        notNull: { msg: 'Order ID is required' },
        isUUID: { args: '4', msg: 'Invalid Order ID format' }
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'delivered', 'cancelled'),
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'confirmed', 'delivered', 'cancelled']],
          msg: 'Invalid delivery status'
        }
      }
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: 'Delivery address is required' },
        notEmpty: { msg: 'Delivery address cannot be empty' },
        len: {
          args: [10, 500],
          msg: 'Address should be between 10-500 characters'
        }
      }
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'Invalid delivery date format' },
        isFutureDate(value) {
          if (value && new Date(value) <= new Date()) {
            throw new Error('Delivery date must be in the future');
          }
        }
      }
    },
    emailSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    estimatedDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'Invalid estimated delivery date format' }
      }
    }
  },
  {
    sequelize,
    modelName: 'Delivery',
    tableName: 'deliveries',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['orderId']
      }
    ]
  }
);

Delivery.addHook('beforeUpdate', async (delivery, options) => {
  if (delivery.changed('status')) {
    // Optional: Handle side effects of status change
  }
});

Delivery.belongsTo(Order, {
  foreignKey: 'orderId',
  onDelete: 'RESTRICT'
});

Delivery.prototype.getDeliveryInfo = function () {
  return {
    id: this.id,
    status: this.status,
    estimatedDelivery: this.estimatedDelivery
  };
};

module.exports = Delivery;
