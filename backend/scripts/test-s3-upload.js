/**
 * Test S3 Upload Functionality
 * 
 * This script tests the S3 upload configuration without running the full server.
 * 
 * Usage:
 *   node scripts/test-s3-upload.js [path-to-image]
 * 
 * Example:
 *   node scripts/test-s3-upload.js test-image.jpg
 */

import '../src/setupEnv.js';
import { uploadImageToS3 } from '../src/utils/s3Upload.js';
import fs from 'fs';
import path from 'path';

async function testS3Upload() {
    console.log('🧪 Testing S3 Upload Configuration...\n');

    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('  AWS_REGION:', process.env.AWS_REGION || '❌ NOT SET');
    console.log('  AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ NOT SET');
    console.log('  AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ NOT SET');
    console.log('  AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET || '❌ NOT SET');
    console.log();

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET) {
        console.error('❌ Missing required AWS environment variables!');
        console.error('Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET in your .env file');
        process.exit(1);
    }

    // Check if image file is provided
    const imagePath = process.argv[2];
    if (!imagePath) {
        console.log('ℹ️  No image file provided. Skipping actual upload test.');
        console.log('Usage: node scripts/test-s3-upload.js [path-to-image]');
        console.log('Example: node scripts/test-s3-upload.js test-image.jpg\n');
        console.log('✅ Environment variables are configured correctly.');
        console.log('You can now test the upload by submitting a complaint with an image through the API.');
        process.exit(0);
    }

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
        console.error(`❌ File not found: ${imagePath}`);
        process.exit(1);
    }

    try {
        console.log(`📁 Reading file: ${imagePath}`);
        const fileBuffer = fs.readFileSync(imagePath);
        const filename = path.basename(imagePath);
        const fileSize = (fileBuffer.length / 1024).toFixed(2);

        console.log(`  File size: ${fileSize} KB`);
        console.log();

        // Determine mimetype
        const ext = path.extname(filename).toLowerCase();
        const mimetypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        const mimetype = mimetypes[ext] || 'image/jpeg';

        console.log('📤 Uploading to S3...');
        const s3Url = await uploadImageToS3(fileBuffer, filename, mimetype);

        console.log();
        console.log('✅ Upload successful!');
        console.log();
        console.log('🔗 Image URL:', s3Url);
        console.log();
        console.log('You can now:');
        console.log('  1. Open the URL in your browser to view the image');
        console.log('  2. Use this URL to test the complaint system');
        console.log();
    } catch (error) {
        console.error();
        console.error('❌ Upload failed!');
        console.error('Error:', error.message);
        console.error();

        if (error.message.includes('Access Denied')) {
            console.error('Troubleshooting:');
            console.error('  1. Check if your IAM user has s3:PutObject permission');
            console.error('  2. Verify the bucket name is correct');
            console.error('  3. Check if bucket policy allows uploads');
        } else if (error.message.includes('SignatureDoesNotMatch')) {
            console.error('Troubleshooting:');
            console.error('  1. Verify AWS_ACCESS_KEY_ID is correct');
            console.error('  2. Verify AWS_SECRET_ACCESS_KEY is correct');
            console.error('  3. Check for extra spaces in .env file');
        } else if (error.message.includes('Region')) {
            console.error('Troubleshooting:');
            console.error('  1. Check if AWS_REGION matches your bucket region');
            console.error('  2. Common regions: us-east-1, us-west-2, eu-west-1');
        }

        process.exit(1);
    }
}

testS3Upload();

