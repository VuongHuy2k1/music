const express = require("express");
const router = express.Router();
const path = require("path");
const Resize = require("../../../middlewares/Resize");
const Singer = require("../../../models/Singer");

const { isValidObjectId } = require("mongoose");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");

require("dotenv").config();

class AdminAPISinger {
  async getAllSinger(req, res, next) {
    try {
      const [item, itemDeleted, deletedCount] = await Promise.all([
        Singer.find({}),
        Singer.findDeleted({}),
        Singer.countDocumentsDeleted(),
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

  // singer/:slug [GET]
  async getSinger(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Invalid ID"));
      }
      const singer = await Singer.findById(req.params.id);
      if (!singer) {
        return res.status(404).json({ message: "Singer not found" });
      }
      return res.json(responseSuccessDetails(singer));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [POST] singer/store
  async store(req, res, next) {
    try {
      req.body.views = 0;
      const singer = new Singer(req.body);
      await singer.save();
      return res.json(
        responseSuccessDetails({ message: "Singer created successfully" })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [PUT] singer/:id
  async update(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Invalid ID"));
      }
      await Singer.updateOne({ _id: req.params.id }, req.body);
      return res.json(
        responseSuccessDetails({ message: "Singer updated successfully" })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [DELETE] /singer/:id
  async deleteSinger(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Invalid ID"));
      }
      await Singer.delete({ _id: req.params.id });
      return res.json(
        responseSuccessDetails({ message: "Singer deleted successfully" })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [DELETE] /singer/force/:id
  async forceDestroy(req, res, next) {
    try {
      await Singer.deleteOne({ _id: req.params.id });
      return res.json(
        responseSuccessDetails({ message: "Singer force deleted successfully" })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [GET] /singer/bin
  async singerBin(req, res, next) {
    try {
      const singer = await Singer.findDeleted({});
      return res.json(responseSuccessDetails({ singer: singer }));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [PATCH] singer/restore/:id
  async restore(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Invalid ID"));
      }
      await Singer.restore({ _id: req.params.id });
      return res.json(
        responseSuccessDetails({ message: "Singer restored successfully" })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [POST] singer/handle-form-action
  async handleFormAction(req, res, next) {
    try {
      switch (req.body.actionName) {
        case "delete":
          await Singer.delete({ _id: { $in: req.body.albumIDs } });
          return res.json(
            responseSuccessDetails({ message: "Singers deleted successfully" })
          );

        default:
          return res.json({ message: "Invalid action" });
      }
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [POST] singer/:id/upload-image
  async uploadImage(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Invalid ID"));
      }
      const imagePath = path.join("test/public/img");
      const fileUpload = new Resize(imagePath);
      const id = req.params.id;

      if (req.file) {
        const filename = await fileUpload.save(req.file.buffer);
        const img = path.join(process.env.LOCAL_STATIC_STORE + filename);
        await Singer.updateOne({ _id: id }, { img: img });
        return res.json(
          responseSuccessDetails({ message: "Image uploaded successfully" })
        );
      } else {
        return res.status(400).json({ message: "Image upload failed" });
      }
    } catch (err) {
      return res.json(responseError(err));
    }
  }
}
const adminAPISinger = new AdminAPISinger();

// Define routes for the AdminAPISinger API
router.get("/", adminAPISinger.getAllSinger);
router.get("/:id", adminAPISinger.getSinger);
router.post("/new", adminAPISinger.store);
router.put("/update/:id", adminAPISinger.update);
router.delete("/:id", adminAPISinger.deleteSinger);
router.delete("/destroy/:id", adminAPISinger.forceDestroy);
router.get("/bin", adminAPISinger.singerBin);
router.patch("/restore/:id", adminAPISinger.restore);
router.post("/upload-image/:id", adminAPISinger.uploadImage);

module.exports = router;
