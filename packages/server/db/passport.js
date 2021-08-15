const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleIdTokenStrategy = require('passport-google-id-token');
const config = require('../config/development');
const constants = require('../config/constants');

const Users = mongoose.model('Users');

// Create local strategy
const localStrategy = new LocalStrategy(
  {
    usernameField: 'usernameOrEmail',
    passwordField: 'password'
  },
  (usernameOrEmail, password, done) => {
    Users.findOne({
      $or: [{ name: usernameOrEmail }, { email: usernameOrEmail }]
    })
      .then((user) => {
        if (!user) {
          return done(null, false, {
            message: 'Username or email does not exist'
          });
        }
        if (!user.provider.local) {
          // not a local account (email and password)
          return done(null, false, {
            message: 'Username or email does not exist'
          });
        }
        user.comparePasswordAsync(password).then((isMatch) => {
          if (!isMatch) {
            return done(null, false, { message: 'Password is incorrect' });
          }

          handleAuthByCheckingUserStatus(user, done, constants.PROVIDER_LOCAL);
        });
      })
      .catch(done);
  }
);

passport.use(localStrategy);

// Create JWT Strategy
const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret
  },
  (jwtPayload, done) => {
    Users.findById(jwtPayload.userId)
      .then((user) => {
        if (!user) return done(null, false, { message: 'Invalid credentials' });

        if (!jwtPayload.sub || user.subId !== jwtPayload.sub) {
          return done(null, false, { message: 'Invalid JWT token' });
        }

        handleAuthByCheckingUserStatus(user, done, jwtPayload.provider);
      })
      .catch(done);
  }
);

passport.use(jwtStrategy);

console.log(config);

// Create Facebook Token Strategy
const facebookTokenStrategy = new FacebookTokenStrategy(
  {
    clientID: config.auth.facebookId,
    clientSecret: config.auth.facebookSecret
  },
  (accessToken, refreshToken, profile, done) => {
    const userProfile = {
      provider: constants.PROVIDER_FACEBOOK,
      userId: profile.id,
      email: profile._json.email,
      name: generateUsername(
        profile._json.email,
        profile._json.given_name,
        profile._json.family_name
      ),
      picture: profile.photos[0].value
    };

    handleOAuth(userProfile, done, constants.PROVIDER_FACEBOOK);
  }
);

passport.use(facebookTokenStrategy);

// Create Google Id Token Strategy
const googleIdTokenStrategy = new GoogleIdTokenStrategy(
  {
    clientID: config.auth.googleId
  },
  function ({ payload: profile }, googleId, done) {
    const userProfile = {
      provider: constants.PROVIDER_GOOGLE,
      userId: googleId,
      email: profile.email,
      name: generateUsername(
        profile.email,
        profile.given_name,
        profile.family_name
      ),
      picture: profile.picture
    };

    handleOAuth(userProfile, done, constants.PROVIDER_GOOGLE);
  }
);

passport.use(googleIdTokenStrategy);

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
 * @param {string} email
 * @param {string} firstName
 * @param {string} lastName
 *
 * @returns {string} the username
 */
const generateUsername = (email, firstName, lastName, id) => {
  let username = '';
  if (email) {
    username = email.split('@')[0];
  } else if (firstName && lastName) {
    username = `${firstName}${lastName}${generateRandomNumber()}`;
  } else if (id) {
    username = id;
  }
  return username.toLowerCase();
};

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
  let query = {
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
          const user = new User({
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

module.exports = passport;
