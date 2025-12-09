const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true }, // Full Time / Part Time
    experience: { type: String, required: true },

    postedOn: { type: String, required: true }, // "12-08-2025"
    workingHours: { type: String, required: true }, 
    workingDays: { type: String, required: true },

    vacancies: { type: Number, required: true },

    description: { type: String, required: true },
    aboutRole: { type: String, required: true },

    // Must be arrays
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    keySkills: { type: [String], default: [] },
    offer: { type: [String], default: [] },

    tags: { type: [String], default: [] },
    package: { type: String, default: "" }, // optional salary/package
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
