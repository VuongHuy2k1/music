const Album = require("../models/Album");
const Song = require("../models/Song");
const Singer = require("../models/Singer");
const {
  multipleMongooseToObject,
  mongooseToObject,
} = require("../util/mongoose");
const slugify = require("slugify");

class AlbumController {
  async index(req, res, next) {
    try {
      const [albums, deletedCount] = await Promise.all([
        Album.find({}),
        Album.countDocumentsDeleted(),
      ]);
      res.render("./albums/albums", {
        deletedCount,
        albums: multipleMongooseToObject(albums),
      });
    } catch (err) {
      next(err);
    }
  }

  // album/:id [GET]
  async show(req, res, next) {
    try {
      const album = await Album.findById(req.params.id);
      if (!album) {
        return res.status(404).send("Album not found");
      }

      const albumName = album.name;
      const songs = await Song.find({ album: albumName });

      res.render("./albums/show", {
        songs: multipleMongooseToObject(songs),
        album: mongooseToObject(album),
      });
    } catch (err) {
      next(err);
    }
  }

  // album/create [GET]
  async create(req, res, next) {
    try {
      const singers = await Singer.find({});
      res.render("./albums/create", {
        singers: multipleMongooseToObject(singers),
      });
    } catch (err) {
      next(err);
    }
  }

  // [POST] album/store
  async store(req, res, next) {
    try {
      const formData = req.body;
      formData.slug = slugify(formData.name, {
        remove: /[*+~.,()'"!:@]/g,
        lower: true,
        strict: true,
        locale: "vi",
      });

      const album = new Album(formData);
      await album.save();

      res.redirect("/admin/album");
    } catch (err) {
      next(err);
    }
  }

  // album/edit/:id [GET]
  async edit(req, res, next) {
    try {
      const album = await Album.findById(req.params.id);
      if (!album) {
        return res.status(404).send("Album not found");
      }

      res.render("./albums/edit", {
        album: mongooseToObject(album),
      });
    } catch (err) {
      next(err);
    }
  }

  // [PUT] album/:id
  async update(req, res, next) {
    try {
      const formData = req.body;
      formData.slug = slugify(formData.name, {
        remove: /[*+~.,()'"!:@]/g,
        lower: true,
        strict: true,
        locale: "vi",
      });

      await Album.updateOne({ _id: req.params.id }, formData);
      res.redirect("/album");
    } catch (err) {
      next(err);
    }
  }

  // [DELETE] /album/:id
  async destroy(req, res, next) {
    try {
      await Album.deleteOne({ _id: req.params.id });
      res.redirect("back");
    } catch (err) {
      next(err);
    }
  }

  // [DELETE] /album/force/:id
  async forceDestroy(req, res, next) {
    try {
      await Album.deleteOne({ _id: req.params.id });
      res.redirect("back");
    } catch (err) {
      next(err);
    }
  }

  // [GET] /album/bin
  async albumBin(req, res, next) {
    try {
      const albums = await Album.findDeleted({});
      res.render("./albums/bin", {
        albums: multipleMongooseToObject(albums),
      });
    } catch (err) {
      next(err);
    }
  }

  // [PATCH] album/restore/:id
  async restore(req, res, next) {
    try {
      await Album.restore({ _id: req.params.id });
      res.redirect("back");
    } catch (err) {
      next(err);
    }
  }

  // [POST] album/handle-form-action
  async handleFormAction(req, res, next) {
    try {
      switch (req.body.actionName) {
        case "delete":
          await Album.deleteMany({ _id: { $in: req.body.albumIDs } });
          res.redirect("back");
          break;
        default:
          res.json({ message: "Invalid action" });
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AlbumController();
