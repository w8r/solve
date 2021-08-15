const { Schema, model } = require('mongoose');

const EdgeSchema = new Schema({
  data: Object,
  attributes: Object,

  source: {
    type: Schema.Types.String,
    required: true
  },
  target: {
    type: Schema.Types.String,
    required: true
  },

  _source: {
    type: Schema.Types.ObjectId,
    ref: 'Vertex',
    required: true
  },
  _target: {
    type: Schema.Types.ObjectId,
    ref: 'Vertex',
    required: true
  }
});

EdgeSchema.methods.toJSON = function () {
  const data = this.toObject();
  data.attributes = data.attributes || {};
  data.data = data.data || {};
  delete data.__v;

  return data;
};

module.exports = model('Edge', EdgeSchema);
