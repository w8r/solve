const express = require('express');
const auth = require('../middleware/auth');
const { messages } = require('../config/constants');
const Graphs = require('../models/graphs');
const Users = require('../models/users');
const Vertex = require('../models/vertex');
const Edge = require('../models/edge');

const GraphController = require('../controllers/graph');

const router = express.Router();

router.get('/:id', auth, GraphController.getGraph);
router.post('/:id', auth, GraphController.updateGraph);

// preview
router.get('/:id/preview.svg', GraphController.preview.svg);
router.get('/:id/preview.png', GraphController.preview.png);
router.post('/:id/nodes/:nodeId?', auth, GraphController.updateGraphNode);
router.post('/:id/edges/:edgeId?', auth, GraphController.updateGraphEdge);
router.post('/nodes/:nodeId', auth, GraphController.updateNode);
router.post('/edges/:edgeId', auth, GraphController.updateEdge);
router.put('/:id', auth, GraphController.createGraph);

module.exports = router;
