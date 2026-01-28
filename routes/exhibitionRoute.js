const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer");
const {
  createExhibition,
  getAllExhibitions,
  completeExhibition,
  deleteExhibition,
  setPopupActive,
  updateExhibition // ✅ MISSING IMPORT (IMPORTANT)
} = require("../controllers/exhibition");

// POST → create upcoming exhibition (first image)
router.post(
  "/create",
  upload.single("firstImage"),
  createExhibition
);

// GET → all exhibitions
router.get("/", getAllExhibitions);

// PATCH → mark exhibition as completed (second image)
router.patch(
  "/:id/complete",
  upload.single("secondImage"),
  completeExhibition
);

router.put(
  "/:id",
  upload.single("firstImage"),
  updateExhibition
);

router.delete("/:id", deleteExhibition);
router.patch("/exhibition/:id/popup", setPopupActive);

module.exports = router;
