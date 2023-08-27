const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../../../models/User");
const { isValidObjectId } = require("mongoose");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");
const loginValidator = require("../../../validations/login");
const signupValidator = require("../../../validations/signup");

const router = express.Router();

// [GET] route /user/list
router.get("/", async (req, res, next) => {
  try {
    const [users, deletedCount] = await Promise.all([
      User.find({}),
      User.countDocumentsDeleted(),
    ]);
    return res.json(
      responseSuccessDetails({
        deletedCount,
        users,
      })
    );
  } catch (err) {
    return res.json(responseError(err));
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.json(responseError("Invalid ID"));
    }

    const user = await User.findById(req.params.id);

    return res.json(responseSuccessDetails(user));
  } catch (err) {
    return res.json(responseError(err));
  }
});

// [POST] route /user/login
router.post("/login", async (req, res, next) => {
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
    if (role === "admin") {
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
});

// [POST] route /user/signup
router.post("/signup", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { isValid, errors } = signupValidator(req.body);

    if (!isValid) {
      return res.status(400).json({ error: true, errors });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(422).json({ error: "Username is exist" });
    }

    const user = new User(req.body);
    await user.save();

    return res.json(responseSuccessDetails(user));
  } catch (err) {
    return res.json(responseError(err));
  }
});

// [GET] route /user/bin
router.get("/bin", async (req, res, next) => {
  try {
    const users = await User.findDeleted({});
    return res.json(
      responseSuccessDetails({
        users,
      })
    );
  } catch (err) {
    return res.json(responseError(err));
  }
});

// [GET] route /user/edit/:id
router.put("/edit/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.json(responseError("Invalid ID"));
    }
    await User.updateOne({ _id: req.params.id }, req.body);

    return res.json(responseSuccessDetails("Update success"));
  } catch (err) {
    return res.json(responseError(err));
  }
});

router.get("/auth/:token", (req, res) => {
  try {
    const token = req.params.token;

    if (!token) return res.json(responseError("Token not found", 401));

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = verified._id;

    if (!isValidObjectId(userId)) {
      return res.json(responseError("Invalid ID"));
    }

    User.findById({ _id: userId }, { password: 0 }).then((user) => {
      if (!user) {
        return res.json(responseError("User not found", 401));
      }
      return res.json(responseSuccessDetails(user));
    });
  } catch (err) {
    console.error("Error:", err);
    return res.json(responseError("Internal server error", 500));
  }
});

module.exports = router;
