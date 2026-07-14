const express = require("express");

const router = express.Router();

const jobController = require("../controllers/jobs.controller");

router.post("/", jobController.createJob);
router.get("/check-job", jobController.checkJobNumberExists);
router.get("/", jobController.getAllJobs);
router.get("/search", jobController.searchJobs);
router.get("/:id", jobController.getJobById);
router.put("/:id", jobController.updateJob);
router.delete("/:id", jobController.deleteJob);

module.exports = router;
