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
  async getAllBills(req, res, next) {
    try {
      const [bills, deletedCount] = await Promise.all([
        Bill.find({}),
        Bill.countDocumentsDeleted(),
      ]);
      return res.json(
        responseSuccessDetails({
          deletedCount,
          bills: bills,
        })
      );
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // bill/:id [GET]
  async getBill(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      const bill = await Bill.findById(req.params.id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      return res.json(responseSuccessDetails(bill));
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
      console.log(data);
      await bill.save();
      await user.save();

      return res.json(responseSuccessDetails("Bill created successfully"));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [PUT] bill/:id
  async updateBill(req, res, next) {
    try {
      const data = req.body;

      if (
        !isValidObjectId(req.params.id) ||
        !isValidObjectId(data.userId) ||
        !isValidObjectId(data.packageId)
      ) {
        return res.json(responseError("Id not valid"));
      }

      const user = await User.findById(data.userId);
      const packages = await Package.findById(data.packageId);

      if (!user || !packages) {
        return res.json(responseError("User or package not founded!!!"));
      }
      const bill = await Bill.findById(req.params.id);

      if (data.isPaid) {
        if (data.type === "use") {
          user.priority = packages.priority;
          user.beginPay = new Date();
          user.endPay = data.endPay;
          user.package = packages.name;
          bill.isUsed = true;
        } else if (data.type === "code") {
          if (!isValidObjectId(data.code)) {
            return res.json(responseError("Id not valid"));
          }
          const code = await Package.findById(data.packageId);
          if (code) {
            user.role = code.name;
            user.priority = code.priority;
            user.beginPay = new Date();
            user.endPay = data.endPay;
            user.packet = code.name;
            bill.isUsed = true;
          } else {
            return res.json(responseError("Code is not valid"));
          }
        }

        await Promise.all([user.save(), bill.save()]);

        return res.json(responseSuccessDetails(bill));
      } else {
        return res.json(responseError("Bill has not been paid"));
      }
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [DELETE] /bill/:id
  async deleteBill(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      await Bill.deleteOne({ _id: req.params.id });
      return res.json(responseSuccessDetails("Bill deleted successfully"));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [GET] /bill/bin
  async destroy(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      const bills = await Bill.findDeleted({});
      return res.json(responseSuccessDetails(bills));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [PATCH] bill/restore/:id
  async restore(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.json(responseError("Id not valid"));
      }
      await Bill.restore({ _id: req.params.id });
      return res.json(responseSuccessDetails("Bill restored successfully"));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  // [POST] bill/handle-form-action
  async multiAction(req, res, next) {
    try {
      switch (req.body.actionName) {
        case "delete":
          await Bill.deleteMany({ _id: { $in: req.body.billIDs } });
          return res.json(responseSuccessDetails("Bills deleted successfully"));
          break;
        default:
          return res.json(responseSuccessDetails("Invalid action"));
      }
    } catch (err) {
      return res.json(responseError(err));
    }
  }
}

const billApi = new BillApi();

router.get("/", billApi.getAllBills);
router.get("/:id", billApi.getBill);
router.post("/new", billApi.newBill);
router.put("/update/:id", billApi.updateBill);

module.exports = router;
