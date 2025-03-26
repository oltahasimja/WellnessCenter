
const express = require('express');
const { 
    registerUserForm,
    loginUser
} = require("../adapters/controllers/loginRegister");

const router = express.Router();


router.post('/registerForm', registerUserForm);
router.post('/login', loginUser);
module.exports = router;
