
const OrderProductRepository = require("../../infrastructure/repository/OrderProductRepository");
const OrderProductPort = require("../../application/ports/OrderProductPort");
const OrderProductUseCase = require("../../application/use-cases/OrderProductUseCase");
const port = new OrderProductPort(OrderProductRepository);
const UseCase = new OrderProductUseCase(port);
const getAllOrderProducts = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getOrderProductById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "OrderProduct not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createOrderProduct = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateOrderProduct = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "OrderProduct not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteOrderProduct = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "OrderProduct deleted" });
    } else {
      res.status(404).json({ message: "OrderProduct not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllOrderProducts, 
  getOrderProductById, 
  createOrderProduct, 
  updateOrderProduct, 
  deleteOrderProduct
};
