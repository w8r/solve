const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/development');
const constants = require('../config/constants');
const { v4: uuidv4 } = require('uuid');
const Graphs = require('./graphs');

const providerDataSchema = new Schema({
  userId: {
    type: Schema.Types.String,
    required: [true, 'Provider userId is required']
  },
  accessToken: {
    type: Schema.Types.String
  },
  refreshToken: {
    type: Schema.Types.String
  },
  picture: {
    type: Schema.Types.String
  }
});

const usersSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      maxlength: 100
    },
    email: {
      type: Schema.Types.String,
      lowercase: true,
      unique: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email format');
        }
      }
    },
    graphs: {
      type: [Graphs],
      ref: 'Graphs',
      default: []
    },
    password: {
      type: Schema.Types.String,
      required: false,
      minlength: 6,
      trim: true
    },
    status: {
      type: Schema.Types.String,
      enum: [
        constants.STATUS_ACTIVE,
        constants.STATUS_DISABLED,
        constants.STATUS_UNVERIFIED_EMAIL
      ],
      default: constants.STATUS_UNVERIFIED_EMAIL,
      index: true
    },
    score: {
      type: Schema.Types.Number,
      default: 0
    },
    // token for verification email or reset password purpose, NOT JWT token
    // Do NOT set directly, call user.setToken(tokenPurpose) user.clearToken()
    // to set and clear token and tokenPurpose
    token: { type: Schema.Types.String, index: true },
    tokenPurpose: {
      type: Schema.Types.String,
      enum: [
        constants.TOKEN_PURPOSE_VERIFY_EMAIL,
        constants.TOKEN_PURPOSE_RESET_PASSWORD
      ]
    },
    tokenExpiration: { type: Schema.Types.Date },
    provider: {
      apple: {
        type: providerDataSchema
      },
      facebook: {
        type: providerDataSchema
      },
      google: {
        type: providerDataSchema
      },
      local: {
        type: providerDataSchema
      }
    }
  },
  {
    timestamps: true
  }
);

usersSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  return bcrypt
    .hash(this.password, config.saltRounds)
    .then((password) => {
      this.password = password;
    })
    .then(() => {
      this.score = this.score || 0;
    })
    .then(() => next(null, this));
});

usersSchema.statics.findByCredentials = ({ email, password }) => {
  return new Promise((resolve, reject) => {
    Users.findOne({ email }, (err, user) => {
      if (err) return reject(err);
      if (!user) return reject('Not found');
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) return reject('Unable to login');
        resolve(user);
      });
    });
  });
};

usersSchema.methods.generatePasswordResetToken = function () {};

usersSchema.methods.toJSON = function () {
  const data = this.toObject();

  delete data.password;
  delete data.updatedAt;
  data.uuid = data._id;
  delete data._id;
  delete data.__v;
  delete data.provider;
  delete data.token;

  return data;
};

/**
 * Set password to this user
 * The password will be hashed and assigned to password field
 *
 * Call this function when updating the user password
 *
 * @param {*} password
 *
 * @returns {Promise} Resolve with null value
 */
usersSchema.methods.setPassword = function (password) {
  return bcrypt.hash(password, config.saltRounds).then((hash) => {
    this.password = hash;
  });
};

/**
 * Compare candidate password with the stored one
 *
 * @param {string} candidatePassword The candidate password
 *
 * @returns {Promise} Resolve with a boolean value
 */
usersSchema.methods.comparePasswordAsync = function (candidatePassword) {
  if (!this.password) Promise.resolve(false);
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate JWT token for authentication
 *
 * @param {string} provider Default value: 'local'
 *
 * @returns {object} An object contains JWT token and expiresAt (seconds) property
 */
usersSchema.methods.generateJwtToken = function (
  provider = constants.PROVIDER_LOCAL
) {
  const expiresIn = config.jwt.expiresIn;
  const iat = Math.floor(Date.now() / 1000);
  const expiresAt = iat + expiresIn;
  const token = jwt.sign(
    { userId: this._id, iat, provider },
    config.jwt.secret,
    {
      algorithm: config.jwt.algorithm,
      expiresIn // seconds
    }
  );
  return { token, expiresAt };
};

/**
 * Set token and token purpose field based on given token purpose
 *
 * @param {string} purpose The purpose of the token.
 */
usersSchema.methods.setToken = function (purpose, expiresIn = 1) {
  this.token = uuidv4();
  this.tokenPurpose = purpose;
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + expiresIn);
  this.tokenExpiration = expirationDate;
  this.save();
};

usersSchema.methods.setVerifyEmailToken = function () {
  this.setToken(constants.TOKEN_PURPOSE_VERIFY_EMAIL);
};

usersSchema.methods.setResetPasswordToken = function () {
  this.setToken(constants.TOKEN_PURPOSE_RESET_PASSWORD);
};

/**
 * Clear token and token purpose field
 */
usersSchema.methods.clearToken = function () {
  this.token = undefined;
  this.tokenPurpose = undefined;
  this.tokenExpiration = undefined;
};

const Users = model('Users', usersSchema);

module.exports = Users;
