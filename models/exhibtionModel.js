const mongoose = require("mongoose");

const exhibitionSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },

    locality: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    firstImage: {
      type: String, // uploaded initially
      required: true,
    },

    secondImage: {
      type: String, // uploaded after completion
      default: null,
    },
    popupActive: {
  type: Boolean,
  default: false,
},

    status: {
      type: String,
      enum: ["upcoming", "completed"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exhibition", exhibitionSchema);
