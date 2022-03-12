const Graphs = require('../models/graphs');
const Users = require('../models/users');
const Vertex = require('../models/vertex');
const Edge = require('../models/edge');
const uuid = require('uuid');
const _ = require('lodash');
const { Types } = require('mongoose');

const preview = require('../lib/preview');
const { messages } = require('../config/constants');
const { toHeader } = require('./user');
const {
  LATEST_REVISION_AGGREGATOR,
  USER_LOOKUP_PROJECTION,
  FORK_COUNT_LATEST_REV_AGGREGATOR
} = require('../lib/dbHelper');

module.exports.searchByTag = async (req, res) => {
  try {
    const tag = req.params.tag || req.body.tag;
    const graph = await Graphs.aggregate([
      { $match: { $text: { $search: tag } } },
      ...FORK_COUNT_LATEST_REV_AGGREGATOR,
      ...USER_LOOKUP_PROJECTION
    ]);
    if (!graph || !tag) {
      throw new Error('Graph not found.');
    }

    res.status(200).send(graph.map(toHeader));
  } catch (err) {
    res.status(404).send({ message: messages.GRAPH_NOT_FOUND, err });
  }
};

module.exports.getLatestGraphRevision = async (req, res) => {
  try {
    const graphId = req.params.publicId || req.body.publicId;
    const graph = await Graphs.findOne({ publicId: graphId })
      .populate('user', ['name', '_id'])
      .sort({ createdAt: -1 })
      .exec();
    if (!graph || !graphId) {
      throw new Error('Graph not found.');
    }

    res.status(200).send(graph.toJSON());
  } catch (err) {
    res.status(404).send({ message: messages.GRAPH_NOT_FOUND, err });
  }
};

module.exports.getGraphByInternalId = async (req, res) => {
  try {
    const graphId = req.params.internalId || req.body.internalId;
    const graph = await Graphs.findById(graphId);
    if (!graph || !graphId) {
      throw new Error('Graph not found.');
    }

    res.status(200).send(graph.toJSON());
  } catch (err) {
    res.status(404).send({ message: messages.GRAPH_NOT_FOUND, err });
  }
};

module.exports.getBulkGraphRevisions = async (req, res) => {
  try {
    const graphId = req.params.publicId || req.body.publicId;
    const limit = req.params.limit || req.body.limit;
    let graph = Graphs.find({ publicId: graphId }).sort({ createdAt: -1 });
    if (limit) {
      graph = graph.limit(limit);
    }

    graph = await graph.exec();

    if (!graph || !graphId) {
      throw new Error('Graph not found.');
    }

    res.status(200).send(graph);
  } catch (err) {
    res.status(404).send({ message: messages.GRAPH_NOT_FOUND, err });
  }
};

module.exports.resolveGraph = async (req, res) => {
  try {
    const graphId = req.params.internalId || req.body.internalId;
    const graph = await Graphs.findById(graphId);
    if (!graph || !graphId) {
      throw new Error('Graph not found.');
    }
    for (const key in req.body) {
      graph[key] = req.body[key];
      graph.markModified(key);
    }
    graph.resolved = true;
    graph.markModified('resolved');
    await graph.save();
    res.status(200).send(graph.toJSON());
  } catch (err) {
    res.status(404).send({ message: messages.GRAPH_NOT_FOUND, err });
  }
};

module.exports.updateGraph = async (req, res) => {
  try {
    const graphId = req.params.publicId || req.body.publicId;
    const graph = await Graphs.findOne({ publicId: graphId });
    if (!graph || !graphId) {
      throw new Error('Parent graph does not exist.');
    }

    const graphDoc = new Graphs({
      user: req.user,
      isPublic: req.body.nodes && req.body.data?.shared,
      publicId: graphId,
      data: req.body.data,
      resolved: req.body.resolved,
      name: req.body.name || '',
      nodes: req.body.nodes,
      edges: req.body.edges,
      tags: extractTags(req.body)
    });
    await graphDoc.save();
    res.status(200).send(graphDoc.toJSON());
  } catch (err) {
    res.status(400).send({ message: messages.GRAPH_UPDATE_FAILED, err });
  }
};

module.exports.createGraph = async (req, res) => {
  try {
    const graphDoc = new Graphs({
      user: req.user,
      isPublic: req.body.nodes && req.body.data?.shared,
      name: req.body.name || '',
      data: req.body.data,
      resolved: req.body.resolved,
      nodes: req.body.nodes,
      edges: req.body.edges,
      tags: extractTags(req.body)
    });
    await graphDoc.save();
    res.status(200).send(graphDoc.toJSON());
  } catch (e) {
    res.status(500).send({ message: messages.GRAPH_CREATE_FAILED, error: e });
  }
};

module.exports.getSubGraphs = async (req, res) => {
  try {
    const graphId = req.params.publicId || req.body.publicId;
    const graphs = await Graphs.findSubgraphs(graphId, req.user._id);
    if (!graphs || !graphId) {
      throw new Error('Graph not found.');
    }

    const graphsWithForkCount = [];
    for (const graph of graphs) {
      const forkCount = await Graphs.countDocuments({
        'data.parentId': graph.publicId,
        user: { $ne: Types.ObjectId(`${req.user._id}`) }
      }).exec();
      const data = Object.assign({}, graph);

      data.id = data.internalId;
      delete data.internalId;
      data.nodes = data.nodes.length;
      data.edges = data.edges.length;

      graphsWithForkCount.push({
        ...data,
        forks: forkCount
      });
    }
    res.status(200).send(graphsWithForkCount);
  } catch (err) {
    console.log(err);
    res.status(404).send({ message: messages.GRAPH_NOT_FOUND, err });
  }
};

module.exports.getProposalGraphs = async (req, res) => {
  try {
    const graphId = req.params.publicId || req.body.publicId;
    const graph = await Graphs.findOne({ publicId: graphId })
      .populate('user', ['name', '_id'])
      .sort({ createdAt: -1 })
      .exec();
    if (!graph || !graphId) {
      throw new Error('Graph not found.');
    }
    const forks = await Graphs.aggregate([
      {
        $match: {
          'data.parentId': graphId,
          user: { $ne: Types.ObjectId(req.user._id) }
        }
      },
      ...LATEST_REVISION_AGGREGATOR,
      ...USER_LOOKUP_PROJECTION
    ]);

    res.status(200).send({ ...graph.toJSON(), forks });
  } catch (err) {
    res.status(404).send({ message: messages.GRAPH_NOT_FOUND, err });
  }
};

const getPreviewData = (publicId) => {
  return Graphs.findOne({ publicId: publicId })
    .sort({ createdAt: -1 })
    .then((graph) =>
      graph
        .populate('nodes', ['id', 'attributes'])
        .populate('edges', ['source', 'target', 'attributes'])
        .execPopulate()
    );
};

const extractTags = (req) => {
  const tags = [];
  for (const node of req.nodes) {
    if (node.data) {
      for (const tag of Object.values(_.omit(node.data, ['', '']))) {
        tags.push(tag);
      }
    }
    if (node.attributes && node.attributes.text) {
      tags.push(node.attributes.text);
    }
  }
  for (const edge of req.edges) {
    if (edge.data) {
      for (const tag of Object.values(edge.data)) {
        tags.push(tag);
      }
    }
  }

  if (req.name) {
    tags.push(req.name);
  }

  return tags;
};

// Use data.parentId to iterate until the root graph is found
// TODO Finish it
module.exports.getRootNode = async (req, res) => {
  try {
    const graphId = req.params.publicId || req.body.publicId;
    const graph = await Graphs.findOne({ publicId: graphId });

    if (!graph || !graphId) {
      throw new Error('Graph not found.');
    }
  } catch (err) {
    res.status(404).send({ message: messages.GRAPH_NOT_FOUND, err });
  }
};

module.exports.preview = {
  svg: (req, res) => {
    getPreviewData(req.params.publicId)
      .then((graph) => {
        return preview.svg(graph).then((svg) => {
          res.setHeader('content-type', 'image/svg+xml');
          res.status(200).send(svg);
        });
      })
      .catch((message) => res.status(404).send({ message }));
  },
  png: (req, res) => {
    getPreviewData(req.params.publicId)
      .then((graph) => {
        preview.png(graph).then((buffer) => {
          res.setHeader('content-type', 'image/png');
          res.status(200).send(buffer);
        });
      })
      .catch((message) => res.status(404).send({ message }));
  }
};
