const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Order = require("../database/models/MySQL/Order");
const { OrderMongo } = require('../database/models/indexMongo');
const { CartItem } = require('../database/models/index');
const { CartItemMongo, UserMongo } = require('../database/models/indexMongo');

class OrderRepository {
  // Get all orders
  async findAll() {
    try {
      return await OrderMongo.find().lean();
    } catch (error) {
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await Order.findAll({});
    }
  }

  // Get single order
  async findById(id) {
    try {
      return await OrderMongo.findOne({ mysqlId: id }).lean();
    } catch (error) {
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await Order.findByPk(id);
    }
  }

  // Create new order
 async create(data) {
    try {
      console.log("Creating Order:", data);

      // 1. Save to MySQL
      const mysqlResource = await Order.create(data);

      // 2. Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...data,
      };

      // 3. Save to MongoDB
      const mongoResource = await OrderMongo.create(mongoData);
      console.log("Order saved in MongoDB:", mongoResource);

      // 4. Clear Cart Items in MySQL and MongoDB
      try {
        const userId = data.clientData?.userId;

        if (!userId) {
          console.warn("⚠️ User ID not found in clientData, cart items not deleted");
        } else {
          // ✅ DELETE FROM MYSQL
          await CartItem.destroy({ where: { userId } });
          console.log(`🧹 CartItems (MySQL) cleared for userId: ${userId}`);

          // ✅ DELETE FROM MONGODB (CartMongo)
          // First, find UserMongo by mysqlId
          const userMongo = await UserMongo.findOne({ mysqlId: String(userId) });

          if (userMongo?._id) {
            const deleteResult = await CartItemMongo.deleteOne({ userId: userMongo._id });

            if (deleteResult.deletedCount > 0) {
              console.log(`🧹 CartMongo cleared for userId (Mongo _id): ${userMongo._id}`);
            } else {
              console.warn(`⚠️ No CartMongo found for userId (Mongo _id): ${userMongo._id}`);
            }
          } else {
            console.warn(`⚠️ No UserMongo found with mysqlId: ${userId}`);
          }
        }
      } catch (err) {
        console.error("❌ Failed to delete cart items after order:", err);
      }

      return mysqlResource;
    } catch (error) {
      console.error("Error creating Order:", error);
      throw new Error('Error creating Order: ' + error.message);
    }
  }


  // Update existing order
  async update(id, data) {
    try {
      const [updatedCount] = await Order.update(
        { ...data },
        { where: { id } }
      );

      if (updatedCount === 0) throw new Error("Order not found in MySQL");

      await OrderMongo.updateOne(
        { mysqlId: id },
        { $set: { ...data } }
      );

      return this.findById(id);
    } catch (error) {
      console.error("Error updating Order:", error);
      throw new Error('Error updating Order: ' + error.message);
    }
  }

  // Delete order
  async delete(id) {
    try {
      const deletedMySQL = await Order.destroy({ where: { id } });
      await OrderMongo.deleteOne({ mysqlId: id });
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Order:", error);
      throw new Error('Error deleting Order: ' + error.message);
    }
  }
}

module.exports = new OrderRepository();
