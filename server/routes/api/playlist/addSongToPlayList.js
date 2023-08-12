// const { connections } = require("mongoose");
// const Playlist = require("../../../models/PlayList");

// module.exports = (req, res, next) => {
//   const songId = req.params.songId;
//   const playlistId = req.params.playlistId;

//   // Playlist.findById({ _id: playlistId }).then((playlist) => {
//   //   arr = playlist.songList;
//   //   console.log(arr);
//   //   Playlist.find({ songList: songId }).then((list) => {
//   //     const le = list.length
//   //     if (le==0) {
//   //       res.send(le);
//   //     } else {
//   //     res.send({le, list});
//   //     }
//   //   });
//   // })
//   // .catch(res.status(400).send("Err"));

//   Playlist.findOneAndUpdate(
//     { _id: playlistId },
//     {
//       $push: {
//         songList: {
//           $each: [songId],
//           $position: -1,
//         },
//       },
//     }
//   )
//     .then(res.status(200).send("Thành công"))
//     .catch(next);
// };

const { isValidObjectId } = require("mongoose");
const Playlist = require("../../../models/PlayList");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");

module.exports = async (req, res) => {
  try {
    const songId = req.params.songId;
    const playlistId = req.params.playlistId;

    const playlist = await Playlist.findById(playlistId);

    if (!playlistId || !isValidObjectId(playlistId)) {
      return res.json(responseError("Playlist ID is wrong format", 400));
    }

    // Check if the songId already exists in the playlist's songList
    const existingSongIndex = playlist.songList.indexOf(songId);
    if (existingSongIndex !== -1) {
      return res.json(responseError("Song already exists in the playlist"));
    }

    playlist.songList.push(songId);
    await playlist.save();

    return res.json(responseSuccessDetails("Thành công"));
  } catch (error) {
    console.error("Error:", error);
    return res.json(responseError("Internal server error", 500));
  }
};
