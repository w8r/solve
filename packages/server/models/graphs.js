const { Schema, model } = require('mongoose');
const config = require('../config/development');
const { messages } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');

const Vertex = require('./vertex');
const Edge = require('./edge');
const Users = require('./users');

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
graphSchema.index({'createdAt': -1});
graphSchema.index({'tags': 'text'});


graphSchema.statics.findById = (id) => {
  return Graphs.findOne({ _id: id }).exec();
};

graphSchema.statics.findByUser = (userId) => {
  return Graphs.find({ user: userId }).exec();
};

graphSchema.methods.toJSON = function () {
  const data = this.toObject();

  data.user = data.user._id;
  data.id = data._id;
  delete data._id;
  delete data.__v;

  return data;
};

const Graphs = model('Graphs', graphSchema);

module.exports = Graphs;
