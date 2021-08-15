const Graphs = require('../models/graphs');
const Users = require('../models/users');
const Vertex = require('../models/vertex');
const Edge = require('../models/edge');
const uuid = require('uuid');

const preview = require('../lib/preview');

module.exports.getGraph = (req, res) => {
  Graphs.findById(req.params.id)
    .then((graph) =>
      graph
        .populate('nodes', ['id', 'attributes', 'data'])
        .populate('edges', ['source', 'target', 'attributes', 'data'])
        .execPopulate()
    )
    .then((graph) => res.status(200).send(graph))
    .catch((err) =>
      res.status(404).send({ message: messages.GRAPH_NOT_FOUND, err })
    );
};

module.exports.updateGraphNode = (req, res) => {
  Graphs.findById(req.params.id).then((graph) => {
    const graphId = graph._id;
    const nodeId = req.params.nodeId;
    let vertex;
    if (!nodeId || nodeId === 'new') {
      new Vertex({
        id: req.body.id || nodeId || uuid.v4(),
        attributes: req.body.attributes || {},
        data: req.body.data || {},
        graph: [graphId]
      })
        .save()
        .then((newVertex) => {
          vertex = newVertex;
          graph.nodes.push(vertex._id);
          return graph.save();
        })
        .then(() => res.status(200).send(vertex.toJSON()));
    } else {
      Vertex.findById(nodeId)
        .then((vertex) => {
          return vertex.save({
            data: { ...vertex.data, ...(req.body.data || {}) },
            attributes: {
              ...vertex.attributes,
              ...(req.body.attributes || {})
            }
          });
        })
        .then((vertex) => res.status(200).send(vertex.toJSON()));
    }
  });
};

module.exports.updateGraph = (req, res) => {
  Graphs.findById(req.params.id)
    .then((graph) => {
      const graphId = graph._id;
      const { nodes = [], edges = [] } = req.body;
      Promise.resolve()
        .then(() => {
          const operations = nodes.map((node) => ({
            updateOne: {
              filter: { _id: node._id }, // use truly unique
              update: { ...node, graph: [graphId] },
              upsert: true,
              ordered: false
            }
          }));
          if (operations.length !== 0) return Vertex.bulkWrite(operations);
          return Promise.resolve();
        })
        .then((data) => {
          // filter edges by the internal ids
          const nodesIdx = nodes.reduce((acc, node) => {
            acc.set(node.id, node._id);
            return acc;
          }, new Map());
          edges.forEach((edge, i) => {
            edge._source = edge._source || nodesIdx.get(edge.source);
            edge._target = edge._target || nodesIdx.get(edge.target);
            // can't add
            if (edge._target === undefined || edge._source === undefined) {
              edges.splice(i, 1);
            }
          });
        })
        .then(() => {
          const operations = edges.map((edge) => ({
            updateOne: {
              filter: { _id: edge._id },
              update: { ...edge, graph: [graphId] },
              upsert: true
            }
          }));
          if (operations.length !== 0) return Edge.bulkWrite(operations);
          return Promise.resolve();
        });
    })
    .then(() => res.status(200).json({ success: true }))
    .catch((message) => res.status(404).send({ message }));
};

module.exports.updateGraphEdge = (req, res) => {
  Graphs.findById(req.params.id).then((graph) => {
    const graphId = graph._id;
    const edgeId = req.params.edgeId;
    let edge;
    if (!edgeId || edgeId === 'new') {
      Promise.all([
        Vertex.findById(req.body._source),
        Vertex.findById(req.body._target)
      ])
        .then(([source, target]) => {
          return new Edge({
            id: edgeId || uuid.v4(),
            _source: source._id,
            _target: target._id,
            source: source.id,
            target: target.id,
            data: req.body.data || {},
            attributes: req.body.attributes || {},
            graph: [graphId]
          }).save();
        })
        .then((newEdge) => {
          edge = newEdge;
          graph.edges.push(newEdge._id);
          return graph.save();
        })
        .then(() => {
          res.status(200).send(edge.toJSON());
        });
      //   new Edge({
      //     id: edgeId || '',
      //     attributes: req.body.attributes || {},
      //     data: req.body.data || {},
      //     graph: [graphId]
      //   }).save().then(newVertex => {
      //     vertex = newVertex;
      //     graph.edges.push(vertex._id);
      //     return graph.save();
      //   }).then(() => res.status(200).send(vertex.toJSON()));
      // } else {
      //   Vertex.findById(nodeId)
      //     .then(vertex => {
      //       return vertex.save({
      //         data: { ...vertex.data, ...req.body.data || {} },
      //         attributes: { ...vertex.attributes, ...req.body.attributes || {} }
      //       });
      //     }).then((vertex) => res.status(200).send(vertex.toJSON()));
    }
  });
};

module.exports.updateNode = (req, res) => {
  Vertex.findById(req.params.nodeId)
    .then((vertex) => {
      vertex.data = { ...vertex.data, ...(req.body.data || {}) };
      vertex.attributes = {
        ...vertex.attributes,
        ...(req.body.attributes || {})
      };
      return vertex
        .save()
        .then((vertex) => res.status(200).send(vertex.toJSON()));
    })
    .catch(() => res.status(404).send({ error: 'Node not found' }));
};

module.exports.updateEdge = (req, res) => {
  Edge.findById(req.params.edgeId)
    .then((edge) => {
      edge.data = { ...edge.data, ...(req.body.data || {}) };
      edge.attributes = {
        ...edge.attributes,
        ...(req.body.attributes || {})
      };
      return edge.save().then((edge) => res.status(200).send(edge.toJSON()));
    })
    .catch(() => res.status(404).send({ error: 'Edge not found' }));
};

module.exports.createGraph = (req, res) => {
  new Graphs({
    _users: [req.user],
    data: req.body.data || {},
    name: req.body.name || ''
  }).save((graphErr, graphDoc) => {
    if (graphErr) return res.status(500).json({ error: graphErr });

    const graphId = graphDoc._id;
    const graph = req.body;
    Vertex.insertMany(
      graph.nodes.map((node) => ({ ...node, graph: [graphId] }))
    )
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
        ).then((storedEdges) => ({ nodes: storedNodes, edges: storedEdges }));
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
          .catch((err) => res.status(500).json(err));
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
