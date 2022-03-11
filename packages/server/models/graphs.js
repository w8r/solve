const { Schema, model } = require('mongoose');
const config = require('../config/development');
const { messages } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');
const { FORK_COUNT_LATEST_REV_AGGREGATOR } = require('../lib/dbHelper');

const Vertex = require('./vertex');
const Edge = require('./edge');
const Users = require('./users');

const dataSchema = new Schema(
  {
    shared: {
      type: Boolean,
      default: false
    },
    parentId: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

// number of subgraphs => number of graphs with same parentId but user is the same (dashboard)

/* SUBGRAPHS SCREEN
  graphs with same parentId but user is the same -> only publicId and number of forks
  forks are same parentId but different user 


  SUBGRAPH SCREEN
  graphs with same parentId but different user -> only publicId and metadata (name, nr of edges/nodes etc)

  FORK VIEWER
  graph with user data (id and username)

  * Accepting a fork creates a subgraph of mine

  For forked and absorbed graphs -> add metadata which tells it forked from a user
*/

const graphSchema = new Schema(
  {
    isPublic: {
      type: Boolean,
      default: false
    },
    publicId: {
      type: String,
      default: uuidv4
    },
    name: {
      type: String,
      unique: false
    },
    user: {
      type: Users,
      required: true,
      ref: 'Users'
    },
    resolved: {
      type: Boolean,
      default: false
    },
    data: {
      type: dataSchema,
      default: {
        shared: false,
        parentId: null
      }
    },
    nodes: {
      type: [Vertex]
    },
    edges: {
      type: [Edge]
    },
    tags: {
      type: [String]
    }
  },
  {
    timestamps: true
  }
);

// Automatically sort the graphs by creation date in order to get the latest revision first
graphSchema.index({ createdAt: -1 });
graphSchema.index({ tags: 'text' });

graphSchema.statics.findById = (id) => {
  return Graphs.findOne({ _id: id }).exec();
};

graphSchema.statics.findByUser = (userId) => {
  // get graphs latest by created at and distinct by public id
  // project all fields
  return Graphs.aggregate([
    {
      $match: {
        user: userId
      }
    },
    ...FORK_COUNT_LATEST_REV_AGGREGATOR
  ]);
};

graphSchema.methods.toJSON = function () {
  const data = this.toObject();

  data.id = data._id;
  delete data._id;
  delete data.__v;

  return data;
};

const Graphs = model('Graphs', graphSchema);

module.exports = Graphs;
