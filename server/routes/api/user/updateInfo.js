const jwt = require("jsonwebtoken");
const User = require("../../../models/User");
const Resize = require("../../../middlewares/Resize");
const path = require("path");
const {
  responseSuccessDetails,
  responseError,
} = require("../../../util/response");
const { isValidObjectId } = require("mongoose");
require("dotenv").config();

module.exports = async function (req, res) {
  try {
    const imagePath = path.join("test/public/img");
    const fileUpload = new Resize(imagePath);

    const token = req.params.token;

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = verified._id;

    const { name, gender, nation, fileLink } = req.body;
    let { dateOfBirth } = req.body;
    if (!isValidObjectId(userId)) {
      return res.json(responseError("Id not valid"));
    }

    if (dateOfBirth) {
      dateOfBirth = new Date(dateOfBirth);
    }

    console.log(dateOfBirth);
    if (req.file) {
      const filename = await fileUpload.save(req.file.buffer);
      await User.updateOne(
        { _id: userId },
        { name, gender, dateOfBirth, nation, img: filename || fileLink }
      );
    } else {
      await User.updateOne(
        { _id: userId },
        { name, dateOfBirth, gender, nation, img: fileLink }
      );
    }

    return res.json(responseSuccessDetails("Update success"));
  } catch (error) {
    console.error("Error:", error);
    return res.json(responseError("Internal server error", 500));
  }
};
