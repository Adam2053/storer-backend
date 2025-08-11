import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 500 }, // 500MB max upload size for testing
});
