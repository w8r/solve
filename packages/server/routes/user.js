const express = require('express');

const authMiddleware = require('../middleware/auth');
const UserController = require('../controllers/user');
const { createRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// update profile
// app.post('/api/user/', auth, ({ user, body }, res) => {
//   res.status(200).json(body);
// });

const successRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipFailedRequests: true
});

const failRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true
});

// status
router.post('/req-email', authMiddleware, (params, res) =>
  UserController.requestEmail(params, res)
);
router.get('/verify-email', UserController.verifyEmail);

router.post('/reset-password', failRateLimiter, UserController.recoverPassword);

router.post('/status', authMiddleware, UserController.status);
router.post('/graphs', authMiddleware, (params, res) =>
  UserController.getUserGraphs(params, res)
);
router.post('/:id/graphs', authMiddleware, (params, res) =>
  UserController.getUserGraphs(params, res)
);

module.exports = router;
