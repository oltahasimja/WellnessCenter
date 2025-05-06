const express = require('express');
const router = express.Router();

const { 
  getAllUsersGroups, 
  getUsersGroupById, 
  createUsersGroup, 
  updateUsersGroup, 
  deleteUsersGroup
} = require("../adapters/controllers/UsersGroupController");

// Authentication middleware
// const { isAuthenticated } = require('../middlewares/authMiddleware');
// router.use(isAuthenticated);

/**
 * @route GET /api/usersgroup
 * @desc Get all UsersGroups or filter by groupId
 * @access Private
 */
router.get('/', getAllUsersGroups);

/**
 * @route GET /api/usersgroup/:id
 * @desc Get a UsersGroup by ID
 * @access Private
 */
router.get('/:id', getUsersGroupById);

/**
 * @route POST /api/usersgroup
 * @desc Create a new UsersGroup
 * @access Private
 */
router.post('/', createUsersGroup);

/**
 * @route PUT /api/usersgroup/:id
 * @desc Update a UsersGroup
 * @access Private
 */
router.put('/:id', updateUsersGroup);

/**
 * @route DELETE /api/usersgroup/:id
 * @desc Delete a UsersGroup
 * @access Private
 */
router.delete('/:id', deleteUsersGroup);

module.exports = router;