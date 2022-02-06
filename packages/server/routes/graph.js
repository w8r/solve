const express = require('express');
const auth = require('../middleware/auth');
const GraphController = require('../controllers/graph');

const router = express.Router();

router.get('/:publicId', auth, GraphController.getBulkGraphRevisions);
router.get('/internal/:internalId', auth, GraphController.getGraphByInternalId);
router.get('/:publicId/latest', auth, GraphController.getLatestGraphRevision);
router.post('/', auth, GraphController.createGraph);
router.put('/:publicId', auth, GraphController.updateGraph);

// preview
router.get('/:id/preview.svg', GraphController.preview.svg);
router.get('/:id/preview.png', GraphController.preview.png);

module.exports = router;
