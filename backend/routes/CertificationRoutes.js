
const express = require('express');
const { 
  getAllCertifications, 
  getCertificationById, 
  createCertification, 
  updateCertification, 
  deleteCertification
} = require("../adapters/controllers/CertificationController");
const router = express.Router();
router.get('/', getAllCertifications);
router.get('/:id', getCertificationById);
router.post('/', createCertification);
router.put('/:id', updateCertification);
router.delete('/:id', deleteCertification);
module.exports = router;
