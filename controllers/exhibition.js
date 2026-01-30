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

  const exhibitions = await Exhibition.find(filter).sort({ createdAt: 1 });

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
   

    let updatedData = {
      eventName,
      locality,
      address,
      date,
    };

    // If image is sent on the basis of status
    if (req.file) {
      const imageResult = await uploadToCloudinary(
        req.file.buffer,
        "exhibitions/updated"
      );

      if (exhibition.status === 'upcoming') {
        updatedData.firstImage = imageResult.secure_url;
      } else if (exhibition.status === 'completed') {
        updatedData.secondImage = imageResult.secure_url;
      }
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
// exports.updateExhibition = async (req, res) => {
//   console.log("🔵 [STEP 1] Update Exhibition API called");

//   try {
//     const { id } = req.params;
//     console.log("🟢 [STEP 2] Exhibition ID:", id);

//     const { eventName, locality, address, date } = req.body;
//     console.log("🟢 [STEP 3] Request Body:", {
//       eventName,
//       locality,
//       address,
//       date,
//     });

//     console.log("🟢 [STEP 4] Checking uploaded file...");
//     console.log("📁 req.file:", req.file ? "File received" : "No file");

//     const exhibition = await Exhibition.findById(id);
//     console.log("🟢 [STEP 5] Exhibition fetched from DB:", exhibition);

//     if (!exhibition) {
//       console.log("🔴 [ERROR] Exhibition not found");
//       return res.status(404).json({
//         success: false,
//         message: "Exhibition not found",
//       });
//     }

//     console.log("🟢 [STEP 6] Exhibition status:", exhibition.status);

  
//     let updatedData = {};
//     console.log("🟢 [STEP 7] Building update payload");

//     if (eventName) updatedData.eventName = eventName;
//     if (locality) updatedData.locality = locality;
//     if (address) updatedData.address = address;
//     if (date) updatedData.date = date;

//     console.log("🟢 [STEP 8] Text fields prepared:", updatedData);

//     if (req.file) {
//       console.log("🟡 [STEP 9] New image detected, uploading to Cloudinary");

//       try {
//         const imageResult = await uploadToCloudinary(
//           req.file.buffer,
//           "exhibitions/updated"
//         );

//         console.log("🟢 [STEP 10] Image uploaded successfully:", imageResult.secure_url);

//         updatedData.secondImage = imageResult.secure_url;
//       } catch (uploadError) {
//         console.error("🔴 [ERROR] Cloudinary upload failed:", uploadError);
//         return res.status(500).json({
//           success: false,
//           message: "Image upload failed",
//         });
//       }
//     } else {
//       console.log("🟢 [STEP 9] No image provided, skipping upload");
//     }

//     console.log("🟢 [STEP 11] Final update payload:", updatedData);

//     const updatedExhibition = await Exhibition.findByIdAndUpdate(
//       id,
//       updatedData,
//       { new: true }
//     );

//     console.log("🟢 [STEP 12] Exhibition updated in DB:", updatedExhibition);

//     res.status(200).json({
//       success: true,
//       message: "Exhibition updated successfully",
//       data: updatedExhibition,
//     });

//     console.log("✅ [STEP 13] Update API completed successfully");
//   } catch (error) {
//     console.error("🔥 [FATAL ERROR] Update Exhibition failed:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



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


// MAKE EXHIBITION POPUP ACTIVE
exports.setPopupActive = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Deactivate any existing active popup
    await Exhibition.updateMany(
      { popupActive: true },
      { popupActive: false }
    );

    // 2️⃣ Activate selected exhibition
    const exhibition = await Exhibition.findByIdAndUpdate(
      id,
      { popupActive: true },
      { new: true }
    );

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: "Exhibition not found",
      });
    }

    res.json({
      success: true,
      message: "Popup activated successfully",
      data: exhibition,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
