const dieModel = require("../models/die.model");
const jobModel = require("../models/jobs.model");

async function createDie(req, res) {
  try {
    const { dieNumber, job, jobId, status } = req.body;
    const jobRef = job ?? jobId;

    if (!dieNumber || !jobRef) {
      return res.status(400).json({
        success: false,
        message: "dieNumber and job are required fields.",
      });
    }

    const existingDie = await dieModel.findOne({ dieNumber });

    if (existingDie) {
      return res.status(409).json({
        success: false,
        message: "Die number already exists.",
      });
    }

    const linkedJob = await jobModel.findById(jobRef);
    if (!linkedJob) {
      return res.status(404).json({
        success: false,
        message: "Linked job not found.",
      });
    }

    const die = await dieModel.create({
      dieNumber,
      job: linkedJob._id,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Die created successfully.",
      die,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function getAllDies(req, res) {
  try {
    const dies = await dieModel
      .find()
      .populate("job", "jobNo productName clientName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dies.length,
      dies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function getDieById(req, res) {
  try {
    const { id } = req.params;
    const die = await dieModel
      .findById(id)
      .populate("job", "jobNo productName clientName");

    if (!die) {
      return res.status(404).json({
        success: false,
        message: "Die not found",
      });
    }

    res.status(200).json({
      success: true,
      die,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function updateDie(req, res) {
  try {
    const { id } = req.params;
    const die = await dieModel.findById(id);

    if (!die) {
      return res.status(404).json({
        success: false,
        message: "Die not found",
      });
    }

    const { dieNumber, job, jobId, status } = req.body;
    const jobRef = job ?? jobId;

    if (jobRef) {
      const linkedJob = await jobModel.findById(jobRef);
      if (!linkedJob) {
        return res.status(404).json({
          success: false,
          message: "Linked job not found.",
        });
      }
      die.job = linkedJob._id;
    }

    die.dieNumber = dieNumber ?? die.dieNumber;
    die.status = status ?? die.status;

    await die.save();

    res.status(200).json({
      success: true,
      message: "Die updated successfully",
      die,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteDie(req, res) {
  try {
    const { id } = req.params;
    const deletedDie = await dieModel.findByIdAndDelete(id);

    if (!deletedDie) {
      return res.status(404).json({
        success: false,
        message: "Die not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Die deleted successfully",
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
  createDie,
  getAllDies,
  getDieById,
  updateDie,
  deleteDie,
};
