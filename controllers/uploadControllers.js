import {uploadStream} from "../services/cloudinaryService.js";


export const uploadSingleFile = async (req, res) => {
    try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const result = await uploadStream(file.buffer, file.originalname);

    console.log("\n✅ Upload complete!");
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};
