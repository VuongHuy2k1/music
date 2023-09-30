const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../../../models/User");
const loginValidator = require("../../../validations/login");
const signupValidator = require("../../../validations/signup");
const upload = require("../../../middlewares/uploadMiddleware");
const updateInfo = require("./updateInfo");
const changePassword = require("./changePassword");
const {
  responseSuccessDetails,
  responseError,
} = require("../../../util/response");
const { isValidObjectId } = require("mongoose");
const {
  createMailTransporter,
} = require("../../../util/createMailTransporter");
const { generateRandomString } = require("../../../util/randomChar");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const { isValid, errors } = loginValidator(req.body);

    if (!isValid) {
      return res.json(responseError(errors, 400));
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.json(responseError(errors, 400));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.json(responseError("Mật khẩu không đúng", 401));
    }

    const id = user._id;

    const token = jwt.sign({ _id: id }, process.env.TOKEN_SECRET, {
      expiresIn: 60 * 60 * 24,
    });

    return res.json(
      responseSuccessDetails({
        userId: id,
        isAuthen: true,
        access_token: token,
      })
    );
  } catch (err) {
    console.error("Error:", err);
    return res.json(responseError("Internal server error", 500));
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const { isValid, errors } = signupValidator(req.body);

    if (!isValid) {
      return res.json(responseError(errors, 400));
    }

    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingUser || existingEmail) {
      return res.json(
        responseError("Username or email is already registered", 422)
      );
    }

    const chars = generateRandomString(6);

    const user = new User(req.body);

    user.role = "basic";
    user.code = chars;

    await User.updateOne({ _id: user.id }, user);

    const mailOptions = {
      from: process.env.ADMIN_MAIL,
      to: email,
      subject: "You received message from HuTa Music",
      text: "You received message from HuTa Music",
      html:
        "<h1><b>You received message from HuTa Music</b></h1>Hi user: <b>" +
        user.username +
        "</b><p>" +
        "<p>It looks like you're trying to sign in to out website.<p>" +
        "<p>The Huta Guard code you need to log into your account:<p>" +
        "<p>Your code is :<p>" +
        "<b>" +
        user.code +
        "</b><br>" +
        "<p>The code only lasts for 5 minutes, please enter the code now.<p>" +
        "<p>From HuTa Music web</p>",
    };

    let emailTransporter = await createMailTransporter();
    await emailTransporter.sendMail(mailOptions);

    return res.json(responseSuccessDetails("Account successfully created"));
  } catch (err) {
    console.error("Error:", err);
    return res.json(responseError("Internal server error", 500));
  }
});

router.get("/verify-mail", async (req, res) => {
  try {
    const { code, userEmail } = req.body;

    const user = await User.findOne({ email: userEmail });

    if (user) {
      let today = new Date();
      const date1 = new Date(user.updatedAt);
      const date2 = today;
      const timeDifference = date2.getTime() - date1.getTime();
      const minutesDifference = timeDifference / (1000 * 60);
      if (
        user.code === code &&
        minutesDifference < 5 &&
        code != "" &&
        user.code != ""
      ) {
        user.role = "user";
        user.code = "";
        await User.updateOne({ _id: user.id }, user);
        return res.json(responseSuccessDetails(user));
      } else {
        return res.json(responseError("Code has wrong or expired"));
      }
    } else {
      return res.json(responseError("User not found"));
    }
  } catch (err) {
    return res.json(responseError("Internal server error", 500));
  }
});

router.get("/auth/:token", (req, res) => {
  try {
    const token = req.params.token;

    if (!token) return res.json(responseError("Token not found", 402));

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = verified._id;
    User.findById({ _id: userId }, { password: 0 }).then((user) => {
      if (!user) {
        return res.json(responseError("User not found", 402));
      }
      return res.json(responseSuccessDetails(user));
    });
  } catch (err) {
    console.error("Error:", err);
    return res.json(responseError("Internal server error", 500));
  }
});

router.get("/forgot-password", async (req, res) => {
  try {
    const { userEmail, username } = req.body;

    const user = await User.findOne({ email: userEmail, username: username });

    if (user) {
      const chars = generateRandomString(6);
      user.code = chars;
      await User.updateOne({ _id: user.id }, user);
      // send mail
      const mailOptions = {
        from: process.env.ADMIN_MAIL,
        to: userEmail,
        subject: "You received message from HuTa Music",
        text: "You received message from HuTa Music",
        html:
          "<h1><b>You received message from HuTa Music</b></h1>Hi user: <b>" +
          user.username +
          "</b><p>" +
          "<p>It looks like you're forgot your password.<p>" +
          "<p>The Huta Guard code you need to log into your account:<p>" +
          "<p>Your code is :<p>" +
          "<b>" +
          user.code +
          "</b><br>" +
          "<p>The code only lasts for 5 minutes, please enter the code now.<p>" +
          "<p>From HuTa Music web</p>",
      };
      let emailTransporter = await createMailTransporter();

      await emailTransporter.sendMail(mailOptions);
      // end send mail
      return res.json(responseSuccessDetails(user.code));
    }
    return res.json(responseError("User not found!"));
  } catch (err) {
    console.error("Error:", err);

    return res.json(responseError("Internal server error", 500));
  }
});

router.get("/verify-reset-password", async (req, res) => {
  try {
    const { code, userEmail, username, password, rePassword } = req.body;

    const user = await User.findOne({ email: userEmail, username: username });

    if (user) {
      let today = new Date();
      const date1 = new Date(user.updatedAt);
      const date2 = today;
      const timeDifference = date2.getTime() - date1.getTime();
      const minutesDifference = timeDifference / (1000 * 60);
      if (
        user.code === code &&
        minutesDifference < 5 &&
        code != "" &&
        user.code != ""
      ) {
        if (password === rePassword) {
          user.code = "";
          user.password = password;
          await user.save();
        } else {
          return res.json(
            responseError("Password and rePassword not match!!!")
          );
        }
        return res.json(responseSuccessDetails(user));
      } else {
        return res.json(responseError("Code has wrong or expired"));
      }
    } else {
      return res.json(responseError("User not found"));
    }
  } catch (err) {
    return res.json(responseError("Internal server error", 500));
  }
});

router.put("/update-user/:token", upload.single("image"), updateInfo);
router.put("/change-password/:token", changePassword);

module.exports = router;
