const express = require('express');
const auth = require('../middleware/auth');
const GraphController = require('../controllers/graph');

const router = express.Router();

router.get('/:publicId', auth, GraphController.getBulkGraphRevisions);
router.post('/search/', auth, GraphController.searchByTag);
router.get('/internal/:internalId', auth, GraphController.getGraphByInternalId);
router.get('/:publicId/latest', auth, GraphController.getLatestGraphRevision);
router.post('/', auth, GraphController.createGraph);
router.put('/:publicId', auth, GraphController.updateGraph);

// preview
router.get('/:publicId/preview.svg', GraphController.preview.svg);
router.get('/:publicId/preview.png', GraphController.preview.png);

module.exports = router;
