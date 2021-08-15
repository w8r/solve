const Users = require('../models/users');
const validateSignup = require('../validator/signup');
const validateLogin = require('../validator/login');

module.exports.signupLocal = (req, res) => {
  const { errors, isValid } = validateSignup(req.body);
  if (!isValid) return res.status(422).json(errors);
  Users.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).json({ error: err });
    if (user) return res.status(400).json({ email: 'User already exists' });
    return Users({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      score: req.body.score
    }).save((err, user) => {
      if (err) return res.status(500).json({ error: err });
      return res.status(200).json({ success: true, user });
    });
  });
};

module.exports.loginLocal = (req, res) => {
  const { errors, isValid } = validateLogin(req.body);
  // Check validation
  if (!isValid) return res.status(422).json(errors);
  const { email, password } = req.body;
  // Find user by email
  return Users.findByCredentials({ email, password })
    .then((user) => {
      return user.generateAuthToken().then((token) =>
        res
          //.cookie(config.jwt.name, token, { httpOnly: true })
          .send({ user, token })
      );
    })
    .catch((message) => res.json({ message }));
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
