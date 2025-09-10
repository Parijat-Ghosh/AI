// lib/cloudinary.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadLocalFile(filePath, folder = "chat-uploads", transform = { width: 512, height: 512 }) {
  const opts = {
    folder,
    resource_type: "image",
  };

  // If transform provided, apply a "limit" resize (keeps aspect ratio).
  if (transform && (transform.width || transform.height)) {
    opts.transformation = [{ width: transform.width || null, height: transform.height || null, crop: "limit" }];
  }

  const res = await cloudinary.uploader.upload(filePath, opts);
  return {
    url: res.secure_url,
    publicId: res.public_id,
    width: res.width,
    height: res.height,
    mimeType: res.format,
  };
}

async function deleteByPublicId(publicId) {
  try { await cloudinary.uploader.destroy(publicId); } catch {}
}

module.exports = { cloudinary, uploadLocalFile, deleteByPublicId };


