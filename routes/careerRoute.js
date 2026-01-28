const express = require("express");
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  deleteJob,
  updateJob
} = require("../controllers/careerController");

router.get("/jobs", getJobs);          // GET all jobs
router.get("/jobs/:id", getJobById);   // GET job by ID
router.post("/create", createJob);

router.delete("/:id", deleteJob);
router.put("/:id",updateJob) //update any specific job
module.exports = router;
