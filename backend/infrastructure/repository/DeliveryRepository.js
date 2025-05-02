
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Delivery = require("../database/models/Delivery");
const DeliveryMongo = require("../database/models/DeliveryMongo");
const Order = require("../database/models/index");
const OrderMongo = require("../database/models/Mongo/OrderMongo");

class DeliveryRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await DeliveryMongo.find().populate([{ path: 'orderMongoId', model: 'Order' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await Delivery.findAll({ include: [{ model: Order }] });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await DeliveryMongo.findOne({ mysqlId: id }).populate([{ path: 'orderId', model: 'OrderMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await Delivery.findByPk(id, { include: [{ model: Order }] });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating Delivery:", data);
      
      // First create in MySQL
      const mysqlResource = await Delivery.create(data);
      
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        deliveryAddress: data.deliveryAddress,
        status: data.status || 'pending',
        emailSent: data.emailSent || false,
        // Copy other fields as needed
      };
      
      // Handle order reference conversion
      if (data.orderId) {
        // Find the related document in MongoDB
        const order = await OrderMongo.findOne({ mysqlId: data.orderId.toString() });
        if (!order) {
          throw new Error(`Order with MySQL ID ${data.orderId} not found in MongoDB`);
        }
        mongoData.orderMongoId = order._id; // Use the correct field name from schema
      } else {
        throw new Error("Order ID is required");
      }
      
      // Create in MongoDB
      const mongoResource = await DeliveryMongo.create(mongoData);
      console.log("Delivery saved in MongoDB:", mongoResource);
      
      return mysqlResource;
    } catch (error) {
      console.error("Error creating Delivery:", error);
      throw new Error('Error creating Delivery: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await Delivery.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("Delivery not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      if (data.orderId) {
        // Find the related document in MongoDB
        const order = await OrderMongo.findOne({ mysqlId: data.orderId.toString() });
        if (!order) {
          throw new Error(`Order with MySQL ID ${data.orderId} not found in MongoDB`);
        }
        mongoUpdateData.orderId = new ObjectId(order._id.toString());
      }
      
      // Update in MongoDB
      const updatedMongoDB = await DeliveryMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("Delivery not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating Delivery:", error);
      throw new Error('Error updating Delivery: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await Delivery.destroy({ where: { id } });
      
      // Delete from MongoDB
      await DeliveryMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Delivery:", error);
      throw new Error('Error deleting Delivery: ' + error.message);
    }
  }
}

module.exports = new DeliveryRepository();
