const { verify } = require('jsonwebtoken');
const Users = require('../models/users');
const { authStrategy } = require('../db/passport/utils');

module.exports = authStrategy('jwt');
