const Exhibition = require("../models/exhibtionModel");
const uploadToCloudinary = require("../utils/cloudinary");

// CREATE EXHIBITION
exports.createExhibition = async (req, res) => {
  try {
    const { eventName, locality, address, date } = req.body;

    if (!eventName || !locality || !address || !date || !req.file) {
      return res.status(400).json({
        message: "All fields and first image are required",
      });
    }

    const imageResult = await uploadToCloudinary(
      req.file.buffer,
      "exhibitions/upcoming"
    );

    const exhibition = await Exhibition.create({
      eventName,
      locality,
      address,
      date,
      firstImage: imageResult.secure_url,
      status: "upcoming",
    });

    res.status(201).json({
      success: true,
      message: "Upcoming exhibition created",
      data: exhibition,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllExhibitions = async (req, res) => {
  const filter = req.query.status
    ? { status: req.query.status }
    : {};

  const exhibitions = await Exhibition.find(filter).sort({ date: -1 });

  res.json({ success: true, data: exhibitions });
};

exports.completeExhibition = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Second image is required",
      });
    }

    const imageResult = await uploadToCloudinary(
      req.file.buffer,
      "exhibitions/completed"
    );

    const exhibition = await Exhibition.findByIdAndUpdate(
      id,
      {
        secondImage: imageResult.secure_url,
        status: "completed",
      },
      { new: true }
    );

    if (!exhibition) {
      return res.status(404).json({ message: "Exhibition not found" });
    }

    res.status(200).json({
      success: true,
      message: "Exhibition marked as completed",
      data: exhibition,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE EXHIBITION
exports.updateExhibition = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, locality, address, date } = req.body;

    const exhibition = await Exhibition.findById(id);

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: "Exhibition not found",
      });
    }

    // (Optional but recommended) Allow edit only if completed
    if (exhibition.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed exhibitions can be edited",
      });
    }

    let updatedData = {
      eventName,
      locality,
      address,
      date,
    };

    // If image is sent, replace first image
    if (req.file) {
      const imageResult = await uploadToCloudinary(
        req.file.buffer,
        "exhibitions/updated"
      );

      updatedData.secondImage = imageResult.secure_url;
    }

    const updatedExhibition = await Exhibition.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Exhibition updated successfully",
      data: updatedExhibition,
    });
  } catch (error) {
    console.error("Update Exhibition Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// DELETE EXHIBITION
exports.deleteExhibition = async (req, res) => {
  try {
    const { id } = req.params;

    const exhibition = await Exhibition.findByIdAndDelete(id);

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: "Exhibition not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Exhibition deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
