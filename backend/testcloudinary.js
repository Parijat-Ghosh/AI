const dotenv = require("dotenv");
dotenv.config();   // <---- load .env

const { uploadLocalFile } = require("./lib/cloudinary");

(async () => {
  try {
    const res = await uploadLocalFile("./uploads/test.png");
    console.log("✅ Upload OK:", res);
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
  }
})();
