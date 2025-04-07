
const DashboardRoleRepository = require("../../infrastructure/repository/DashboardRoleRepository");
const DashboardRolePort = require("../../application/ports/DashboardRolePort");
const DashboardRoleUseCase = require("../../application/use-cases/DashboardRoleUseCase");
const port = new DashboardRolePort(DashboardRoleRepository);
const UseCase = new DashboardRoleUseCase(port);
const getAllDashboardRoles = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getDashboardRoleById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "DashboardRole not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createDashboardRole = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateDashboardRole = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "DashboardRole not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteDashboardRole = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "DashboardRole deleted" });
    } else {
      res.status(404).json({ message: "DashboardRole not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllDashboardRoles, 
  getDashboardRoleById, 
  createDashboardRole, 
  updateDashboardRole, 
  deleteDashboardRole
};
