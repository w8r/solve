const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/development');
const constants = require('../config/constants');

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
    password: {
      type: Schema.Types.String,
      required: false,
      minlength: 6,
      trim: true
    },
    tokens: [
      {
        token: {
          type: Schema.Types.String,
          required: true
        }
      }
    ],
    status: {
      type: Schema.Types.String,
      enum: [
        constants.STATUS_ACTIVE,
        constants.STATUS_DISABLED,
        constants.STATUS_UNVERIFIED_EMAIL
      ],
      default: constants.STATUS_ACTIVE,
      index: true
    },
    score: {
      type: Schema.Types.Number,
      default: 0
    },
    // token for veryfication email or reset password purpose, NOT JWT token
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
    .hash(this.password, 8)
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

usersSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id.toString()
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn
    }
  );

  this.tokens.push({ token });

  return this.save().then(() => token);
};

usersSchema.methods.toJSON = function () {
  const data = this.toObject();

  delete data.password;
  delete data.tokens;
  delete data.updatedAt;
  data.uuid = data._id;
  delete data._id;
  delete data.__v;

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
usersSchema.methods.setPasswordAsync = function (password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds).then((hash) => {
    this.password = hash;
  });
};

const Users = model('Users', usersSchema);

module.exports = Users;
