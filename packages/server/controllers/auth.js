const Users = require('../models/users');
const validateSignup = require('../validator/signup');
const validate = require('joi');
const constants = require('../config/constants');

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
  user.tokens = user.tokens.filter((t) => t.token !== token);
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
