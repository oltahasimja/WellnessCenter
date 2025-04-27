
const mongoose = require('mongoose');

const { Appointment, User } = require('../database/models/index');
const { AppointmentMongo, UserMongo } = require('../database/models/indexMongo');



class AppointmentRepository {
  /**
   * Find all appointments with optional filtering
   * @param {Object} filter - Filter criteria (userId or specialistId)
   * @returns {Promise<Array>} Array of appointments
   */
  async findAll(filter = {}) {
    try {
      const query = {};
      
      if (filter.specialistId) {
        const specialist = await UserMongo.findOne({ 
          mysqlId: filter.specialistId.toString() 
        }).populate('roleId');
        
        if (!specialist) throw new Error('Specialist not found');
        query.specialistId = specialist._id;
      } 
      else if (filter.userId) {
        const user = await UserMongo.findOne({ mysqlId: filter.userId.toString() });
        if (!user) throw new Error('User not found');
        query.userId = user._id;
      }

      return await AppointmentMongo.find(query)
        .populate({
          path: 'userId',
          select: 'name lastName email mysqlId'
        })
        .populate({
          path: 'specialistId',
          select: 'name lastName roleId mysqlId',
          populate: {
            path: 'roleId',
            select: 'name mysqlId'
          }
        })
        .lean();
    } catch (error) {
      console.error("Error finding appointments:", error);
      throw error;
    }
  }

  /**
   * Find appointment by ID (handles both MongoDB _id and mysqlId)
   * @param {string} id - Appointment ID (MongoDB _id or mysqlId)
   * @returns {Promise<Object|null>} Found appointment or null
   */
  async findById(id) {
    try {
      // Check if valid MongoDB ObjectId
      if (mongoose.isValidObjectId(id)) {
        const byMongoId = await AppointmentMongo.findById(id)
          .populate('userId specialistId')
          .lean();
        if (byMongoId) return byMongoId;
      }

      // Fallback to mysqlId search
      const byMysqlId = await AppointmentMongo.findOne({ mysqlId: id.toString() })
        .populate('userId specialistId')
        .lean();

      if (!byMysqlId) throw new Error("Appointment not found");
      return byMysqlId;
    } catch (error) {
      console.error("Error finding appointment:", error);
      throw error;
    }
  }

  /**
   * Create new appointment in both databases
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} Created appointment
   */
  async create(appointmentData) {
    try {
      const user = await UserMongo.findOne({ mysqlId: appointmentData.userId.toString() });
      if (!user) throw new Error('User not found in MongoDB');

      const specialistId = new mongoose.Types.ObjectId(appointmentData.specialistId);
      const specialist = await UserMongo.findById(specialistId);
      if (!specialist) throw new Error('Specialist not found');

      // Create in MySQL first
      const createdAppointment = await Appointment.create({
        ...appointmentData,
        specialistId: parseInt(specialist.mysqlId, 10),
        status: 'pending' // Default status
      });

      // Create in MongoDB
      await AppointmentMongo.create({
        mysqlId: createdAppointment.id.toString(),
        userId: user._id,
        specialistId: specialistId,
        appointmentDate: appointmentData.appointmentDate,
        status: 'pending',
        type: appointmentData.type,
        notes: appointmentData.notes
      });

      return createdAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Update appointment in both databases
   * @param {string} id - Appointment ID (MongoDB _id or mysqlId)
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated appointment
   */
  async update(id, data) {
    try {
      let mongoAppointment;
      
      // Try to find by MongoDB _id first
      if (mongoose.isValidObjectId(id)) {
        mongoAppointment = await AppointmentMongo.findById(id);
      }
      
      // If not found, try by mysqlId
      if (!mongoAppointment) {
        mongoAppointment = await AppointmentMongo.findOne({ mysqlId: id.toString() });
      }

      if (!mongoAppointment) throw new Error("Appointment not found");

      // Update MongoDB
      const mongoUpdate = await AppointmentMongo.updateOne(
        { _id: mongoAppointment._id },
        { $set: data }
      );
      if (mongoUpdate.modifiedCount === 0) {
        throw new Error("Failed to update MongoDB record");
      }

      // Update MySQL if mysqlId exists
      if (mongoAppointment.mysqlId) {
        const [mysqlUpdated] = await Appointment.update(data, {
          where: { id: mongoAppointment.mysqlId }
        });
        if (mysqlUpdated === 0) {
          console.warn("MySQL record not updated (might be missing)");
        }
      }

      return this.findById(mongoAppointment._id);
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw new Error('Update failed: ' + error.message);
    }
  }

  /**
   * Delete appointment from both databases
   * @param {string} id - Appointment ID (mysqlId)
   * @returns {Promise<number>} Number of deleted records (MySQL)
   */
  async delete(id) {
    try {
      // First find in MongoDB to get mysqlId
      const mongoAppointment = await AppointmentMongo.findOne({ mysqlId: id.toString() });
      
      let deletedCount = 0;
      
      // Delete from MySQL
      if (mongoAppointment?.mysqlId) {
        deletedCount = await Appointment.destroy({ 
          where: { id: mongoAppointment.mysqlId } 
        });
      }
      
      // Delete from MongoDB (using either _id or mysqlId)
      const deleteFilter = mongoAppointment?._id 
        ? { _id: mongoAppointment._id } 
        : { mysqlId: id.toString() };
      
      await AppointmentMongo.deleteOne(deleteFilter);
      
      return deletedCount;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  }

  /**
   * Get MongoDB User ID from mysqlId
   * @param {number} userId - MySQL user ID
   * @returns {Promise<mongoose.Types.ObjectId>} MongoDB user _id
   */
  async getMongoUserId(userId) {
    const user = await UserMongo.findOne({ mysqlId: userId.toString() });
    if (!user) throw new Error('User not found in MongoDB');
    return user._id;
  }
}

module.exports = new AppointmentRepository();