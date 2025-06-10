const express = require('express');
const {
  getAllDeliverys, 
  getDeliveryById, 
  createDelivery, 
  updateDelivery, 
  deleteDelivery 
} = require('../adapters/controllers/DeliveryController');

const router = express.Router();

router.get('/', getAllDeliverys);
router.get('/:id', getDeliveryById);
router.post('/', createDelivery);
router.put('/:id', updateDelivery);
router.delete('/:id', deleteDelivery);

module.exports = router;
