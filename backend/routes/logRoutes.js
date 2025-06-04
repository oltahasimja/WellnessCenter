// In your routes file (e.g., routes/loginRegister.js)
const express = require('express');
const { 
    getLogs,
    getLogsByProgramId
} = require("../adapters/controllers/logController");

const router = express.Router();

router.get('/', getLogs);
router.get('/program/:programId', getLogsByProgramId);

module.exports = router;