const passport = require('passport');
const createError = require('http-errors');

module.exports.authStrategy = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (err, user, info) => {
    if (err) return next(createError(500, err));
    if (!user) return next(createError(401, info.message));
    req.user = user;
    next();
  })(req, res, next);
};
