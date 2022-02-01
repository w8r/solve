const { Schema, model } = require("mongoose");
const validator = require('validator');
const config = require('../config/development');
const { messages } = require('../config/constants');

const Vertex = require('./vertex');
const Edge = require('./edge');
const Users = require("./users");

const graphSchema = new Schema({
  data: Object,
  public: { 
      type: Boolean,
      default: false
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
    type: [Vertex],
  },
  edges: {
    type: [Edge]
  }
}, {
  timestamps: true
});


graphSchema.statics.findById = (id) => {
  return Graphs.findOne({ _id: id }).exec();
};


graphSchema.statics.findByUser = (userId) => {
  return Graphs.find({ user: userId }).exec();
};

graphSchema.methods.toJSON = function () {
  const data = this.toObject();
  
  data.user = data.user._id;
  data.uuid = data._id;
  delete data._id;
  delete data.__v;

  return data;
};


const Graphs = model('Graphs', graphSchema);

module.exports = Graphs;
