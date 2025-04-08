
const express = require('express');
const { 
  getAllCartItems, 
  getCartItemById, 
  createCartItem, 
  updateCartItem, 
  deleteCartItem
} = require("../adapters/controllers/CartItemController");
const router = express.Router();
router.get('/', getAllCartItems);
router.get('/:id', getCartItemById);
router.post('/', createCartItem);
router.put('/:id', updateCartItem);
router.delete('/:id', deleteCartItem);
module.exports = router;
