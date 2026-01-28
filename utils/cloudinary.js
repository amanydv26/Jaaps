const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer, folder = "exhibitions") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(buffer);
  });
};

module.exports = uploadToCloudinary;
