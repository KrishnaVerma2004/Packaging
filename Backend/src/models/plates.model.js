const mongoose = require("mongoose");

const plateSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    status: {
      type: String,
      enum: ["Available", "In Use", "Repair", "Lost","Completed"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Plate", plateSchema);
