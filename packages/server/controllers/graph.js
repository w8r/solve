const Graphs = require('../models/graphs');
const Users = require('../models/users');
const Vertex = require('../models/vertex');
const Edge = require('../models/edge');
const uuid = require('uuid');
const createError = require('http-errors');
const _ = require('lodash');

const preview = require('../lib/preview');
const { messages } = require('../config/constants');

module.exports.getGraph = async (req, res) => {
  try {
    const graph = await Graphs.findById(req.params.id);
    const result = await graph
      .populate('nodes', ['id', 'attributes', 'data'])
      .populate('edges', ['source', 'target', 'attributes', 'data'])
      .execPopulate();
    res.status(200).send(result);
  } catch (err) {
    res.status(404).send({ message: messages.GRAPH_NOT_FOUND, err });
  }
};

module.exports.updateGraphNode = async (req, res) => {
  try {
    const graph = await Graphs.findById(req.params.id);
    const nodeId = req.params.nodeId || req.body.id;
    // returns actual object reference, not a clone
    let vertex = _.find(graph.nodes, { id: nodeId });

    if (!vertex) {
      vertex = {
        id: nodeId || uuid.v4(),
        attributes: req.body.attributes || {},
        data: req.body.data || {}
      };
      graph.nodes.push(vertex);
    } else {
      // since its actual object, we can modify it here
      Object.assign(vertex, {
        id: vertex.id,
        ...{
          data: { ...vertex.data, ...(req.body.data || {}) },
          attributes: {
            ...vertex.attributes,
            ...(req.body.attributes || {})
          }
        }
      });
    }

    // set the field changed so mongoose is aware of the object.assign above
    graph.markModified('nodes');
    await graph.save();
    res.status(200).send(vertex);
  } catch {
    res.status(400).send({ message: messages.GRAPH_UPDATE_FAILED, err });
  }
};

module.exports.updateGraph = (req, res) => {
  // TODO: UPDATE GRAPH METADATA
};

module.exports.updateGraphEdge = async (req, res) => {
  try {
    const graph = await Graphs.findById(req.params.id);
    const edgeId = req.params.edgeId || req.body.id;
    const source = req.params.source || req.body.source;
    const target = req.params.target || req.body.target;

    // check if source or target nodes exist
    if (
      !_.find(
        graph.nodes.some((node) => node.id == target || node.id == source)
      ) ||
      source == target
    ) {
      res
        .status(400)
        .send({
          message: messages.GRAPH_UPDATE_FAILED,
          error: 'Invalid source or target.'
        });
    }

    // returns actual object reference, not a clone
    let edge = _.find(graph.edges, { id: edgeId });

    if (!edge) {
      edge = {
        id: edgeId || uuid.v4(),
        source: source,
        target: target,
        data: req.body.data || {},
        attributes: req.body.attributes || {}
      };
      graph.edges.push(edge);
    } else {
      // since its actual object, we can modify it here
      Object.assign(edge, {
        id: edge.id,
        source: source,
        target: target,
        ...{
          data: { ...edge.data, ...(req.body.data || {}) },
          attributes: {
            ...edge.attributes,
            ...(req.body.attributes || {})
          }
        }
      });
    }

    // set the field changed so mongoose is aware of the object.assign above
    graph.markModified('edges');
    await graph.save();
    res.status(200).send(vertex);
  } catch {
    res.status(400).send({ message: messages.GRAPH_UPDATE_FAILED, err });
  }
};

module.exports.createGraph = (req, res, next) => {
  new Graphs({
    _users: [req.user],
    data: req.body.data || {},
    name: req.body.name || ''
  }).save((graphErr, graphDoc) => {
    if (graphErr) return res.status(500).json({ error: graphErr });

    const graphId = graphDoc._id;
    const graph = req.body;

    Vertex.insertMany(
      graph.nodes.map((node) => ({
        ...node,
        graph: [graphId],
        attributes: node.attributes || {},
        data: node.data || {}
      }))
    )
      .catch((err) => next(createError(500, err)))
      .then((storedNodes) => {
        const nodesIdx = storedNodes.reduce((acc, n) => {
          acc.set(n.id, n._id);
          return acc;
        }, new Map());
        return Edge.insertMany(
          graph.edges.map((edge) => ({
            ...edge,
            _source: nodesIdx.get(edge.source),
            _target: nodesIdx.get(edge.target),
            graph: [graphId]
          }))
        )
          .catch((err) => next(createError(500, err)))
          .then((storedEdges) => ({ nodes: storedNodes, edges: storedEdges }));
      })
      .then(({ nodes, edges }) => {
        if (req.body.data && req.body.data.shared) {
          return Users.find().then((users) => ({ nodes, edges, users }));
        }
        return { nodes, edges, users: [req.user] };
      })
      .then(({ nodes, edges, users }) => {
        graphDoc
          .updateOne({
            nodes: nodes.map((n) => n._id),
            edges: edges.map((e) => e._id),
            _users: users
          })
          .exec()
          .then(() => {
            res.status(200).json({
              success: true,
              graph: graphId
            });
          })
          .catch((err) => next(createError(500, err)));
      });
  });
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
