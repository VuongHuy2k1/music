const Validator = require("validator");
const { isEmpty } = require("../util");

module.exports = function validateInput(data) {
  let errors = "";

  if (Validator.isEmpty(data.username || "")) {
    errors = "Username is required";
  }

  if (Validator.isEmail(data.email || "")) {
    errors = "Email is not valid";
  }

  if (!Validator.isAlphanumeric(data.username || "")) {
    errors = "Username must be alphanumeric";
  }

  if (!Validator.isLength(data.username, { min: 3, max: 16 })) {
    errors = "Username must be between 3 and 16 characters";
  }

  if (Validator.isEmpty(data.password || "")) {
    errors = "Password is required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: undefined })) {
    errors = "Password must be at least 6 characters";
  }

  if (Validator.isEmpty(data.rePassword || "")) {
    errors = "Password confirmation is required";
  }
  if (!Validator.equals(data.password, data.rePassword)) {
    errors = "Passwords must match";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
