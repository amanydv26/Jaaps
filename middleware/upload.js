const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save inside 'uploads/catalogues'
    // C:\Users\AMAN\Desktop\JAAPS_BACKEND\middleware\upload.js
    // middleware\upload.js
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const finalName = `${uniqueId}${fileExt}`;
    
    // Store for controller use
    req.fileUUID = finalName; // e.g. "2a0e0a4f-63f3-4d3e-99a0-9d1b28e4a3ad.pdf"
    req.fileFullPath = `/uploads/${finalName}`; // full public path

    cb(null, finalName);
  }
});

const upload = multer({ storage });
module.exports = upload;
