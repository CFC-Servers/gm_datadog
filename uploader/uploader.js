const fs = require('fs');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const accountID = process.env.CF_ACCOUNT_ID;
if (!accountID) { throw new Error("CF_ACCOUNT_ID environment variable not set - cannot function!"); }

const accessKeyID = process.env.CF_ACCESS_KEY_ID;
if (!accessKeyID) { throw new Error("CF_ACCESS_KEY_ID environment variable not set - cannot function!"); }

const secretAccessKey = process.env.CF_SECRET_ACCESS_KEY;
if (!secretAccessKey) { throw new Error("CF_SECRET_ACCESS_KEY environment variable not set - cannot function!"); }

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyID,
    secretAccessKey: secretAccessKey,
  },
});


export const uploadFile = async (realPath, fileName) => {
  const fileStream = fs.createReadStream(realPath);
  fileStream.on("end", () => {
    console.log("File read stream finished:", realPath);
  });

  fileStream.on("error", (err) => {
    console.error(`Error reading file stream: '${realPath}' - ${err}`);
    fileStream.destroy();
  });

  const command = new PutObjectCommand({
    Bucket: "wisp-server-logs",
    Key: fileName,
    Body: fileStream,
    ContentLength: fileStream.readableLength,
  });

  console.log(`Uploading: '${realPath}' to '${fileName}'...`);

  try {
    const result = await S3.send(command);
    console.log(`Upload of '${realPath}' successful`);
    console.log(result);
  } catch (err) {
    console.error(`Failed to upload file! '${realPath}' - ${err}`);
  } finally {
    fileStream.destroy();
  }
}
