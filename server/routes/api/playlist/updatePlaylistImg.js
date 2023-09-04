const Playlist = require("../../../models/PlayList");
const path = require("path");
const Resize = require("../../../middlewares/Resize");
const { isValidObjectId } = require("mongoose");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");

module.exports = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const name = req.body.name;

    if (!playlistId || !isValidObjectId(playlistId)) {
      return res.json(responseError("Playlist ID is wrong format"));
    }

    const imagePath = path.join("test/public/img");
    const fileUpload = new Resize(imagePath);

    if (req.file) {
      const filename = await fileUpload.save(req.file.buffer);
      await Playlist.updateOne(
        { _id: playlistId },
        { img: filename, name: name }
      );
    } else {
      await Playlist.updateOne({ _id: playlistId }, { name: name });
    }

    return res.json(responseSuccessDetails({ message: "success" }));
  } catch (error) {
    console.error("Error:", error);
    return res.json(responseError("Internal server error", 500));
  }
};
