const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../../../models/User");
const { isValidObjectId } = require("mongoose");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");
const signupValidator = require("../../../validations/signup");

const router = express.Router();

// [GET] route /user/list
router.get("/", async (req, res, next) => {
  try {
    const [item, itemDeleted, deletedCount] = await Promise.all([
      User.find({}),
      User.findDeleted({}),
      User.countDocumentsDeleted(),
    ]);
    return res.json(
      responseSuccessDetails({
        deletedCount,
        item,
        itemDeleted,
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

// [POST] route /user/signup
router.post("/signup", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    const { isValid, errors } = signupValidator(req.body);

    if (!isValid) {
      return res.status(400).json({ error: true, errors });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(422).json({ error: "Username is exist" });
    }

    const user = new User(req.body);
    user.role = user.role || "basic";
    await user.save();

    return res.json(responseSuccessDetails(user));
  } catch (err) {
    return res.json(responseError("Internal server!!!"));
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

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.json(responseError("User not found!"));
    }

    const admin = req.user;

    if (user.role === "superAdmin") {
      return res.json(responseError("This account can't be deleted!"));
    }

    if (admin.role !== "superAdmin" && user.role === "admin") {
      return res.json(
        responseError("Your role does not have enough authority!")
      );
    }

    await User.updateOne({ _id: req.params.id }, req.body);
    return res.json(responseSuccessDetails("Update success"));
  } catch (err) {
    return res.json(responseError(err));
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.json(responseError("Invalid ID"));
    }
    // user to delete
    const user = await User.findById(req.params.id);

    // role of current admin
    const admin = req.user;

    if (user.role === "superAdmin") {
      return res.json(responseError("This account can't be delete!"));
    } else if (
      (admin.role === "admin" || admin.role === "superAdmin") &&
      user.role != "admin"
    ) {
      await User.delete({ _id: req.params.id });
      return res.json(responseSuccessDetails("Delete user successfully!"));
    } else if (user.role === "admin" && admin.role === "superAdmin") {
      await User.delete({ _id: req.params.id });
      return res.json(responseSuccessDetails("Delete user successfully!"));
    } else {
      return res.json(
        responseError("Your role does not have enough authority!")
      );
    }
  } catch (err) {
    return res.json(responseError(err));
  }
});

router.delete("/destroy/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.json(responseError("Invalid ID"));
    }
    // user to delete
    const user = await User.find({ _id: req.params.id });
    console.log(user);
    // role of current admin
    const admin = req.user;

    if (user.role === "superAdmin") {
      return res.json(responseError("This account can't be delete!"));
    } else if (
      (admin.role === "admin" || admin.role === "superAdmin") &&
      user.role != "admin"
    ) {
      await User.deleteOne({ _id: req.params.id });
      return res.json(responseSuccessDetails("Delete user successfully!"));
    } else if (user.role === "admin" && admin.role === "superAdmin") {
      await User.deleteOne({ _id: req.params.id });
      return res.json(responseSuccessDetails("Delete user successfully!"));
    } else {
      return res.json(
        responseError("Your role does not have enough authority!")
      );
    }
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

router.get("/restore/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.json(responseError("Invalid ID"));
    }
    await User.restore({ _id: req.params.id });
    return res.json(
      responseSuccessDetails({ message: "Singer restored successfully" })
    );
  } catch (err) {
    return res.json(responseError(err));
  }
});

module.exports = router;
