
const express = require('express');
const { 
  getAllLists, 
  getListById, 
  createList, 
  updateList, 
  deleteList
} = require("../adapters/controllers/ListController");
const router = express.Router();
router.get('/', getAllLists);
router.get('/:id', getListById);
router.post('/', createList);
router.put('/:id', updateList);
router.delete('/:id', deleteList);
module.exports = router;
