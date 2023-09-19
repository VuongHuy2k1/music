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
      const year = today.getFullYear();
      const time = Number(req.params.time) || 0;
      let totalBuy = 0;
      let buyByMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const paidBills = await Bill.find({ isPaid: true });
      if (time === 0) {
        for (const bill of paidBills) {
          for (let index = 0; index <= 11; index++) {
            if (
              bill.paymentDate.getMonth() === index &&
              bill.paymentDate.getFullYear() === year
            ) {
              buyByMonth[index] += bill.amount;
            }
          }
          totalBuy += bill.amount;
        }
      } else {
        for (const bill of paidBills) {
          if (
            bill.paymentDate.getMonth() + 1 === time &&
            bill.paymentDate.getFullYear() === year
          ) {
            totalBuy += bill.amount;
          }
        }
      }
      return res.json(responseSuccessDetails({ totalBuy, buyByMonth }));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async getBuyCount(req, res, next) {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const time = Number(req.params.time) || 0;
      let totalBuy = 0;
      let buyByMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const paidBills = await Bill.find({ isPaid: true });
      if (time === 0) {
        for (const bill of paidBills) {
          for (let index = 0; index <= 11; index++) {
            if (
              bill.paymentDate.getMonth() === index &&
              bill.paymentDate.getFullYear() === year
            ) {
              buyByMonth[index]++;
            }
          }
          totalBuy++;
        }
      } else {
        for (const bill of paidBills) {
          if (
            bill.paymentDate.getMonth() + 1 === time &&
            bill.paymentDate.getFullYear() === year
          ) {
            totalBuy++;
          }
        }
      }
      return res.json(responseSuccessDetails({ totalBuy, buyByMonth }));
    } catch (err) {
      return res.json(responseError(err));
    }
  }

  async getRevenueInfo(req, res, next) {
    try {
      const today = new Date();
      const year = today.getFullYear();
      let totalBuy = [];

      function sumAmountsByPackageName(data) {
        const result = {};
        data.forEach((item) => {
          const { amount, packageName } = item;
          if (result[packageName]) {
            result[packageName] += amount;
          } else {
            result[packageName] = amount;
          }
        });
        const finalResult = Object.keys(result).map((packageName) => ({
          packageName,
          amount: result[packageName],
        }));
        return finalResult;
      }

      const paidBills = await Bill.find({ isPaid: true });

      for (const bill of paidBills) {
        for (let index = 0; index <= 11; index++) {
          if (!totalBuy[index]) {
            totalBuy[index] = [];
          }
          if (
            bill.paymentDate.getMonth() === index &&
            bill.paymentDate.getFullYear() === year
          ) {
            totalBuy[index] = [
              ...totalBuy[index],
              { amount: bill.amount, packageName: bill.packageName },
            ];
          }
        }
      }
      for (let i = 0; i <= 11; i++) {
        totalBuy[i] = sumAmountsByPackageName(totalBuy[i]);
      }
      return res.json(responseSuccessDetails(totalBuy));
    } catch (err) {
      return res.json(responseError("loi"));
    }
  }
}

const billApi = new BillApi();

router.get("/revenue/:time", billApi.getRevenue);
router.get("/revenue-info", billApi.getRevenueInfo);
router.get("/buy-count/:time", billApi.getBuyCount);

module.exports = router;
