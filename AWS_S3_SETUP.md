# AWS S3 Image Upload Setup

This document explains how to set up AWS S3 for storing complaint images.

## Overview

When a user submits a complaint with an image:
1. Frontend sends the image file via multipart/form-data
2. Backend receives the image in memory (via multer)
3. Image is uploaded to AWS S3 in the `IMAGE/` folder
4. S3 URL is stored in the MySQL database
5. Image is served directly from S3 (not from local backend)

## AWS S3 Configuration

### Step 1: Create an S3 Bucket

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **S3** service
3. Click **Create bucket**
4. Configure:
   - **Bucket name**: `hostel-complaints` (or your preferred name)
   - **AWS Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Block Public Access settings**: Uncheck "Block all public access" (images need to be publicly accessible)
   - **Bucket Versioning**: Optional
   - **Tags**: Optional
5. Click **Create bucket**

### Step 2: Configure Bucket Policy for Public Read Access

1. Go to your bucket → **Permissions** tab
2. Scroll to **Bucket Policy**
3. Add the following policy (replace `hostel-complaints` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::hostel-complaints/IMAGE/*"
    }
  ]
}
```

This allows public read access only to objects in the `IMAGE/` folder.

### Step 3: Enable CORS (Cross-Origin Resource Sharing)

1. Go to **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Step 4: Create IAM User with S3 Access

1. Navigate to **IAM** service
2. Click **Users** → **Add users**
3. Username: `hostel-app-s3-uploader`
4. Access type: **Programmatic access**
5. Permissions: Attach policy **AmazonS3FullAccess** (or create custom policy below)
6. Complete the wizard and **save the credentials**:
   - Access Key ID
   - Secret Access Key

#### Custom IAM Policy (More Secure)

Instead of full S3 access, create a custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::hostel-complaints/IMAGE/*"
    }
  ]
}
```

## Backend Environment Configuration

Add these variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=hostel-complaints
```

**⚠️ Important Security Notes:**
- Never commit `.env` file to version control
- Keep AWS credentials secure
- Rotate credentials periodically
- Use IAM roles when deploying to AWS (EC2, ECS, Lambda)

## Testing the Setup

### 1. Test S3 Upload Manually

You can test if your credentials work:

```bash
cd backend
node
```

```javascript
import { uploadImageToS3 } from './src/utils/s3Upload.js';
import fs from 'fs';

// Test with a local image
const buffer = fs.readFileSync('/path/to/test-image.jpg');
const url = await uploadImageToS3(buffer, 'test.jpg', 'image/jpeg');
console.log('Uploaded to:', url);
```

### 2. Test via API

1. Start the backend server: `npm run dev`
2. Use Postman or curl to create a complaint with an image:

```bash
curl -X POST http://localhost:4000/api/complaints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "category=Mess" \
  -F "title=Test Complaint" \
  -F "description=Testing S3 upload" \
  -F "image=@/path/to/image.jpg"
```

3. Check the response for the S3 URL
4. Visit the URL in your browser to verify the image is accessible

## Folder Structure in S3

```
hostel-complaints/
└── IMAGE/
    ├── 1703123456789_abcd1234.jpg
    ├── 1703123457890_efgh5678.png
    └── ...
```

All complaint images are stored in the `IMAGE/` folder with unique filenames:
- Format: `{timestamp}_{randomHash}.{extension}`
- Example: `1703123456789_abcd1234.jpg`

## Image URLs

Images are accessible via public URLs:

```
https://hostel-complaints.s3.us-east-1.amazonaws.com/IMAGE/1703123456789_abcd1234.jpg
```

These URLs are:
- Stored in the `complaints.image_url` column in MySQL
- Returned in API responses
- Displayed in the admin interface

## Migration from Local Storage

If you have existing images in local `uploads/` folder:

1. Keep the old images accessible temporarily
2. New complaints will use S3
3. Optionally migrate old images:

```javascript
// Migration script example
import fs from 'fs';
import path from 'path';
import { uploadImageToS3 } from './src/utils/s3Upload.js';
import { query as db } from './src/config/db.js';

async function migrateImages() {
  const complaints = await db('SELECT complaint_id, image_url FROM complaints WHERE image_url IS NOT NULL');
  
  for (const complaint of complaints) {
    if (complaint.image_url.startsWith('/uploads/')) {
      const localPath = path.join('backend', complaint.image_url);
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const filename = path.basename(localPath);
        const s3Url = await uploadImageToS3(buffer, filename, 'image/jpeg');
        
        await db('UPDATE complaints SET image_url = ? WHERE complaint_id = ?', [s3Url, complaint.complaint_id]);
        console.log(`Migrated: ${filename} -> ${s3Url}`);
      }
    }
  }
}
```

## Cost Considerations

### S3 Pricing (us-east-1, approximate):
- **Storage**: $0.023 per GB/month
- **PUT requests**: $0.005 per 1,000 requests
- **GET requests**: $0.0004 per 1,000 requests
- **Data transfer out**: $0.09 per GB (first 10TB/month)

### Example Cost Calculation:
- 1,000 complaints/month with images
- Average image size: 2MB
- Storage: 2GB = $0.046/month
- Uploads: 1,000 PUT = $0.005
- Views: 10,000 GET = $0.004
- **Total**: ~$0.06/month

S3 Free Tier (first 12 months):
- 5GB storage
- 20,000 GET requests
- 2,000 PUT requests

## Troubleshooting

### Error: "Access Denied"
- Check bucket policy allows public read
- Verify IAM user has PutObject permission
- Check bucket name matches in config

### Error: "SignatureDoesNotMatch"
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct
- Check for extra spaces in .env file

### Error: "Region mismatch"
- Ensure AWS_REGION matches your bucket's region

### Images not accessible
- Check bucket policy allows public GetObject
- Verify ACL is set to 'public-read' in upload code
- Test URL directly in browser

## Production Recommendations

1. **Use CloudFront CDN**: Distribute images globally with lower latency
2. **Enable S3 Transfer Acceleration**: Faster uploads from distant locations
3. **Image Optimization**: Compress images before upload (client-side)
4. **Lifecycle Policies**: Archive or delete old complaint images after X days
5. **Use IAM Roles**: When deploying to AWS EC2/ECS, use roles instead of access keys
6. **Enable S3 Bucket Logging**: Monitor access patterns and security

## Security Best Practices

- ✅ Use IAM policies with least privilege
- ✅ Never expose AWS credentials in frontend
- ✅ Validate file types and sizes on backend
- ✅ Use signed URLs for sensitive images (if needed)
- ✅ Enable S3 bucket versioning for recovery
- ✅ Monitor S3 costs and access logs
- ✅ Rotate AWS credentials regularly

