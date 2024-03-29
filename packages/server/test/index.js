const mongoose = require('mongoose');
const chalk = require('chalk');
const jwt = require('jsonwebtoken');
const config = require('../config/development');
const seed = require('../script/seed');
const users = require('./fixtures/users');

const generateJwtToken = (user, provider) => {
  const iat = Math.floor(Date.now() / 1000);
  const token = jwt.sign(
    { userId: user._id, iat, provider },
    config.jwt.secret,
    {
      algorithm: config.jwt.algorithm,
      expiresIn: config.jwt.expiresIn // seconds
    }
  );
  return token;
};

before((done) => {
  if (config.env !== 'test') {
    throw new Error(
      chalk.red('[-] Test must be run in "test" environment (NODE_ENV=test)')
    );
  }
  // Load the app server
  require('../index');

  mongoose.connection.once('open', () => {
    return seed.createUsers(users).then((users) => {
      app.locals.existing = {};
      users.forEach((user) => {
        user.jwtToken = generateJwtToken(user, 'local');
        app.locals.existing[[user.name]] = user;
      });
      done();
    });
  });
});

after(() => mongoose.connection.db.dropDatabase());
