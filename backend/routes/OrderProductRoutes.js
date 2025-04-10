
const express = require('express');
const { 
  getAllOrderProducts, 
  getOrderProductById, 
  createOrderProduct, 
  updateOrderProduct, 
  deleteOrderProduct
} = require("../adapters/controllers/OrderProductController");
const router = express.Router();
router.get('/', getAllOrderProducts);
router.get('/:id', getOrderProductById);
router.post('/', createOrderProduct);
router.put('/:id', updateOrderProduct);
router.delete('/:id', deleteOrderProduct);
module.exports = router;
