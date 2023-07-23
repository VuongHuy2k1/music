const { isValidObjectId } = require("mongoose");
const Playlist = require("../../../models/PlayList");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");

module.exports = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;

    if (!playlistId || isValidObjectId(playlistId)) {
      return res.json(responseError("Playlist ID is wrong", 400));
    }

    const deletedPlaylist = await Playlist.deleteOne({ _id: playlistId });

    if (deletedPlaylist.deletedCount === 1) {
      return res.json(responseSuccessDetails("Thành công"));
    } else {
      return res.json(responseError("Playlist not found", 404));
    }
  } catch (error) {
    console.error("Error:", error);
    return res.json(responseError("Internal server error", 500));
  }
};
