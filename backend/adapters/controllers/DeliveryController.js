
const DeliveryRepository = require("../../domain/repository/DeliveryRepository");
const DeliveryPort = require("../../application/ports/DeliveryPort");
const DeliveryUseCase = require("../../application/use-cases/DeliveryUseCase");
const port = new DeliveryPort(DeliveryRepository);
const UseCase = new DeliveryUseCase(port);
const getAllDeliverys = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getDeliveryById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Delivery not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createDelivery = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateDelivery = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "Delivery not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteDelivery = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "Delivery deleted" });
    } else {
      res.status(404).json({ message: "Delivery not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllDeliverys, 
  getDeliveryById, 
  createDelivery, 
  updateDelivery, 
  deleteDelivery
};
