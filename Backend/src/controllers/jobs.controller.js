const jobModel = require("../models/jobs.model");

async function createJob(req, res) {
  try {
    const {
      jobNo,
      clientName,
      productName,
      quantity,
      deliveryDate,
      priority,
      design,
      plate,
      printing,
      lamination,
      scodix,
      dieCutting,
      boxMaking,
    } = req.body;

    // Validate required fields
    if (!jobNo || !clientName || !productName || !quantity || !deliveryDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    const existingJob = await jobModel.findOne({ jobNo });

    if (existingJob) {
      return res.status(409).json({
        success: false,
        message: "Job number already exists.",
      });
    }

    // Create new job
    const job = await jobModel.create({
      jobNo,
      clientName,
      productName,
      quantity,
      deliveryDate,
      priority,
      design,
      plate,
      printing,
      lamination,
      scodix,
      dieCutting,
      boxMaking,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully.",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function checkJobNumberExists(req, res) {
  try {
    const { jobNo } = req.query;

    if (!jobNo) {
      return res.status(400).json({
        success: false,
        message: "Job number is required.",
      });
    }

    const existingJob = await jobModel.findOne({ jobNo });

    return res.status(200).json({
      success: true,
      exists: Boolean(existingJob),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function getAllJobs(req, res) {
  try {
    const jobs = await jobModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function getJobById(req, res) {
  try {
    const { id } = req.params;

    const job = await jobModel.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function updateJob(req, res) {
  try {
    const { id } = req.params;

    const job = await jobModel.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Update Fields
    job.clientName = req.body.clientName ?? job.clientName;
    job.productName = req.body.productName ?? job.productName;
    job.quantity = req.body.quantity ?? job.quantity;
    job.deliveryDate = req.body.deliveryDate ?? job.deliveryDate;
    job.priority = req.body.priority ?? job.priority;

    job.design = req.body.design ?? job.design;
    job.plate = req.body.plate ?? job.plate;
    job.printing = req.body.printing ?? job.printing;
    job.lamination = req.body.lamination ?? job.lamination;
    job.scodix = req.body.scodix ?? job.scodix;
    job.dieCutting = req.body.dieCutting ?? job.dieCutting;
    job.boxMaking = req.body.boxMaking ?? job.boxMaking;

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteJob(req, res) {
  try {
    const { id } = req.params;

    const deletedJob = await jobModel.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function searchJobs(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const jobs = await jobModel
      .find({
        $or: [
          { jobNo: { $regex: q, $options: "i" } },
          { clientName: { $regex: q, $options: "i" } },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
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
  createJob,
  checkJobNumberExists,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  searchJobs,
};
