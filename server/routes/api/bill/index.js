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

class BillApi {
  // bill/:id [GET]
  async getBill(req, res, next) {
    try {
      const userId = req.params.id;

      if (!isValidObjectId(userId)) {
        return res.json(responseError("Id not valid"));
      }

      const bills = await Bill.find({ userId: userId });
      // .select(
      //   "packageId packageName userId amount duration paymentDate -_id"
      // );

      if (!bills) {
        return res.status(404).json({ message: "Bill not found" });
      }

      return res.json(responseSuccessDetails(bills));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [POST] bill/newBill
  async newBill(req, res, next) {
    try {
      const data = req.body;

      if (!isValidObjectId(data.userId) || !isValidObjectId(data.packageId)) {
        return res.json(responseError("Id not valid"));
      }
      const user = await User.findById(data.userId);
      const packages = await Package.findById(data.packageId);

      if (!user || !packages) {
        return res.json(responseError("User or package not founded!!!"));
      }

      const bill = new Bill(data);

      const currentDate = new Date();

      let newMonth = currentDate.getMonth() + packages.duration;
      let newYear = currentDate.getFullYear();

      if (newMonth > 11) {
        newYear = newYear + 1;
        newMonth -= 12;
      }

      user.priority = packages.priority;
      user.beginPay = new Date();
      user.endPay = data.endPay
        ? new Date(data.endPay)
        : new Date(new Date(newYear, newMonth, currentDate.getDate()));
      user.package = packages.name;

      bill.isUsed = data.isUsed || false;
      bill.isPaid = data.isPaid || false;
      bill.packageName = packages.name;

      await bill.save();
      await User.updateOne({ _id: user.id }, user);

      return res.json(
        responseSuccessDetails("Bill created successfully", user)
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }
}

const billApi = new BillApi();

router.get("/:id", billApi.getBill);
router.post("/new", billApi.newBill);

module.exports = router;
