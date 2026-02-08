import GoogleDriveToken from "../models/googleDriveToken.js";
import { google } from "googleapis";

// Load credentials from environment
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // e.g., http://localhost:3001/api/google/callback

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://storer-backend.onrender.com/api/google/callback"
);

export const googleAuthCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).send("❌ No authorization code provided.");

  try {
    // Get tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens (overwrite old one for testing)
    await GoogleDriveToken.deleteMany({});
    await GoogleDriveToken.create({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      scope: tokens.scope,
      tokenType: tokens.token_type,
      expiryDate: tokens.expiry_date,
    });

    console.log("✅ Tokens saved to MongoDB:", tokens);

    // Fetch user info
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    console.log("🙋 User Info:", userInfo);

    return res.redirect("https://arkive-saas.vercel.app/dashboard?googleLinked=true");
  } catch (error) {
    console.error("❌ OAuth callback error:", error.message);
    return res.status(500).send("OAuth error. Please try again.");
  }
};
