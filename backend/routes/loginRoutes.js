// In your routes file (e.g., routes/loginRegister.js)
const express = require('express');
const { 
    loginUser,
    googleAuth,
    getByUsernameOrEmail,
    getUserByIdentifier
} = require("../adapters/controllers/loginRegister");

const router = express.Router();

router.post('/login', loginUser);
router.post('/auth/google', googleAuth);
router.get('/check/:identifier', getByUsernameOrEmail);
router.get('/identifier/:identifier', getUserByIdentifier);

module.exports = router;