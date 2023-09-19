const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BillSchema = new Schema(
  {
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paymentDate: { type: Date, default: new Date() },
    packageName: { type: String },
    isPaid: { type: Boolean, default: false },
    isUsed: { type: Boolean, default: true },
    amount: { type: Number, required: true },
    duration: { type: Number, required: true },
    expirationDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", BillSchema);
