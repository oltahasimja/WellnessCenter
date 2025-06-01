
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
const patchCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    const allItems = await UseCase.getAll();
    const item = allItems.find(item =>
      (item.userId?.mysqlId === userId || item.usersId?.mysqlId === userId) &&
      item.productId === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const updated = await UseCase.update(item.mysqlId, { quantity });
    res.json(updated);
  } catch (error) {
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
