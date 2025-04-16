
const express = require('express');
const { 
  getAllCardMembers, 
  getCardMemberById, 
  createCardMember, 
  updateCardMember, 
  deleteCardMember,
  getCardMembersByCardId
} = require("../adapters/controllers/CardMemberController");
const router = express.Router();
router.get('/', getAllCardMembers);
router.get('/by-card', getCardMembersByCardId);
router.get('/:id', getCardMemberById);
router.post('/', createCardMember);
router.put('/:id', updateCardMember);
router.delete('/:id', deleteCardMember);
module.exports = router;
