import { google } from "googleapis";
import { getGoogleAuthClient } from "../utils/googleDriveRefresh.js";

const bytesToGB = (limit, usage, usageInDrive, usageInDriveTrash) => {
  const format = (byteStr) => {
    if (!byteStr) return 0;
    const bytes = parseInt(byteStr, 10);
    const gb = bytes / 1024 ** 3;
    return parseFloat(gb.toFixed(2));
  };

  return {
    limit: format(limit),
    usage: format(usage),
    usageInDrive: format(usageInDrive),
    usageInDriveTrash: format(usageInDriveTrash),
  };
};

export const getDriveStorageInfo = async (req, res) => {
  const auth = await getGoogleAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.about.get({
    fields: "storageQuota",
  });

  const { limit, usage, usageInDrive, usageInDriveTrash } =
    response.data.storageQuota;

  const formattedQuota = bytesToGB(
    limit,
    usage,
    usageInDrive,
    usageInDriveTrash
  );
  res.status(200).json({
    formattedQuota,
    message: "it is done",
  });
};
