const express = require('express');
const auth = require('../middleware/auth');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/signup', authController.signupLocal);
router.post('/login', authController.loginLocal);
router.post('/logout', authController.logout);

module.exports = router;
