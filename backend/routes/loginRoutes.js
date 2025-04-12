const express = require('express');
const { 
    // registerUserForm,
    loginUser,
    googleAuth,
    getByUsernameOrEmail
} = require("../adapters/controllers/loginRegister");

const router = express.Router();

// router.post('/registerForm', registerUserForm);
router.post('/login', loginUser);
router.post('/auth/google', googleAuth);
router.get('/check/:identifier', getByUsernameOrEmail);

module.exports = router;