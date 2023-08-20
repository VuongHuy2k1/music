const express = require("express");
const adminAPIAlbums = require("./albums/AdminAPIAlbums");
const adminApiSinger = require("./singers/AdminAPISinger");
const adminApiSong = require("./songs/AdminApiSong");
const adminApiUser = require("./user/AdminApiUser");

const router = express.Router();

router.use("/album", adminAPIAlbums);
router.use("/singer", adminApiSinger);
router.use("/song", adminApiSong);
router.use("/user", adminApiUser);

module.exports = router;
