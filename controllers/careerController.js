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

  console.log("hottong api for career")
  try {
    const {
      title,
      location,
      jobType,
      experience,
      postedOn,
      workingHours,
      workingDays,
      vacancies,
      description,
      aboutRole,
      responsibilities,
      requirements,
      keySkills,
      offer,
      tags,
      package: jobPackage,
    } = req.body;

    // basic validation
    // if (
    //   !title ||
    //   !location ||
    //   !jobType ||
    //   !experience ||
    //   !postedOn ||
    //   !workingHours ||
    //   !workingDays ||
    //   !vacancies ||
    //   !description ||
    //   !aboutRole
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "All required fields must be filled",
    //   });
    // }

    const job = await Job.create({
      title,
      location,
      jobType,
      experience,
      postedOn,
      workingHours,
      workingDays,
      vacancies,
      description,
      aboutRole,
      responsibilities,
      requirements,
      keySkills,
      offer,
      tags,
      package: jobPackage,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};



// DELETE job by ID
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

// UPDATE job by ID
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      location,
      jobType,
      experience,
      postedOn,
      workingHours,
      workingDays,
      vacancies,
      description,
      aboutRole,
      responsibilities,
      requirements,
      keySkills,
      offer,
      tags,
      package: jobPackage,
    } = req.body;

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      {
        title,
        location,
        jobType,
        experience,
        postedOn,
        workingHours,
        workingDays,
        vacancies,
        description,
        aboutRole,
        responsibilities,
        requirements,
        keySkills,
        offer,
        tags,
        package: jobPackage,
      },
      {
        new: true,        // return updated document
        runValidators: true,
      }
    );

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });

  } catch (error) {
    console.error("Update Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
};

