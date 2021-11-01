const express = require('express');

const authMiddleware = require('../middleware/auth');
const UserController = require('../controllers/user');

const router = express.Router();

// update profile
// app.post('/api/user/', auth, ({ user, body }, res) => {
//   res.status(200).json(body);
// });

// status
router.get('/req-email', authMiddleware, (params, res) => UserController.requestEmail(params, res));
router.get('/verify-email', (params, res) => UserController.verifyEmail(params, res));

router.post('/status', authMiddleware, UserController.status);
router.post('/graphs', authMiddleware, (params, res) =>
  UserController.getUserGraphs(params, res)
);
router.post('/:id/graphs', authMiddleware, (params, res) =>
  UserController.getUserGraphs(params, res)
);

module.exports = router;
