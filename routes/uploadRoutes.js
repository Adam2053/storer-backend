import express from 'express'
import { uploadSingleFile } from '../controllers/uploadControllers.js';
import { upload } from '../middlewares/uploadSingle.js';

const router = express.Router();

router.post("/single",upload.single("file"), uploadSingleFile);


export default router;