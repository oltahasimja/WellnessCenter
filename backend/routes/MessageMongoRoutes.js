const express = require('express');
const router = express.Router();

const { 
  getAllMessageMongos, 
  getMessageMongoById,
  getMessagesByGroupId,
  createMessageMongo, 
  updateMessageMongo, 
  deleteMessageMongo
} = require("../adapters/controllers/MessageMongoController");

// const { isAuthenticated } = require('../middlewares/authMiddleware');
// router.use(isAuthenticated);

router.get('/', getAllMessageMongos);
router.get('/:id', getMessageMongoById);
router.get('/group/:groupId', getMessagesByGroupId);
router.post('/', createMessageMongo);
router.put('/:id', updateMessageMongo);
router.delete('/:id', deleteMessageMongo);

module.exports = router;