const Users = require('../models/users');
const validateSignup = require('../validator/signup');
const validate = require('joi');
const createError = require('http-errors');
const constants = require('../config/constants');
const {
  googleSignInStrategy,
  facebookSignInStrategy
} = require('../db/passport/utils');

const localSignUpSchema = validate
  .object({
    name: validate
      .string()
      .pattern(/^[a-zA-Z0-9.\@\-_]{4,30}$/)
      .messages(constants.messages.ERROR_MESSAGE_USERNAME),
    email: validate
      .string()
      .email()
      .messages(constants.messages.ERROR_MESSAGE_EMAIL),
    password: validate
      .string()
      .required()
      .messages(constants.messages.ERROR_MESSAGE_PASSWORD),
    password2: validate
      .string()
      .required()
      .messages(constants.messages.ERROR_MESSAGE_PASSWORD)
  })
  .equal('password', 'password2')
  .messages({ 'object.missing': 'Either username or email must be provided' });

module.exports.signupLocal = (req, res) => {
  const { errors, isValid } = validateSignup(req.body);
  if (!isValid) return res.status(400).json(errors);
  Users.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) return res.status(500).json({ error: err });
    if (existingUser)
      return res.status(400).json({ email: 'User already exists' });

    const name = req.body.name ? req.body.name : req.body.email;
    const user = new Users({
      name,
      email: req.body.email,
      password: req.body.password,
      score: req.body.score
    });
    user.provider.local = {
      userId: user._id
    };

    return user.save((err, user) => {
      if (err) return res.status(500).json({ error: err });
      return res.status(200).json({ success: true, user });
    });
  });
};

module.exports.logout = ({ user, token }, res) => {
  return user
    .save()
    .catch((e) => res.status(400).send())
    .then(() => {
      //res.clearCookie(config.jwt.name);
      res.status(200).json({ message: 'Logged out ' });
    });
};

module.exports.signIn = (req, res, next) => {
  if (req.user) {
    res.status(200).json({
      ...req.user.generateJwtToken(req.user.signedInWithProvider),
      signedInWith: req.user.signedInWithProvider,
      user: req.user.toJSON()
    });
  }
};

/**
 * JOI schema for validating signIn payload
 */
const localSignInSchema = validate
  .object({
    name: validate
      .string()
      .pattern(/^[a-zA-Z0-9.\@\-_]{4,30}$/)
      .messages(constants.messages.ERROR_MESSAGE_USERNAME),
    email: validate
      .string()
      .email()
      .messages(constants.messages.ERROR_MESSAGE_EMAIL),
    password: validate
      .string()
      .required()
      .messages(constants.messages.ERROR_MESSAGE_PASSWORD)
  })
  .xor('name', 'email')
  .messages({ 'object.missing': 'Either username or email must be provided' });

module.exports.validateLocalSignInPayload = (req, res, next) => {
  localSignInSchema
    .validateAsync(req.body)
    .then((payload) => {
      req.body = payload;
      req.body.usernameOrEmail = req.body.name || req.body.email;
      next();
    })
    .catch(next);
};

/**
 * JOI schema for validating facebookSignIn payload
 */
const facebookSchema = validate.object({
  //accessToken: validate.string().required(),
  //refreshToken: validate.string(),
  email: validate.string().email().required(),
  id: validate.string().required(),
  name: validate.string().required(),
  first_name: validate.string(),
  last_name: validate.string(),
  picture: validate.object({
    data: validate.object({
      url: validate.string().uri().required(),
      width: validate.number().required(),
      height: validate.number().required(),
      is_silhouette: validate.boolean().required()
    })
  })
});

module.exports.validateFacebookPayload = (req, res, next) => {
  facebookSchema
    .validateAsync(req.body)
    .then((payload) => next())
    .catch(next);
};

module.exports.facebookSignIn = (req, res, next) => {
  return facebookSignInStrategy(req.body, (err, user) => {
    if (err) throw createError(422, err);
    req.user = user;
    next();
  });
};

/**
 * JOI schema for validating googleSignIn payload
 */
const googleSignInSchema = validate.object({
  email: validate
    .string()
    .email()
    .messages(constants.messages.ERROR_MESSAGE_EMAIL),
  family_name: validate.string().required(),
  given_name: validate.string().required(),
  id: validate.string().required(),
  locale: validate.string(),
  name: validate.string().required(),
  picture: validate.string(),
  verified_email: validate.boolean()
});

/**
 * Validate Google sign-in payload
 *
 * @param {string} req.body.accessToken The Google accessToken
 * @param {string} [req.body.refreshToken] The Google refreshToken
 */
module.exports.validateGooglePayload = (req, res, next) => {
  googleSignInSchema
    .validateAsync(req.body)
    .then((payload) => next())
    .catch(next);
};

module.exports.googleSignIn = (req, res, next) => {
  return googleSignInStrategy(req.body, (err, user) => {
    if (err) throw createError(422, err);
    req.user = user;
    next();
  });
};
