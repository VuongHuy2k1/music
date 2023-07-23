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

    const playlists = await Playlist.find({ userId: userId });

    return res.json(responseSuccessDetails(playlists));
  } catch (error) {
    console.error("Error:", error);
    return res.json(responseError("Internal server error", 500));
  }
};
