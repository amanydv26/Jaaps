const Job = require("../models/careerModel");

// GET all jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    if (jobs.length === 0) {
      return res.status(200).json({
        message: "No job openings found. Please create jobs.",
        jobs: []
      });
    }

    res.status(200).json({ jobs });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// POST create a job
exports.createJob = async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json({ message: "Job created", job });
  } catch (error) {
    res.status(400).json({ message: "Invalid data", error });
  }
};
