const express = require("express");
const router = express.Router();
const Package = require("../../../models/Package");
const { isValidObjectId } = require("mongoose");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");

class PackageApi {
  async getAllPackages(req, res, next) {
    try {
      const [item, itemDeleted, deletedCount] = await Promise.all([
        Package.find({}),
        Package.findDeleted({}),
        Package.countDocumentsDeleted(),
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

  // adminPackage/:id [GET]
  async getPackage(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      const adminPackage = await Package.findById(req.params.id);
      if (!adminPackage) {
        return res.status(404).json({ message: "Package not found" });
      }

      return res.json(responseSuccessDetails(adminPackage));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [POST] adminPackage/newPackage
  async newPackage(req, res, next) {
    try {
      const data = req.body;
      if (data.discount && data.discount > 100) {
        let number = data.discount;
        while (number > 100) {
          number = Math.floor(number / 10);
        }

        data.discount = number;
      }
      console.log(data.discount);
      const adminPackage = new Package(data);
      await adminPackage.save();

      return res.json(responseSuccessDetails("Package created successfully"));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [PUT] adminPackage/:id
  async updatePackage(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }

      const data = req.body;

      if (data.discount && data.discount > 100) {
        let number = data.discount;
        while (number > 100) {
          number = Math.floor(number / 10);
        }

        data.discount = number;
      }

      await Package.updateOne({ _id: req.params.id }, data);
      return res.json(responseSuccessDetails("Package updated successfully"));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [DELETE] /adminPackage/:id
  async deletePackage(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      await Package.delete({ _id: req.params.id });
      return res.json(responseSuccessDetails("Package deleted successfully"));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [GET] /adminPackage/bin
  async destroy(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      await Package.deleteOne({ _id: req.params.id });
      return res.json(responseSuccessDetails(packages));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [PATCH] adminPackage/restore/:id
  async restore(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      await Package.restore({ _id: req.params.id });
      return res.json(responseSuccessDetails("Package restored successfully"));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [POST] adminPackage/handle-form-action
  async multiAction(req, res, next) {
    try {
      switch (req.body.actionName) {
        case "delete":
          await Package.deleteMany({ _id: { $in: req.body.packageIDs } });
          return res.json(
            responseSuccessDetails("Packages deleted successfully")
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

const packageApi = new PackageApi();

router.get("/", packageApi.getAllPackages);
router.get("/:id", packageApi.getPackage);
router.post("/new", packageApi.newPackage);
router.put("/update/:id", packageApi.updatePackage);
router.delete("/:id", packageApi.deletePackage);
router.delete("destroy/:id", packageApi.destroy);
router.patch("/restore/:id", packageApi.restore);
router.post("/multi-action", packageApi.multiAction);

module.exports = router;
