const admin = require("./admin");
const api = require("./api");
// const { responseSuccessDetails, responseError } = require("../util/response");
// const { isValidObjectId } = require("mongoose");

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

  // app.use("/test/:a", async function (req, res, next) {
  //   try {
  //     const a = req.params.a;
  //     if (isValidObjectId(a)) {
  //       return res.json(responseSuccessDetails("Update success"));
  //     } else {
  //       return res.json(responseSuccessDetails("Update success"));
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);

  //     return res.status(500).json(responseError("Internal server error"));
  //   }
  // });
}

module.exports = route;
