const { Schema, model } = require('mongoose');

const VertexSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  graph: [{
    type: Schema.Types.ObjectId,
    ref: 'Graphs'
  }],
  data: {
    type: Object,
    required: false
  },
  attributes: {
    type: Object,
    required: true
  }
});

VertexSchema.methods.toJSON = function () {
  const data = this.toObject();
  data.attributes = data.attributes || {};
  data.data = data.data || {};
  delete data.__v;

  return data;
}

module.exports = model('Vertex', VertexSchema);