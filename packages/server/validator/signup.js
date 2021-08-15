const Validator = require("validator");

module.exports = ({
  name = '',
  email = '',
  password = '',
  password2 = '',
  score = 0
}) => {
  const errors = {};

  // Name checks
  if (Validator.isEmpty(name)) {
    errors.name = "Name field is required";
  }

  // Email checks
  if (Validator.isEmpty(email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(email)) {
    errors.email = "Email is invalid";
  }

  // Password checks
  if (Validator.isEmpty(password)) {
    errors.password = "Password field is required";
  }
  if (Validator.isEmpty(password2)) {
    errors.password2 = "Confirm password field is required";
  }
  if (!Validator.isLength(password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters";
  }
  if (!Validator.equals(password, password2)) {
    errors.password2 = "Passwords must match";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};
