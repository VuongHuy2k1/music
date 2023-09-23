const express = require("express");
const media = require("./media");
const playlist = require("./playlist");
const user = require("./user");
const bill = require("./bill");
const packageApi = require("./package");

const router = express.Router();

router.use("/media", media);

router.use("/user", user);

router.use("/playlist", playlist);

router.use("/bill", bill);

router.use("/package", packageApi);

module.exports = router;
