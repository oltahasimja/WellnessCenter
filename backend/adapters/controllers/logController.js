const Log = require('../../domain/database/models/MySQL/log');

// Fetch all logs
const getLogs = async (req, res) => {
  try {
    const logs = await Log.findAll({
      order: [['createdAt', 'DESC']], 
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs.' });
  }
};
const getLogsByProgramId = async (req, res) => {
  try {
    const { programId } = req.params;
    
    const logs = await Log.findAll({
      where: {
        programId: programId // or ptogramId if that's the correct field name in your DB
      },
      order: [['createdAt', 'DESC']],
    });
    
    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: 'No logs found for this program' });
    }
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs by programId:', error);
    res.status(500).json({ error: 'Failed to fetch logs by programId.' });
  }
};

// Create a new log
// const createLog = async (req, res) => {
//   const { userId, action, details } = req.body;
//   try {
//     const newLog = await Log.create({ userId, action, details });
//     res.status(201).json(newLog);
//   } catch (error) {
//     console.error('Error creating log:', error);
//     res.status(500).json({ error: 'Failed to create log.' });
//   }
// };

module.exports = {
  getLogs,
  getLogsByProgramId,
};