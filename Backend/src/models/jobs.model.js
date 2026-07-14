const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    deliveryDate: {
      type: Date,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    design: {
      type: String,
      enum: ["Pending", "Running", "Completed"],
      default: "Pending",
    },

    plate: {
      type: String,
      enum: ["Pending", "Running", "Completed"],
      default: "Pending",
    },

    printing: {
      type: String,
      enum: ["Pending", "Running", "Completed"],
      default: "Pending",
    },

    lamination: {
      type: String,
      enum: ["Pending", "Running", "Completed"],
      default: "Pending",
    },

    scodix: {
      type: String,
      enum: ["Pending", "Running", "Completed"],
      default: "Pending",
    },
    
    dieCutting: {
      type: String,
      enum: ["Pending", "Running", "Completed"],
      default: "Pending",
    },

    boxMaking: {
      type: String,
      enum: ["Pending", "Running", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const jobModel = mongoose.model("Job", jobSchema);

module.exports = jobModel