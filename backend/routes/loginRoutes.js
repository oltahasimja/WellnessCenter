const express = require('express');
const { 
    // registerUserForm,
    loginUser,
    googleAuth
} = require("../adapters/controllers/loginRegister");

const router = express.Router();

// router.post('/registerForm', registerUserForm);
router.post('/login', loginUser);
router.post('/auth/google', googleAuth);

module.exports = router;