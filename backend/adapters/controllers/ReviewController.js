const ReviewRepository = require("../../infrastructure/repository/ReviewRepository");
const ReviewPort = require("../../application/ports/ReviewPort");
const ReviewUseCase = require("../../application/use-cases/ReviewUseCase");
const ProductRepository = require("../../infrastructure/repository/ProductRepository");  // Assuming you have a ProductRepository
const port = new ReviewPort(ReviewRepository);
const UseCase = new ReviewUseCase(port);

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a review by ID
const getReviewById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new review
const createReview = async (req, res) => {
  const { productName, rating, comment, verifiedPurchase } = req.body;

  try {
    // Check if the product exists
    const product = await ProductRepository.findByName(productName);
    
    if (!product) {
      return res.status(400).json({ message: 'Product does not exist.' });
    }

    // Proceed to create the review after verifying the product
    const newResource = await UseCase.create({
      productId: product.id,  // Use the found product's ID
      rating,
      comment,
      verifiedPurchase,
    });

    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing review
const updateReview = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "Review deleted" });
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getAllReviews, 
  getReviewById, 
  createReview, 
  updateReview, 
  deleteReview
};
