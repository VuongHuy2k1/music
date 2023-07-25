const Playlist = require("../../../models/PlayList");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");

module.exports = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.json(responseError("User id is require", 400));
    }

    const userPlaylists = await Playlist.find({ userId: userId });

    if (userPlaylists.length <= 10) {
      const newPlaylist = new Playlist({
        name: req.body.name,
        userId: userId,
      });
      const savedPlaylist = await newPlaylist.save();
      return res.json(responseSuccessDetails(savedPlaylist));
    } else {
      return res.json(responseError("Play list is limit", 403));
    }
  } catch (error) {
    console.error("Error:", error);
    return res.json(responseError("Internal server error", 500));
  }
};
