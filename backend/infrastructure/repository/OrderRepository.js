const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Order = require("../database/models/Order"); 
const OrderMongo = require("../database/models/OrderMongo"); 

class OrderRepository {
  
  async findAll() {
    try {
      
      return await OrderMongo.find().lean();
    } catch (error) {
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      try {
        
        return await Order.findAll(); 
      } catch (mysqlError) {
        console.error("MySQL findAll also failed:", mysqlError);
        throw new Error('Error fetching orders from both MongoDB and MySQL');
      }
    }
  }

  async findById(id) {
    try {
      
      return await OrderMongo.findOne({ mysqlId: id }).lean();
    } catch (error) {
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      try {
        
        return await Order.findByPk(id); 
      } catch (mysqlError) {
        console.error("MySQL findById also failed:", mysqlError);
        throw new Error('Error fetching order by ID from both MongoDB and MySQL');
      }
    }
  }

  
  async create(data) {
    try {
      console.log("Creating Order:", data);

      
      const mysqlResource = await Order.create(data);

      
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...data
      };

      
      const mongoResource = await OrderMongo.create(mongoData);
      console.log("Order saved in MongoDB:", mongoResource);

      return mysqlResource;
    } catch (error) {
      console.error("Error creating Order:", error);
      throw new Error('Error creating Order: ' + error.message);
    }
  }

  async update(id, data) {
    try {
      
      const [updatedCount] = await Order.update(
        { ...data },
        { where: { id } }
      );

      if (updatedCount === 0) {
        throw new Error("Order not found in MySQL");
      }

    
      const mongoUpdateData = { ...data };

      
      const updatedMongoDB = await OrderMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );

      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("Order not found in MongoDB or no changes made");
      }

      
      return this.findById(id);
    } catch (error) {
      console.error("Error updating Order:", error);
      throw new Error('Error updating Order: ' + error.message);
    }
  }

  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await Order.destroy({ where: { id } });

      // Delete from MongoDB
      await OrderMongo.deleteOne({ mysqlId: id });

      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Order:", error);
      throw new Error('Error deleting Order: ' + error.message);
    }
  }
}

module.exports = new OrderRepository();
