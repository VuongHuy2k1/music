const { isValidObjectId } = require("mongoose");
const Playlist = require("../../../models/PlayList");
const Song = require("../../../models/Song");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");

module.exports = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    console.log(playlistId);
    if (!playlistId || !isValidObjectId(playlistId)) {
      return res.json(responseError("Playlist ID is wrong format", 400));
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.json(responseError("Play list not found"));
    }

    const songIds = playlist.songList;
    if (!songIds.length) {
      return res.json(responseSuccessDetails([]));
    }

    const songs = await Song.find({ _id: { $in: songIds } });
    console.log(songs.length);
    return res.json(responseSuccessDetails(songs));
  } catch (error) {
    console.error("Error:", error);
    return res.json(responseError("Internal server error", 500));
  }
};
