
const CertificationRepository = require("../../infrastructure/repository/CertificationRepository");
const CertificationPort = require("../../application/ports/CertificationPort");
const CertificationUseCase = require("../../application/use-cases/CertificationUseCase");
const port = new CertificationPort(CertificationRepository);
const UseCase = new CertificationUseCase(port);
const getAllCertifications = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getCertificationById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Certification not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createCertification = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateCertification = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "Certification not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteCertification = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "Certification deleted" });
    } else {
      res.status(404).json({ message: "Certification not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllCertifications, 
  getCertificationById, 
  createCertification, 
  updateCertification, 
  deleteCertification
};
