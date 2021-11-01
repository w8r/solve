const express = require('express');
const auth = require('../middleware/auth');
const { authStrategy } = require('../db/passport/utils');
const { createRateLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/auth');

const router = express.Router();

const jwtAuthenticate = authStrategy('jwt');
const localAuthenticate = authStrategy('local');
const fbAuthenticate = authStrategy('facebook-token');
const googleAuthenticate = authStrategy('google');

const failRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true
});

const successRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipFailedRequests: true
});

router.post('/signup', successRateLimiter, authController.signupLocal);
router.post('/logout', authController.logout);

router.post(
  '/signin',
  failRateLimiter,
  authController.validateLocalSignInPayload,
  localAuthenticate,
  authController.signIn
);

router.post(
  '/facebook',
  successRateLimiter,
  authController.validateFacebookPayload,
  authController.facebookSignIn,
  authController.signIn
);

router.post(
  '/google',
  successRateLimiter,
  authController.validateGooglePayload,
  authController.googleSignIn,
  authController.signIn
);

module.exports = router;
