const express = require('express');

const authMiddleware = require('../middleware/auth');
const UserController = require('../controllers/user');

const router = express.Router();

// update profile
// app.post('/api/user/', auth, ({ user, body }, res) => {
//   res.status(200).json(body);
// });

// status
router.get('/verify-email', authMiddleware, (params, res) => UserController.requestEmail(params, res));
router.post('/verify-email', authMiddleware, (params, res) => UserController.verifyEmail(params, res));

router.post('/status', authMiddleware, UserController.status);
router.post('/graphs', authMiddleware, ({ user }, res) =>
  UserController.getUserGraphs(user._id, res)
);
router.post('/:id/graphs', authMiddleware, ({ user, params }, res) =>
  UserController.getUserGraphs(params.id, res)
);

module.exports = router;
