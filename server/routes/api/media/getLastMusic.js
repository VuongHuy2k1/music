const User = require("../../../models/User");
const Song = require("../../../models/Song");
const Singer = require("../../../models/Singer");
const Album = require("../../../models/Album");
const Playlist = require("../../../models/PlayList");

module.exports = async function (req, res, next) {
  const userId = req.params.userId;

  if (userId) {
    User.findById({ _id: userId }).then((user) => {
      const songId = user.lastSong;
      const lastList = user.lastList;

      Song.find({})
        .then((song) => {
          var lastSong = song.filter((song) => {
            return song.id.indexOf(songId) !== -1;
          });

          switch (user.typeList) {
            case "Album":
              var songLists = song.filter((song) => {
                return song.album.indexOf(lastList) !== -1;
              });
              res
                .send({
                  song: lastSong,
                  songLists: songLists,
                })
                .catch(next);
              break;
            case "Singer":
              var songLists = song.filter((song) => {
                return song.singer.indexOf(lastList) !== -1;
              });
              res.send({
                song: lastSong,
                songLists: songLists,
              });
              break;
            case "Playlist":
              console.log(lastList);
              Playlist.findById(
                {
                  _id: lastList,
                },
                { songList: 1, _id: 0 }
              )
                .then((playList) => {
                  var arr = playList.songList;
                  const t = { _id: { $in: arr } };
                  Song.find(t).then((songL) => {
                    res.send({
                      song: lastSong,
                      songLists: songL,
                    });
                  });
                })
                .catch(next);
              break;
            default:
              res.send("Danh sách trống");
          }
        })
        .catch(next);
        
    });
  } else {
    return res.status(400).send(userId);
  }
};
