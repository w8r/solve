const passport = require('passport');
const mongoose = require('mongoose');
const createError = require('http-errors');
const config = require('../../config/development');
const constants = require('../../config/constants');

const Users = mongoose.model('Users');

module.exports.authStrategy = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (err, user, info) => {
    if (err) return next(createError(500, err));
    if (!user)
      return next(createError(401, { message: info.message, data: info }));
    req.user = user;
    next();
  })(req, res, next);
};

// Create Google profile signin strategy
module.exports.googleSignInStrategy = (profile, done) => {
  const userProfile = {
    provider: constants.PROVIDER_GOOGLE,
    userId: profile.id,
    email: profile.email,
    name: generateUsername(
      profile.name,
      profile.email,
      profile.given_name,
      profile.family_name,
      profile.id
    ),
    picture: profile.picture
  };

  handleOAuth(userProfile, done, constants.PROVIDER_GOOGLE);
};

module.exports.facebookSignInStrategy = (profile, done) => {
  const userProfile = {
    provider: constants.PROVIDER_FACEBOOK,
    userId: profile.id,
    email: profile.email,
    name: generateUsername(
      profile.name,
      profile.email,
      profile.first_name,
      profile.last_name,
      profile.id
    ),
    picture: profile.picture.data.url
  };

  handleOAuth(userProfile, done, constants.PROVIDER_FACEBOOK);
};

/**
 * @function generateRandomNumber
 * Generate a random number between 1 and 99
 *
 * @returns {string}
 */
const generateRandomNumber = () => {
  const number = Math.floor(Math.random() * 99 + 1);
  return `00${number}`.slice(-2);
};

/**
 * Generate username based on email, or name
 *
 * @param {string} userName
 * @param {string} email
 * @param {string} firstName
 * @param {string} lastName
 *
 * @returns {string} the username
 */
const generateUsername = (userName, email, firstName, lastName, id) => {
  let username = '';
  if (userName) {
    username = userName;
  } else if (firstName && lastName) {
    username = `${firstName}${lastName}${generateRandomNumber()}`;
  } else if (email) {
    username = email.split('@')[0];
  } else if (id) {
    username = id;
  }
  return username;
};

module.exports.generateUsername = generateUsername;

/**
 * Find the unique username
 *
 * @param {string} possibleUsername The possible username
 */
const findUniqueUsername = (possibleUsername) => {
  return Users.findOne({ name: possibleUsername }).then((existingUser) => {
    if (!existingUser) return possibleUsername;
    return `${possibleUsername}${generateRandomNumber()}`;
  });
};

/**
 * Update or insert an user
 *
 * @param {object} userProfile The user profile
 *
 * @returns {Promise} Resolve with the object {user, isNewUser}
 */
const updateOrInsert = (userProfile) => {
  const query = {
    $or: [
      { email: userProfile.email },
      {
        [`provider.${userProfile.provider}`]: {
          userId: userProfile.userId
        }
      }
    ]
  };

  const provider = {
    userId: userProfile.userId,
    picture: userProfile.picture
  };

  return Users.findOne(query).then((existingUser) => {
    if (!existingUser) {
      return findUniqueUsername(userProfile.name)
        .then((availableUsername) => {
          const user = new Users({
            email: userProfile.email,
            name: availableUsername,
            status: constants.STATUS_ACTIVE,
            provider: {
              [userProfile.provider]: provider
            }
          });
          return user.save();
        })
        .then((user) => ({ user, isNewUser: true }));
    }
    // user already exists, update provider
    existingUser.provider[userProfile.provider] = provider;
    return existingUser.save().then((user) => ({ user, isNewUser: false }));
  });
};

/**
 * Handle authentication based on user status.
 * Note: The specified user must be not null
 *
 * @param {object} user
 * @param {function} done
 * @param {string} provider Default: 'local'
 *
 * @returns
 */
const handleAuthByCheckingUserStatus = (
  user,
  done,
  provider = constants.PROVIDER_LOCAL
) => {
  // Make sure user exists
  if (!user) return done(null, false, { message: 'User does not exist' });

  // authorized
  if (
    user.status === constants.STATUS_ACTIVE ||
    // unverified-email status should NOT block the user who signed in with Google or Facebook OAuth
    (user.status === constants.STATUS_UNVERIFIED_EMAIL &&
      provider !== constants.PROVIDER_LOCAL)
  ) {
    user.signedInWithProvider = provider;
    return done(null, user);
  }

  // Before denying all other statuses, return helpful message where possible

  if (user.status === constants.STATUS_DISABLED) {
    return done(null, false, { message: 'Account is disabled' });
  }

  if (config.auth.verifyEmail && provider === constants.PROVIDER_LOCAL) {
    if (user.status === constants.STATUS_UNVERIFIED_EMAIL) {
      return done(null, false, { message: 'Email is not verified' });
    }
  }

  done(null, false, { message: 'Account status is invalid' });
};
module.exports.handleAuthByCheckingUserStatus = handleAuthByCheckingUserStatus;

/**
 * Handle OAuth authentication
 *
 * @param {object} userProfile
 * @param {function} done
 */
const handleOAuth = (userProfile, done, provider) => {
  updateOrInsert(userProfile)
    .then(({ user, isNewUser }) => {
      // check the status
      handleAuthByCheckingUserStatus(user, done, provider);
    })
    .catch(done);
};

module.exports.handleOAuth = handleOAuth;
