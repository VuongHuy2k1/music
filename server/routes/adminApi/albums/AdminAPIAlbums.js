const express = require("express");
const router = express.Router();
const Album = require("../../../models/Album");
const Song = require("../../../models/Song");
const slugify = require("slugify");
const { isValidObjectId } = require("mongoose");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");

class AdminAPIAlbums {
  async getAllAlbums(req, res, next) {
    try {
      const [item, itemDeleted, deletedCount] = await Promise.all([
        Album.find({}),
        Album.findDeleted({}),
        Album.countDocumentsDeleted(),
      ]);
      return res.json(
        responseSuccessDetails({
          deletedCount,
          item,
          itemDeleted,
        })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // album/:id [GET]
  async getAlbum(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      const album = await Album.findById(req.params.id);
      if (!album) {
        return res.status(404).json({ message: "Album not found" });
      }

      return res.json(responseSuccessDetails(album));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [POST] album/newAlbum
  async newAlbum(req, res, next) {
    try {
      const formData = req.body;

      if (formData.slug) {
        formData.slug = slugify(formData.name, {
          remove: /[*+~.,()'"!:@]/g,
          lower: true,
          strict: true,
          locale: "vi",
        });
      }

      const album = new Album(formData);
      await album.save();

      return res.json(responseSuccessDetails("Album created successfully"));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [PUT] album/:id
  async updateAlbum(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      const formData = req.body;
      formData.slug = slugify(formData.name, {
        remove: /[*+~.,()'"!:@]/g,
        lower: true,
        strict: true,
        locale: "vi",
      });

      await Album.updateOne({ _id: req.params.id }, formData);
      return res.json(responseSuccessDetails("Album updated successfully"));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [DELETE] /album/:id
  async deleteAlbum(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      await Album.delete({ _id: req.params.id });
      return res.json(responseSuccessDetails("Album deleted successfully"));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [GET] /album/bin
  async destroy(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      const albums = await Album.deleteOne({ _id: req.params.id });
      return res.json(responseSuccessDetails(albums));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [PATCH] album/restore/:id
  async restore(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      await Album.restore({ _id: req.params.id });
      return res.json(responseSuccessDetails("Album restored successfully"));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [POST] album/handle-form-action
  async multiAction(req, res, next) {
    try {
      switch (req.body.actionName) {
        case "delete":
          await Album.deleteMany({ _id: { $in: req.body.albumIDs } });
          return res.json(
            responseSuccessDetails("Albums deleted successfully")
          );
          break;
        default:
          return res.json(responseSuccessDetails("Invalid action"));
      }
    } catch (err) {
      return res.json(responseError(err));
    }
  }
}

const adminAPIAlbums = new AdminAPIAlbums();

// Define routes for the AlbumController API
router.get("/", adminAPIAlbums.getAllAlbums);
router.get("/:id", adminAPIAlbums.getAlbum);
router.post("/new", adminAPIAlbums.newAlbum);
router.put("/update/:id", adminAPIAlbums.updateAlbum);
router.delete("/:id", adminAPIAlbums.deleteAlbum);
router.delete("/destroy/:id", adminAPIAlbums.destroy);
router.get("/restore/:id", adminAPIAlbums.restore);
router.post("/multi-action", adminAPIAlbums.multiAction);

module.exports = router;
