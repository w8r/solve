const Graphs = require('../models/graphs');
const Users = require('../models/users');
const constants = require('../config/constants');
const emailer = require('../lib/emailer');
const Validator = require('yup');
const createError = require('http-errors');

module.exports.status = ({ user }, res, next) => {
  if (user) res.send(user);
};

module.exports.toHeader = (graph) => ({
  id: graph.publicId,
  name: graph.name,
  internalId: graph._id,
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

module.exports.getUserGraphs = async (req, res) => {
  try {
    const graphs = await Graphs.findByUser(req.params.id ?? req.user._id);
    res.status(200).json(graphs.map(this.toHeader));
  } catch (err) {
    res.status(500).json({
      error: 'Error retrieving graphs',
      data: err
    });
  }
};

/**
 * @param {User} user
 */
const setUnverifiedEmail = async (user) => {
  user.setVerifyEmailToken();
  return emailer.sendVerificationEmail(user.email, user.token);
};

module.exports.setUnverifiedEmail = setUnverifiedEmail;

module.exports.requestEmail = async (params, res, next) => {
  try {
    const User = params.user;
    if (User.status !== constants.STATUS_UNVERIFIED_EMAIL) {
      res.status(400).json({
        error: 'Your email is already verified.'
      });
    } else {
      await setUnverifiedEmail(User);
      res.status(200).json({ message: 'Email is sent.' });
    }
  } catch (err) {
    res.status(500).json({
      error: 'Error sending verification email',
      data: err
    });
  }
};

module.exports.verifyEmail = async (params, res) => {
  try {
    const User = await Users.findOne({ token: params.query.token });
    if (User.status !== constants.STATUS_UNVERIFIED_EMAIL) {
      res.status(400).json({
        error: 'Your email is already verified.'
      });
    } else {
      const tokenPurpose = User.tokenPurpose;
      const tokenExpiration = User.tokenExpiration;

      if (
        tokenPurpose === constants.TOKEN_PURPOSE_VERIFY_EMAIL &&
        tokenExpiration > new Date()
      ) {
        User.clearToken();
        User.status = constants.STATUS_ACTIVE;
        User.save();
        res.status(200).redirect('/'); // json({ message: 'Email is verified.' });
      } else if (tokenPurpose === constants.TOKEN_PURPOSE_RESET_PASSWORD) {
        res.status(200).redirect(`/reset-password/${User.token}`);
      } else {
        res.status(400).json({
          error: 'Token is invalid or expired.'
        });
      }
    }
  } catch (err) {
    res.status(400).send('Token is invalid or expired.');
  }
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    const User = await Users.findOne({ token: params.query.token });
    if (User.status !== constants.STATUS_UNVERIFIED_EMAIL) {
      res.status(400).json({
        error: 'Your email is already verified.'
      });
    } else {
      const tokenPurpose = User.tokenPurpose;
      const tokenExpiration = User.tokenExpiration;

      if (
        tokenPurpose === constants.TOKEN_PURPOSE_VERIFY_EMAIL &&
        tokenExpiration > new Date()
      ) {
        User.clearToken();
        User.status = constants.STATUS_ACTIVE;
        User.save();
        res.status(200).redirect('/'); // json({ message: 'Email is verified.' });
      } else if (tokenPurpose === constants.TOKEN_PURPOSE_RESET_PASSWORD) {
        res.status(200).redirect(`/reset-password/${User.token}`);
      } else {
        res.status(400).json({
          error: 'Token is invalid or expired.'
        });
      }
    }
  } catch (err) {
    res.status(400).send('Token is invalid or expired.');
  }
};

/**
 * JOI schema for validating resetPassword payload
 */
const resetPasswordSchema = Validator.object({
  token: Validator.string().required(),
  password: Validator.string().required('Required'),
  passwordRepeat: Validator.string()
    .equals([Validator.ref('password')], "Passwords don't match")
    .required('Required')
});

const userDoesNotExist = () => {
  return createError(400, {
    message: 'User with this email does not exist',
    code: constants.ERROR_CODES.AUTH_USER_NOT_FOUND
  });
};

function requestResetPassword(req, res, next) {
  Users.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).json({ error: err });
    if (!user) return next(userDoesNotExist());

    return Promise.resolve()
      .then(() => user.setResetPasswordToken())
      .then(() => emailer.sendResetPasswordEmail(user.email, user.token))
      .then(() =>
        res.status(200).json({ message: 'Email sent', success: true })
      )
      .catch(next);
  });
}

function resetPassword(req, res, next) {
  resetPasswordSchema
    .validate(req.body)
    .catch(next)
    .then(() =>
      Users.findOne({ token: req.body.token }, (err, user) => {
        if (err) return res.status(500).json({ error: err });
        if (!user)
          return next(
            createError(400, {
              message: `User not found or didn't request password reset`,
              code: constants.ERROR_CODES.AUTH_USER_NOT_FOUND
            })
          );

        const tokenPurpose = user.tokenPurpose;
        const tokenExpiration = user.tokenExpiration;

        if (
          tokenPurpose !== constants.TOKEN_PURPOSE_RESET_PASSWORD ||
          tokenExpiration < new Date()
        )
          return next(createError(400, 'Token is invalid or expired.'));

        return Promise.resolve()
          .then(() => (user.password = req.body.password))
          .then(() => user.clearToken())
          .then(() => user.save())
          .then(() =>
            res.status(200).json({ message: 'Password changed', success: true })
          )
          .catch(next);
      })
    );
}

module.exports.recoverPassword = (req, res, next) => {
  if (req.body.email) return requestResetPassword(req, res, next);
  return resetPassword(req, res, next);
};
