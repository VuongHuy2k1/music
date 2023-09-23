const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../../../models/User");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");
const loginValidator = require("../../../validations/login");

module.exports = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const { isValid, errors } = loginValidator(req.body);

    if (!isValid) {
      return res.json(responseError(errors));
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.json(responseError("Wrong username or password!"));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.json(responseError("Wrong username or password!"));
    }

    const role = user.role;
    if (role === "admin" || role === "superAdmin") {
      const id = user._id;
      const token = jwt.sign({ _id: id }, process.env.TOKEN_SECRET, {
        expiresIn: "1d",
      });
      return res.json(
        responseSuccessDetails({
          admin: user,
          token,
        })
      );
    } else {
      return res.json(responseError("You are not admin!"));
    }
  } catch (err) {
    return res.json(responseError(err));
  }
};
