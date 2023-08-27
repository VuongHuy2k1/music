const express = require("express");
const router = express.Router();
const Bill = require("../../../models/Bill");
const User = require("../../../models/User");
const Package = require("../../../models/Package");
const {
  responseError,
  responseSuccessDetails,
} = require("../../../util/response");

class BillApi {
  async getRevenue(req, res, next) {
    try {
      const today = new Date();
      // const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const time = Number(req.params.time) || 0;

      let totalIncome = 0;

      const paidBills = await Bill.find({ isPaid: true });

      if (time === 0) {
        for (const bill of paidBills) {
          totalIncome += bill.amount;
        }
      } else {
        for (const bill of paidBills) {
          if (
            bill.paymentDate.getMonth() + 1 === time &&
            bill.paymentDate.getFullYear() === year
          ) {
            totalIncome += bill.amount;
          }
        }
      }
      return res.json(responseSuccessDetails(totalIncome));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async getBuyCount(req, res, next) {
    try {
      const today = new Date();
      // const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const time = Number(req.params.time) || 0;
      let totalBuy = 0;

      const paidBills = await Bill.find({ isPaid: true });

      if (time === 0) {
        for (const bill of paidBills) {
          totalBuy += bill.amount;
        }
      } else {
        for (const bill of paidBills) {
          if (
            bill.paymentDate.getMonth() + 1 === month &&
            bill.paymentDate.getFullYear() === year
          ) {
            totalBuy += bill.amount;
          }
        }
      }
      return res.json(responseSuccessDetails(totalBuy));
    } catch (err) {
      return res.json(responseError(err));
    }
  }
}

const billApi = new BillApi();

router.get("/revenue/:time", billApi.getRevenue);
router.get("/buy-count", billApi.getBuyCount);

module.exports = router;
