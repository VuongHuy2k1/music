const express = require("express");
const adminAPIAlbums = require("./albums/AdminAPIAlbums");
const adminApiSinger = require("./singers/AdminAPISinger");
const adminApiSong = require("./songs/AdminApiSongs");

const router = express.Router();

router.use("/album", adminAPIAlbums);
router.use("/singer", adminApiSinger);
router.use("/song", adminApiSong);

module.exports = router;
