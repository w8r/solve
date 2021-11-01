const Graphs = require('../models/graphs');
const Users = require('../models/users');
const constants = require('../config/constants');
const emailer = require('../lib/emailer');

module.exports.status = ({ user }, res, next) => {
  if (user) res.send(user);
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

module.exports.getUserGraphs = async (userId, res) => {
  try {
    const graphs = await Graphs.findByUser(userId);
    res.status(200).json(graphs.map(toHeader));
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Error retrieving graphs',
      data: err
    });
  }
};

module.exports.requestEmail = async (params, res) => {
  try {
    const User = params.user;
    if (User.status !== constants.STATUS_UNVERIFIED_EMAIL) {
      res.status(400).json({
        error: 'Your email is already verified.'
      });
    } else {
      User.setToken(constants.TOKEN_PURPOSE_VERIFY_EMAIL);
      const token = User.token;
      await emailer.sendVerificationEmail(User.email, token);

      res.status(200).json({ message: 'Email is sent.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Error sending verification email',
      data: err
    });
  }
};

module.exports.verifyEmail = async (params, res) => {
  try {
    const User = await Users.findById(params.user._id);
    if (User.status !== constants.STATUS_UNVERIFIED_EMAIL) {
      res.status(400).json({
        error: 'Your email is already verified.'
      });
    } else {
      const token = User.token;
      const tokenPurpose = User.tokenPurpose;

      if (
        params.body.token === token &&
        tokenPurpose === constants.TOKEN_PURPOSE_VERIFY_EMAIL
      ) {
        User.clearToken();
        User.status = constants.STATUS_ACTIVE;
        User.save();
        res.status(200).json({ message: 'Email is verified.' });
      } else {
        console.log(User);
        res.status(400).json({
          error: 'Invalid token.'
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      error: 'Error sending verification email',
      data: err
    });
  }
};
