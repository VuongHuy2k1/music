const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require("mongoose-slug-generator");
const mongooseDelete = require("mongoose-delete");

const Song = new Schema(
  {
    name: { type: String, require: true },
    type: { type: String },
    img: { type: String },
    url: { type: String },
    singer: { type: String },
    priority: { type: String },
    album: { type: String },
    legion: { type: String },
    views: { type: Number, default: 0 },
    lastViewDate: { type: Date },
    viewsDay: { type: Number, default: 0 },
    viewsWeek: { type: Number, default: 0 },
    viewsMonth: { type: Number, default: 0 },
    viewsLast24Hours: [
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
      { type: Number, default: 0 },
    ],
  },
  { timestamps: true }
);

// add plugin
mongoose.plugin(slug);
Song.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
});

module.exports = mongoose.model("Song", Song);
