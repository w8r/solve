const messages = {
  LOGIN_FIRST: 'Please login first',
  GRAPH_NOT_FOUND: 'Graph not found',
  ERROR_MESSAGE_CURRENT_PASSWORD: {
    'string.empty': 'Current Password cannot be empty',
    'string.min': 'Current Password must be at least 8 characters',
    'any.required': 'Current Password is required'
  },
  ERROR_MESSAGE_EMAIL: {
    'string.empty': 'Email cannot be empty',
    'string.email': 'Email is invalid',
    'any.required': 'Email is required'
  },
  ERROR_MESSAGE_PASSWORD: {
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required'
  },
  ERROR_MESSAGE_USERNAME: {
    'string.empty': 'Username cannot be empty',
    'string.pattern.base':
      'Username must be between 4 to 30 characters and may contain only alphanumeric chacracters, hyphen, dot or underscore',
    'any.required': 'Username is required'
  }
};

const ERROR_CODES = {
  AUTH_USER_NOT_FOUND: 'auth/user-not-found',
  AUTH_WRONG_PASSWORD: 'auth/wrong-password'
};

const STATUS_ACTIVE = 'active';
const STATUS_DISABLED = 'disabled';
const STATUS_UNVERIFIED_EMAIL = 'unverified_email';

const TOKEN_PURPOSE_VERIFY_EMAIL = 'token_purpose_verify_email';
const TOKEN_PURPOSE_RESET_PASSWORD = 'token_purpose_reset_password';

module.exports = {
  messages,
  ERROR_CODES,
  STATUS_ACTIVE,
  STATUS_DISABLED,
  STATUS_UNVERIFIED_EMAIL,
  TOKEN_PURPOSE_VERIFY_EMAIL,
  TOKEN_PURPOSE_RESET_PASSWORD,
  PROVIDER_FACEBOOK: 'facebook',
  PROVIDER_GOOGLE: 'google',
  PROVIDER_LOCAL: 'local'
};
