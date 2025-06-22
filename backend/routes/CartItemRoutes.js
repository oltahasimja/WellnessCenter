const express = require('express');
const router = express.Router();

const { 
  getAllCartItems, 
  getCartItemById,
  getCartItemsByUserId,
  createCartItem, 
  updateCartItem,
  patchCartItem,
  deleteCartItem,
  deleteCartItemByUserProduct,
  deleteCartByUserId
} = require("../adapters/controllers/CartItemController");

// GET all cart items
router.get('/', getAllCartItems);

// GET cart items by userId
router.get('/user/:userId', getCartItemsByUserId);

// GET by single cart item ID
router.get('/:id', getCartItemById);

// POST
router.post('/', createCartItem);

// PUT (full update)
router.put('/:id', updateCartItem);

// PATCH (quantity only)
router.patch('/:userId/:productId', patchCartItem);

// DELETE by cart item ID
router.delete('/:id', deleteCartItem);

// DELETE by userId and productId
router.delete('/:userId/:productId', deleteCartItemByUserProduct);

router.delete('/:userId', deleteCartByUserId);


module.exports = router;
