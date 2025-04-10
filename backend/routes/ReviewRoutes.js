
const express = require('express');
const { 
  getAllReviews, 
  getReviewById, 
  createReview, 
  updateReview, 
  deleteReview
} = require("../adapters/controllers/ReviewController");
const router = express.Router();
router.get('/', getAllReviews);
router.get('/:id', getReviewById);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
module.exports = router;
