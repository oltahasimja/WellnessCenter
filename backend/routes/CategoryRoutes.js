const express = require('express');
const { 
  getAllCategorys, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory
} = require("../adapters/controllers/CategoryController");
const router = express.Router();
router.get('/', getAllCategorys);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
module.exports = router;
