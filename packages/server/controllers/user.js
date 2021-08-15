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

/**
 * @function preloadTargetUser
 * Preload the target user object and assign it to res.locals.targetUser.
 *
 * @param {string} userId The target user ID
 */
// module.exports.preloadTargetUser = (req, res, next, userId) => {
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return next({(422, 'Invalid user ID'));
//   }

//   User.findById(userId)
//     .then((targetUser) => {
//       if (!targetUser) {
//         throw createError(422, 'User ID does not exist');
//       }
//       res.locals.targetUser = targetUser;
//       next();
//     })
//     .catch(next);
// };

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
