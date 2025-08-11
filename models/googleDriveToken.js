import mongoose from "mongoose";

const googleDriveTokenSchema = new mongoose.Schema(
  {
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    scope: { type: String },
    tokenType: { type: String },
    expiryDate: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("GoogleDriveToken", googleDriveTokenSchema);
