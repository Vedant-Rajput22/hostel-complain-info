import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { s3Client, S3_BUCKET, S3_IMAGE_FOLDER } from '../config/s3.js';
import path from 'path';
import crypto from 'crypto';

/**
 * Upload an image to S3
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} originalFilename - Original filename
 * @param {string} mimetype - File mimetype
 * @returns {Promise<string>} - The S3 URL of the uploaded image
 */
export async function uploadImageToS3(fileBuffer, originalFilename, mimetype) {
    try {
        // Generate unique filename with timestamp and random hash
        const timestamp = Date.now();
        const randomHash = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(originalFilename);
        const filename = `${timestamp}_${randomHash}${ext}`;

        // S3 key with IMAGE folder prefix
        const s3Key = `${S3_IMAGE_FOLDER}/${filename}`;

        // Upload to S3
        const uploadParams = {
            Bucket: S3_BUCKET,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: mimetype,
            // Note: ACL removed - bucket uses bucket policy for public access instead
        };

        const upload = new Upload({
            client: s3Client,
            params: uploadParams,
        });

        const result = await upload.done();

        // Return the public URL
        const s3Url = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;

        return s3Url;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw new Error('Failed to upload image to S3');
    }
}

/**
 * Upload an image using PutObjectCommand (alternative simpler method for smaller files)
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} originalFilename - Original filename
 * @param {string} mimetype - File mimetype
 * @returns {Promise<string>} - The S3 URL of the uploaded image
 */
export async function uploadImageToS3Simple(fileBuffer, originalFilename, mimetype) {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomHash = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(originalFilename);
        const filename = `${timestamp}_${randomHash}${ext}`;

        // S3 key with IMAGE folder prefix
        const s3Key = `${S3_IMAGE_FOLDER}/${filename}`;

        const command = new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: mimetype,
            // Note: ACL removed - bucket uses bucket policy for public access instead
        });

        await s3Client.send(command);

        // Return the public URL
        const s3Url = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;

        return s3Url;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw new Error('Failed to upload image to S3');
    }
}

