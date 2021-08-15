const { verify } = require('jsonwebtoken');
const Users = require('../models/users');
const config = require('../config/development');
const { messages } = require('../config/constants');
const passport = require('passport');
const createError = require('http-errors');

module.exports = (req, res, next) => {
  const token = req.headers[config.jwt.headerName];
  //const token = req.cookies[config.jwt.name];
  if (token === '') return res.redirect(401, '/user/login');
  if (token === undefined)
    return res.status(401).send({ message: messages.LOGIN_FIRST });
  verify(token, config.jwt.secret, (err, decodedToken) => {
    if (err) return res.status(401).send({ message: messages.LOGIN_FIRST });
    Users.findOne(
      {
        _id: decodedToken._id,
        'tokens.token': token
      },
      (userErr, user) => {
        if (userErr) return res.status(401).send(userErr);
        if (!user)
          return res.status(401).send({ message: messages.LOGIN_FIRST });

        req.token = token;
        req.user = user;

        next();
      }
    );
  });
};
