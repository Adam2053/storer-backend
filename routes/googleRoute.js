import express from "express";
import {
  googleAuthInit,
  listDriveFiles,
} from "../controllers/googleAuthController.js";
import { googleAuthCallback } from "../controllers/googleAuthTest.js";
import { getDriveStorageInfo } from "../controllers/getDriveStorage.js";

const router = express.Router();

router.get("/auth/google", googleAuthInit);
router.get("/google/callback", googleAuthCallback);
router.get("/google/files", listDriveFiles);
router.get("/google/storage", getDriveStorageInfo);

export default router;
