const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String,  },
    location: { type: String,  },
    jobType: { type: String,  }, // Full Time / Part Time
    experience: { type: String,  },

    postedOn: { type: String,  }, // "12-08-2025"
    workingHours: { type: String,  }, 
    workingDays: { type: String,  },

    vacancies: { type: Number,  },

    description: { type: String,  },
    aboutRole: { type: String,  },

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
