const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const FacebookTokenStrategy = require('passport-facebook-token');
const config = require('../../config/development');
const constants = require('../../config/constants');

const Users = mongoose.model('Users');

const { handleOAuth, handleAuthByCheckingUserStatus } = require('./utils');

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
        handleAuthByCheckingUserStatus(user, done, jwtPayload.provider);
      })
      .catch(done);
  }
);

passport.use(jwtStrategy);

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
        profile._json.name,
        profile._json.email,
        profile._json.first_name,
        profile._json.last_name,
        profile.id
      ),
      picture: profile.photos[0].value
    };

    handleOAuth(userProfile, done, constants.PROVIDER_FACEBOOK);
  }
);
passport.use(facebookTokenStrategy);

module.exports = passport;
