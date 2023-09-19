const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const {
  responseError,
  responseSuccessDetails,
} = require("../../util/response");
const User = require("../../models/User");

router.get("/password/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!isValidObjectId(userId)) {
      return res.json(responseError({ message: "Invalid user ID" }));
    }

    const user = await User.findById(userId);

    if (user) {
      var myKey = crypto.createDecipher("aes-128-cbc", "mypassword");
      var myStr = myKey.update(user.password, "hex", "utf8");
    }

    return res.json(responseSuccessDetails(myStr));
  } catch (err) {
    console.error("Error:", err);

    return res.json(responseError("Internal server error", 500));
  }
});

module.exports = route;
