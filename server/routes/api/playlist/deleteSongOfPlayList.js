const { isValidObjectId } = require("mongoose");
const Playlist = require("../../../models/PlayList");
const { responseError } = require("../../../util/response");

module.exports = async (req, res) => {
  try {
    const songId = req.params.songId;
    const playlistId = req.params.playlistId;

    if (!playlistId || !songId || !isValidObjectId(playlistId)) {
      return res.status(400).send("Playlist ID or song ID are wrong format");
    }

    await Playlist.updateOne(
      { _id: playlistId },
      {
        $pullAll: {
          songList: [songId],
        },
      }
    );

    const playlist = await Playlist.findOne({ _id: playlistId });
    if (!playlist) {
      return res.json(responseError("Playlist not found", 404));
    }

    return res.json(playlist);
  } catch (error) {
    console.error("Error:", error);
    return res.json(responseError("Internal server error", 500));
  }
};
