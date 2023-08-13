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
      return res.json(responseError("Tên đăng nhập hoặc mật khẩu sai!"));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.json(responseError("Not valid1"));
    }

    const role = user.role;
    if (role === "admin") {
      const id = user._id;
      const token = jwt.sign({ _id: id }, process.env.TOKEN_SECRET, {
        expiresIn: "1d",
      });
      return res.json(
        responseSuccessDetails({
          user,
          token,
        })
      );
    } else {
      return res.json(responseError("Not admin"));
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
router.get("/edit/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.json(responseError("Invalid ID"));
    }
    const user = await User.findById(req.params.id);
    res.json({
      user,
    });
  } catch (err) {
    return res.json(responseError(err));
  }
});

module.exports = router;
