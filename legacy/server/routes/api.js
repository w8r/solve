const express = require('express');

const authRoutes = require('./auth');
const userRoutes = require('./user');
const graphRoutes = require('./graph');

const router = express.Router();

router.get('/status', (req, res) => res.status(200).json({ status: 'alive' }));

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/graph', graphRoutes);

module.exports = router;
