const express = require("express");
const adminAPIAlbums = require("./albums/AdminAPIAlbums");
const adminApiSinger = require("./singers/AdminAPISinger");
const adminApiSong = require("./songs/AdminApiSong");
const adminApiUser = require("./user/AdminApiUser");
const adminApiBill = require("./bill");
const adminApiPackage = require("./package");
const adminAPIAnalyst = require("./analyst");

const router = express.Router();

router.use("/album", adminAPIAlbums);
router.use("/singer", adminApiSinger);
router.use("/song", adminApiSong);
router.use("/user", adminApiUser);
router.use("/bill", adminApiBill);
router.use("/package", adminApiPackage);
router.use("/analyst", adminAPIAnalyst);

module.exports = router;
