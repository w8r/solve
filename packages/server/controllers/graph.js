const Graphs = require('../models/graphs');
const Users = require('../models/users');
const Vertex = require('../models/vertex');
const Edge = require('../models/edge');
const uuid = require('uuid');
const _ = require('lodash');

const preview = require('../lib/preview');
const { messages } = require('../config/constants');

module.exports.getLatestGraphRevision = async (req, res) => {
  try {
    const graph = await Graphs.findOne({publicId: req.params.publicId || req.body.publicId});
    if (!graph || !(req.params.publicId || req.body.publicId)) {
      throw new Error('Graph not found.');
    }

    const result = await graph
      .populate('nodes', ['id', 'attributes', 'data'])
      .populate('edges', ['source', 'target', 'attributes', 'data'])
      .execPopulate();
    res.status(200).send(result);
  } catch (err) {
    res.status(404).send({ message: messages.GRAPH_NOT_FOUND, err });
  }
};

module.exports.updateGraph = async (req, res) => {
  try {
    const graph = await Graphs.findOne({publicId: req.params.publicId || req.body.publicId});
    if (!graph || !(req.params.publicId || req.body.publicId)) {
      throw new Error('Parent graph does not exist.');
    }

    const graphDoc = new Graphs({
      user: req.body.user,
      isPublic: req.body.nodes && req.body.data.shared,
      publicId: req.body.publicId,
      name: req.body.name || '',
      nodes: req.body.nodes.map((node) => new Vertex(node)),
      edges: req.body.edges.map((edge) => new Edge(edge))
    });
    await graphDoc.save();
    res.status(200).send(graphDoc.toJSON());
  } catch {
    res.status(400).send({ message: messages.GRAPH_UPDATE_FAILED, err });
  }
};

module.exports.createGraph = async (req, res) => {
  try {
    const graphDoc = new Graphs({
      user: req.body.user,
      isPublic: req.body.nodes && req.body.data.shared,
      name: req.body.name || '',
      nodes: req.body.nodes.map((node) => new Vertex(node)),
      edges: req.body.edges.map((edge) => new Edge(edge))
    });
    await graphDoc.save();
    res.status(200).send(graphDoc.toJSON());
  } catch (e) {
    res.status(500).send({ message: messages.GRAPH_CREATE_FAILED, error: e });
  }
};

const getPreviewData = (graphId) =>
  Graphs.findById(graphId).then((graph) =>
    graph
      .populate('nodes', ['id', 'attributes'])
      .populate('edges', ['source', 'target', 'attributes'])
      .execPopulate()
  );

module.exports.preview = {
  svg: (req, res) => {
    getPreviewData(req.params.id)
      .then((graph) => {
        preview.svg(graph).then((svg) => {
          res.setHeader('content-type', 'image/svg+xml');
          res.status(200).send(svg);
        });
      })
      .catch((message) => res.status(404).send({ message }));
  },
  png: (req, res) => {
    getPreviewData(req.params.id)
      .then((graph) => {
        preview.png(graph).then((buffer) => {
          res.setHeader('content-type', 'image/png');
          res.status(200).send(buffer);
        });
      })
      .catch((message) => res.status(404).send({ message }));
  }
};
