const admin = require("./adminLocal");
const adminAPIA = require("./adminApi");
const api = require("./api");
// test api
const { responseSuccessDetails, responseError } = require("../util/response");
const { isValidObjectId } = require("mongoose");
const Song = require("../models/Song");

function route(app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  app.use("/api", api);

  app.use("/admin", admin);

  app.use("/admin-api", adminAPIA);

  app.use("/test/:param", async function (req, res, next) {
    try {
      const param = req.params.param;
      const today = new Date();
      if (isValidObjectId(param)) {
        const song = await Song.findById(param);
        song.viewsLast24Hours = [
          1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3,
          4,
        ];
        song.viewsDay = 100;
        song.lastViewDate = today;
        song.save();
        return res.json(responseSuccessDetails(song));
      } else {
        return res.json(responseSuccessDetails("Update success"));
      }
    } catch (error) {
      console.error("Error:", error);

      return res.status(500).json(responseError("Internal server error"));
    }
  });
}

module.exports = route;
