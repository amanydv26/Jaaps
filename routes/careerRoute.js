const express = require("express");
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  deleteJob
} = require("../controllers/careerController");

router.get("/jobs", getJobs);          // GET all jobs
router.get("/jobs/:id", getJobById);   // GET job by ID
router.post("/create", createJob);

router.delete("/:id", deleteJob);
module.exports = router;
