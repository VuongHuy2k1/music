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

const nodemailer = require("nodemailer");
require("dotenv").config();
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

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

    const user = new User(req.body);
    await user.save();
    return res.json(responseSuccessDetails("Tạo tài khoản thành công"));
  } catch (err) {
    console.error("Error:", err);

    return res.json(responseError("Internal server error", 500));
  }
});

router.get("/authen/:token", (req, res) => {
  try {
    const token = req.params.token;

    if (!token) return res.json(responseError("Token not found", 401));

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = verified._id;
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

router.get("/reset-password/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!isValidObjectId(userId)) {
      return res.json(responseError({ message: "Invalid user ID" }));
    }

    const user = await User.findById(userId);

    if (user) {
      const chars = generateRandomString(6);
      user.code = chars;
      await user.save();
      // send mail
      const mailOptions = {
        from: process.env.ADMIN_MAIL,
        to: userEmail,
        subject: "Test",
        text: "You received message from HuTa Music",
        html:
          "<p>You have got a new message</b><ul><li>Username:" +
          user.username +
          "</li><li>Your code is:" +
          user.code +
          "</li></ul>",
      };

      let emailTransporter = await createTransporter();
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

function generateRandomString(length) {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }
  return result;
}

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

async function createTransporter() {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.ADMIN_MAIL,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    return transporter;
  } catch (err) {
    return err;
  }
}

router.get("/verify-reset-password", async (req, res) => {
  try {
    const { code, userEmail } = req.body;

    const user = await User.findOne({ email: userEmail });

    if (user) {
      let today = new Date();
      const date1 = new Date(user.updatedAt);
      const date2 = today;
      const timeDifference = date2.getTime() - date1.getTime();
      const minutesDifference = timeDifference / (1000 * 60);
      if (user.code === code && minutesDifference < 5) {
        user.code = "";
        await user.save();
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
