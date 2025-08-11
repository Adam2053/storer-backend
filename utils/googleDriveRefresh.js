import { google } from "googleapis";
import GoogleDriveToken from "../models/googleDriveToken.js";

export const getGoogleAuthClient = async () => {
  const tokenDoc = await GoogleDriveToken.findOne();
  if (!tokenDoc) throw new Error("No Google Drive token found in DB");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: tokenDoc.accessToken,
    refresh_token: tokenDoc.refreshToken,
    scope: tokenDoc.scope,
    token_type: tokenDoc.tokenType,
    expiry_date: tokenDoc.expiryDate,
  });

  // If expired, refresh
  if (Date.now() >= tokenDoc.expiryDate) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    tokenDoc.accessToken = credentials.access_token;
    tokenDoc.expiryDate = credentials.expiry_date;
    await tokenDoc.save();

    console.log("♻️ Access token refreshed");
  }

  return oauth2Client;
};
