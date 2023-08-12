const express = require("express");
const router = express.Router();
const Album = require("../../../models/Album");
const Song = require("../../../models/Song");
const Singer = require("../../../models/Singer");
const { isValidObjectId } = require("mongoose");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");

class AdminAPISongs {
  async index(req, res, next) {
    try {
      const [songs, deletedCount] = await Promise.all([
        Song.find({}),
        Song.countDocumentsDeleted(),
      ]);
      return res.json(
        responseSuccessDetails({
          deletedCount,
          songs: songs,
        })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async show(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Invalid ID"));
      }
      const song = await Song.findOne({ id: req.params.id });
      return res.json(responseSuccessDetails(song));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async store(req, res, next) {
    try {
      const song = new Song(req.body);
      song.viewsLast24Hours = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ];
      await song.save();
      return res.json(
        responseSuccessDetails({ message: "Song created successfully!" })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async update(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Invalid ID"));
      }
      await Song.updateOne({ _id: req.params.id }, req.body);
      return res.json(
        responseSuccessDetails({ message: "Song updated successfully!" })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async destroy(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Invalid ID"));
      }
      await Song.delete({ _id: req.params.id });
      return res.json(
        responseSuccessDetails({ message: "Song deleted successfully!" })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async forceDestroy(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Invalid ID"));
      }
      await Song.deleteOne({ _id: req.params.id });
      return res.json(
        responseSuccessDetails({
          message: "Song permanently deleted successfully!",
        })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async songBin(req, res, next) {
    try {
      const songs = await Song.findDeleted({});
      return res.json(responseSuccessDetails(songs));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async restore(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Invalid ID"));
      }
      await Song.restore({ _id: req.params.id });
      return res.json(
        responseSuccessDetails({ message: "Song restored successfully!" })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async handleFormAction(req, res, next) {
    try {
      switch (req.body.actionName) {
        case "delete":
          await Song.delete({ _id: { $in: req.body.albumIDs } });
          return res.json(
            responseSuccessDetails({ message: "Songs deleted successfully!" })
          );
        default:
          return res.json(
            responseSuccessDetails({ message: "Invalid action!" })
          );
      }
    } catch (err) {
      return res.json(responseError(err));
    }
  }
}

const adminAPISongs = new AdminAPISongs();

// Define routes for the API
router.get("/", adminAPISongs.index);
router.get("/:id", adminAPISongs.show);
router.post("/create", adminAPISongs.store);
router.patch("/update/:id", adminAPISongs.update);
router.delete("/soft-delete/:id", adminAPISongs.destroy);
router.delete("/force/:id", adminAPISongs.forceDestroy);
router.get("/bin", adminAPISongs.songBin);
router.patch("/restore/:id", adminAPISongs.restore);
router.post("/multi-action", adminAPISongs.handleFormAction);

module.exports = router;
