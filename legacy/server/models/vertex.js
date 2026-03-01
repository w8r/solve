const { Schema } = require('mongoose');

const VertexSchema = new Schema(
  {
    _id: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
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
  },
  {
    _id: false
  }
);

VertexSchema.methods.toJSON = function () {
  const data = this.toObject();
  data.attributes = data.attributes || {};
  data.data = data.data || {};
  delete data.__v;

  return data;
};

module.exports = VertexSchema;
