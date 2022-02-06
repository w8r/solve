const { Schema } = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const VertexSchema = new Schema({
  id: {
    type: String,
    default: uuidv4
  },
  data: {
    type: Object,
    required: false,
    default: {}
  },
  attributes: {
    type: Object,
    required: false,
    default: {}
  }
});

VertexSchema.methods.toJSON = function () {
  const data = this.toObject();
  data.attributes = data.attributes || {};
  data.data = data.data || {};
  delete data.__v;

  return data;
};

module.exports = VertexSchema;
