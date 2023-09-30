const jwt = require("jsonwebtoken");
const { responseError } = require("../util/response");
const User = require("../models/User");
const { isValidObjectId } = require("mongoose");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json(responseError("Unauthorized"));
  }
  let _token = token.replace("Bearer ", "").trim();

  jwt.verify(_token, process.env.TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(401).json(responseError("Invalid token"));
    }
    const { _id } = decoded;

    if (!isValidObjectId(_id)) {
      return res.json(responseError("Invalid token"));
    }

    const user = await User.findById(_id);
    if (user?.role != "admin" && user?.role != "superAdmin") {
      return res.status(401).json(responseError("Unauthorized"));
    }

    req.user = user;
    return next();
  });
};
