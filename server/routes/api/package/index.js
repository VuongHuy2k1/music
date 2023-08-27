const express = require("express");
const router = express.Router();
const Bill = require("../../../models/Bill");
const User = require("../../../models/User");
const Package = require("../../../models/Package");
const { isValidObjectId } = require("mongoose");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");

class PackageApi {
  async getAllPackages(req, res, next) {
    try {
      const [packages, deletedCount] = await Promise.all([
        Package.find({}),
        Package.countDocumentsDeleted(),
      ]);
      return res.json(
        responseSuccessDetails({
          deletedCount,
          packages: packages,
        })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // package/:id [GET]
  async getPackage(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      const packages = await Package.findById(req.params.id);
      if (!packages) {
        return res.status(404).json({ message: "Package not found" });
      }

      return res.json(responseSuccessDetails(packages));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async usePackage(req, res, next) {
    try {
      const data = req.body;

      if (
        !isValidObjectId(req.params.packageId) ||
        !isValidObjectId(data.userId) ||
        !isValidObjectId(data.packageId)
      ) {
        return res.json(responseError("Id not valid"));
      }

      const bill = await Bill.findById(req.params.packageId);
      const user = await User.findById(data.userId);
      const packages = await Package.findById(data.packageId);

      if (!bill) {
        return res.json(responseError("Code is not valid"));
      }
      if (!user) {
        return res.json(responseError("User not found"));
      }
      if (!packages) {
        return res.json(responseError("Package not found"));
      }

      if (!bill.isUsed && bill.isPaid) {
        user.priority = packages.priority;
        user.beginPay = new Date();
        user.endPay = data.endPay;
        user.package = packages.name;

        bill.isUsed = true;

        const [userSave, updateBill] = await Promise.all([
          user.save(),
          bill.save(),
        ]);
        return res.json(responseSuccessDetails({ ...updateBill, ...user }));
      } else {
        return res.json(responseError("Code is incorrect or has been used"));
      }
    } catch (err) {
      return res.json(responseError(err));
    }
  }
}

const packageApi = new PackageApi();

router.get("/", packageApi.getAllPackages);
router.get("/:id", packageApi.getPackage);
router.get("/use-package/:packageId", packageApi.usePackage);

module.exports = router;
