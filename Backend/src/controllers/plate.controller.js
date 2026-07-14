const plateModel = require("../models/plates.model");
const jobModel = require("../models/jobs.model");

async function createPlate(req, res) {
  try {
    const { plateNumber, job, jobId, status } = req.body;
    const jobRef = job ?? jobId;

    if (!plateNumber || !jobRef) {
      return res.status(400).json({
        success: false,
        message: "plateNumber and job are required fields.",
      });
    }

    const existingPlate = await plateModel.findOne({ plateNumber });

    if (existingPlate) {
      return res.status(409).json({
        success: false,
        message: "Plate number already exists.",
      });
    }

    const linkedJob = await jobModel.findById(jobRef);
    if (!linkedJob) {
      return res.status(404).json({
        success: false,
        message: "Linked job not found.",
      });
    }

    const plate = await plateModel.create({
      plateNumber,
      job: linkedJob._id,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Plate created successfully.",
      plate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function getAllPlates(req, res) {
  try {
    const plates = await plateModel
      .find()
      .populate("job", "jobNo productName clientName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plates.length,
      plates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function getPlateById(req, res) {
  try {
    const { id } = req.params;
    const plate = await plateModel
      .findById(id)
      .populate("job", "jobNo productName clientName");

    if (!plate) {
      return res.status(404).json({
        success: false,
        message: "Plate not found",
      });
    }

    res.status(200).json({
      success: true,
      plate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function updatePlate(req, res) {
  try {
    const { id } = req.params;
    const plate = await plateModel.findById(id);

    if (!plate) {
      return res.status(404).json({
        success: false,
        message: "Plate not found",
      });
    }

    const { plateNumber, job, jobId, status } = req.body;
    const jobRef = job ?? jobId;

    if (jobRef) {
      const linkedJob = await jobModel.findById(jobRef);
      if (!linkedJob) {
        return res.status(404).json({
          success: false,
          message: "Linked job not found.",
        });
      }
      plate.job = linkedJob._id;
    }

    plate.plateNumber = plateNumber ?? plate.plateNumber;
    plate.status = status ?? plate.status;

    await plate.save();

    res.status(200).json({
      success: true,
      message: "Plate updated successfully",
      plate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deletePlate(req, res) {
  try {
    const { id } = req.params;
    const deletedPlate = await plateModel.findByIdAndDelete(id);

    if (!deletedPlate) {
      return res.status(404).json({
        success: false,
        message: "Plate not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Plate deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports = {
  createPlate,
  getAllPlates,
  getPlateById,
  updatePlate,
  deletePlate,
};
