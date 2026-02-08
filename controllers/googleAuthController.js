import { google } from "googleapis";
import { getGoogleAuthClient } from "../utils/googleDriveRefresh.js";

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

// 1. Route: Start Google OAuth2 Flow
export const googleAuthInit = async (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive",
        "openid",
      ],
    });

    return res.json({ url });
  } catch (error) {
    console.error("❌ Error generating Google Auth URL:", error);
    return res.status(500).send("Failed to initiate Google OAuth.");
  }
};

// 2. Route: Handle OAuth2 Callback
export const googleAuthCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).send("❌ No authorization code provided.");

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user info
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // 🔐 Log output
    console.log("✅ Google Drive linked successfully!");
    console.log("-------------------------------------");
    console.log("🔑 Tokens:", JSON.stringify(tokens, null, 2));
    console.log("🙋 User Info:", JSON.stringify(userInfo, null, 2));
    console.log("-------------------------------------");

    // ⚠️ TODO: Save tokens and userInfo to your database
    // await UserModel.update({ googleTokens: tokens, googleProfile: userInfo });

    return res.redirect("https://arkive-saas.vercel.app/dashboard?googleLinked=success");
  } catch (error) {
    console.error("❌ OAuth callback error:", error.message);
    return res.status(500).send("OAuth error. Please try again.");
  }
};

import { buildDriveTree } from "../utils/buildDriveTree.js";

export const listDriveFiles = async (req, res) => {
  try {
    const auth = await getGoogleAuthClient();
    const drive = google.drive({ version: "v3", auth });

    const { pageSize = 100, pageToken } = req.query; // default bigger page size

    const { data } = await drive.files.list({
      pageSize: Number(pageSize),
      pageToken: pageToken || undefined,
      fields:
        " nextPageToken,files(id,name, parents,mimeType,createdTime, modifiedTime, size, owners)",
      q: "'me' in owners",
    });

    if (!data.files || data.files.length === 0) {
      return res.json({ files: [], tree: [], nextPageToken: null });
    }

    // Build folder/file tree from flat list
    const tree = buildDriveTree(data.files);

    res.json({
      files: data.files, // flat list (optional for debug)
      tree, // structured tree for Arkive grid
      nextPageToken: data.nextPageToken || null,
    });
  } catch (err) {
    console.error("Error listing Drive files:", err.message);
    res.status(500).send("Failed to list files: " + err.message);
  }
};
