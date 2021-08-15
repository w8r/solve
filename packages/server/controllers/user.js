const Graphs = require('../models/graphs');

module.exports.status = ({ token, user }, res) => {
  if (token && user) {
    res
      // .cookie(config.jwt.name, token, {
      //   httpOnly: true
      // })
      .send({ user, token });
  }
};

const toHeader = (graph) => ({
  id: graph._id,
  nodes: graph.get('nodes').length,
  edges: graph.get('edges').length,
  data: graph.data
});

module.exports.getUserGraphs = (userId) =>
  Graphs.findByUser(userId)
    .then((graphs) => {
      res.status(200).json(graphs.map(toHeader));
    })
    .catch((err) =>
      res.status(500).json({
        error: 'Error retrieving graphs',
        data: err
      })
    );
