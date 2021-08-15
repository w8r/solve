const express = require('express');
const auth = require('../middleware/auth');
const { authStrategy } = require('../db/passport/utils');
const { createRateLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/auth');

const router = express.Router();

const jwtAuthenticate = authStrategy('jwt');
const localAuthenticate = authStrategy('local');

const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true
});

router.post('/signup', authController.signupLocal);
router.post('/logout', authController.logout);

router.post(
  '/signin',
  rateLimiter,
  authController.validateLocalSignInPayload,
  localAuthenticate,
  authController.signIn
);

module.exports = router;
