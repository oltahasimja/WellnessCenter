
const CartItemRepository = require("../../domain/repository/CartItemRepository");
const CartItemPort = require("../../application/ports/CartItemPort");
const CartItemUseCase = require("../../application/use-cases/CartItemUseCase");
const port = new CartItemPort(CartItemRepository);
const UseCase = new CartItemUseCase(port);
const getAllCartItems = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getCartItemById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "CartItem not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createCartItem = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateCartItem = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "CartItem not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteCartItem = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "CartItem deleted" });
    } else {
      res.status(404).json({ message: "CartItem not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCartItemsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const allItems = await UseCase.getAll();
    const userItems = allItems.filter(item => {
      return item.userId?.mysqlId === userId || item.usersId?.mysqlId === userId;
    });

    res.json(userItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PATCH /api/cartitem/:userId/:productId
// PATCH /api/cartitem/:userId/:productId - Fixed version
const patchCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    console.log(`Updating cart item - UserId: ${userId}, ProductId: ${productId}, Quantity: ${quantity}`);

    const allItems = await UseCase.getAll();
    
    // Find the cart item - check both userId and usersId fields
    const item = allItems.find(item => {
      const userMatch = item.userId?.mysqlId === userId || 
                       item.usersId?.mysqlId === userId || 
                       item.userId === userId || 
                       item.usersId === userId;
      
      const productMatch = item.productId?.toString() === productId.toString() ||
                          item.productId === productId;
      
      return userMatch && productMatch;
    });

    if (!item) {
      console.log("Cart item not found for user:", userId, "product:", productId);
      return res.status(404).json({ message: "Cart item not found" });
    }

    console.log("Found item:", item);

    // Update the item
    const updated = await UseCase.update(item.mysqlId || item._id, { quantity });
    
    if (!updated) {
      return res.status(500).json({ message: "Failed to update cart item" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: error.message });
  }
};
const deleteCartItemByUserProduct = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const allItems = await UseCase.getAll();
    const userCart = allItems.find(item => item.userId?.mysqlId === userId);

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found for user" });
    }

    const updatedItems = userCart.items.filter(i => i.productId !== productId);

    if (updatedItems.length === userCart.items.length) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    const updated = await UseCase.updateMongoOnlyByUserId(userId, updatedItems);

    res.json({ message: "Cart item deleted successfully", cart: updated });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: error.message });
  }
};






module.exports = { 
  getAllCartItems, 
  getCartItemsByUserId,
  patchCartItem,
  getCartItemById, 
  createCartItem, 
  updateCartItem, 
  deleteCartItem,
  deleteCartItemByUserProduct
};
