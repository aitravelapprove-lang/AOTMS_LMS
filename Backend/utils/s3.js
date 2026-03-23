const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_BUCKET_NAME;

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Upload a file directly to S3 from the server.
 * @param {Buffer} fileBuffer - The file content.
 * @param {string} fileName - The desired path/name in S3.
 * @param {string} mimeType - The file's MIME type.
 * @returns {Promise<string>} The public URL or key of the uploaded file.
 */
async function uploadFile(fileBuffer, fileName, mimeType) {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType
        // ACL: 'public-read' // Only if bucket allows public ACLs. If blocked, we rely on bucket policy or signed URLs.
    });

    await s3Client.send(command);
    // Return the key so we can generate signed URLs later, or the full URL if public access is enabled
    // For now, let's return the key as the "url" stored in DB, or construct a virtual hosted style URL
    // But since the frontend expects a URL to "Download", we might need a signed URL or a public URL.
    // Assuming the user wants public read or signed URLs. Let's return the key for now and handling viewing logic.
    // actually, let's return the standard S3 URL format
    return fileName;
}

/**
 * Generate a pre-signed URL for uploading a file directly from the browser to S3.
 * @param {string} fileName - The desired name/path of the file in S3.
 * @param {string} fileType - The MIME type of the file.
 * @returns {Promise<string>} The pre-signed upload URL.
 */
async function generateUploadUrl(fileName, fileType) {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        ContentType: fileType,
    });

    // URL expires in 15 minutes (900 seconds)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return uploadUrl;
}

/**
 * Generate a pre-signed URL for viewing/downloading an object securely.
 * @param {string} fileName - The key/path of the file in S3.
 * @returns {Promise<string>} The pre-signed viewing URL.
 */
async function generateViewUrl(fileName) {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: fileName
    });

    // URL expires in 1 hour (3600 seconds)
    const viewUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return viewUrl;
}

/**
 * Deletes an object from the S3 bucket.
 * @param {string} fileName - The key/path of the file in S3.
 */
async function deleteObject(fileName) {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: fileName
    });
    await s3Client.send(command);
    return true;
}

module.exports = {
    s3Client,
    generateUploadUrl,
    generateViewUrl,
    deleteObject,
    uploadFile,
    BUCKET
};
