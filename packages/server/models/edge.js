const { Schema } = require('mongoose');

const EdgeSchema = new Schema({
  data: {
    type: Object,
    required: false,
    default: {}
  },
  attributes: {
    type: Object,
    required: false,
    default: {}
  },
  source: {
    type: Schema.Types.String,
    required: true
  },
  target: {
    type: Schema.Types.String,
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

module.exports = EdgeSchema;
