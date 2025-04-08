
const CartItemRepository = require("../../infrastructure/repository/CartItemRepository");
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
module.exports = { 
  getAllCartItems, 
  getCartItemById, 
  createCartItem, 
  updateCartItem, 
  deleteCartItem
};
