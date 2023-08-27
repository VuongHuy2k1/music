const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const PackageSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    benefits: [{ type: String }],
    priority: { type: String },
    discount: { type: Number },
    duration: { type: Number },
  },
  { timestamps: true }
);

// Add mongoose-delete plugin
PackageSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
});

module.exports = mongoose.model("Package", PackageSchema);
