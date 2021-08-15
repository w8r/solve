const { Schema, model } = require("mongoose");
const validator = require('validator');
const config = require('../config/development');
const { messages } = require('../config/constants');

const Vertex = require('./vertex');
const Edge = require('./edge');

const graphSchema = new Schema({
  data: Object,
  _users: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
  name: {
    type: String,
    unique: false
  },
  nodes: [{
    type: Schema.Types.ObjectId,
    ref: 'Vertex'
  }],
  edges: [{
    type: Schema.Types.ObjectId,
    ref: 'Edge'
  }]
}, {
  timestamps: true
});


graphSchema.statics.findById = (id) => {
  return Graphs.findOne({ _id: id }).exec();
};


graphSchema.statics.findByUser = (userId) => {
  return Graphs.find({ _users: userId }).exec();
};

graphSchema.methods.toJSON = function () {
  const data = this.toObject();

  delete data._users;
  //delete data.updatedAt;
  data.uuid = data._id;
  delete data._id;
  delete data.__v;

  return data;
};


const Graphs = model('Graphs', graphSchema);

module.exports = Graphs;
