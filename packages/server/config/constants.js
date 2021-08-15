const messages = {
  LOGIN_FIRST: 'Please login first',
  GRAPH_NOT_FOUND: 'Graph not found'
};

const STATUS_ACTIVE = 'active';
const STATUS_DISABLED = 'disabled';
const STATUS_UNVERIFIED_EMAIL = 'unverified_email';

const TOKEN_PURPOSE_VERIFY_EMAIL = 'token_purpose_verify_email';
const TOKEN_PURPOSE_RESET_PASSWORD = 'token_purpose_reset_password';

module.exports = {
  messages,
  STATUS_ACTIVE,
  STATUS_DISABLED,
  STATUS_UNVERIFIED_EMAIL,
  TOKEN_PURPOSE_VERIFY_EMAIL,
  TOKEN_PURPOSE_RESET_PASSWORD,
  PROVIDER_FACEBOOK: 'facebook',
  PROVIDER_GOOGLE: 'google',
  PROVIDER_LOCAL: 'local'
};
