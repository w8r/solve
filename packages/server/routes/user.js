const express = require('express');

const auth = require('../middleware/auth');
const UserController = require('../controllers/user');

const router = express.Router();

// update profile
// app.post('/api/user/', auth, ({ user, body }, res) => {
//   res.status(200).json(body);
// });

// status
router.post('/status', auth, UserController.status);
router.post('/graphs', auth, ({ user }, res) =>
  UserController.getUserGraphs(user._id)
);
router.post('/:id/graphs', auth, ({ user, params }, res) =>
  UserController.getUserGraphs(params.id)
);

module.exports = router;
