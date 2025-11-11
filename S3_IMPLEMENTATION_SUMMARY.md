# AWS S3 Image Upload Implementation Summary

## Overview

The complaint system now uploads images directly to AWS S3 instead of local storage. Images are stored in the `IMAGE/` folder within the S3 bucket and publicly accessible via HTTPS URLs.

## What Changed

### 1. New Dependencies
- `@aws-sdk/client-s3` - AWS SDK v3 S3 client
- `@aws-sdk/lib-storage` - Multipart upload support for large files

### 2. New Files Created

#### `/backend/src/config/s3.js`
- Configures S3 client with AWS credentials
- Exports bucket name and folder configuration
- Uses environment variables for credentials

#### `/backend/src/utils/s3Upload.js`
- `uploadImageToS3()` - Main upload function using multipart upload
- `uploadImageToS3Simple()` - Alternative for smaller files
- Generates unique filenames with timestamp + random hash
- Sets public-read ACL for accessibility
- Returns full S3 HTTPS URL

#### `/backend/scripts/test-s3-upload.js`
- Test script to verify S3 configuration
- Can upload a test image to S3
- Provides troubleshooting guidance

#### `/AWS_S3_SETUP.md`
- Complete setup guide for AWS S3
- Step-by-step bucket creation
- IAM policy examples
- Security best practices

### 3. Modified Files

#### `/backend/src/routes/complaints.js`
**Before:**
- Used `multer.diskStorage()` to save files locally
- Stored relative path `/uploads/filename` in database

**After:**
- Uses `multer.memoryStorage()` to keep files in memory
- Uploads buffer to S3 via `uploadImageToS3()`
- Stores full S3 URL in database (e.g., `https://bucket.s3.region.amazonaws.com/IMAGE/...`)
- Added file validation (size limit 5MB, image types only)
- Wrapped in try-catch for better error handling

#### `/backend/README.md`
- Added AWS S3 setup instructions
- Updated notes about image storage

## How It Works Now

### Upload Flow

```
User selects image in ComplaintForm.jsx
         ↓
Frontend sends multipart/form-data to POST /api/complaints
         ↓
Backend (multer) receives file in memory (req.file.buffer)
         ↓
uploadImageToS3() uploads buffer to S3
  - Bucket: AWS_S3_BUCKET
  - Key: IMAGE/{timestamp}_{hash}.{ext}
  - ACL: public-read
         ↓
S3 returns success
         ↓
Backend stores S3 URL in complaints.image_url
         ↓
Response includes complaint_id and image_url
         ↓
Frontend displays success message
```

### Accessing Images

Images are publicly accessible at:
```
https://{bucket}.s3.{region}.amazonaws.com/IMAGE/{filename}
```

Example:
```
https://hostel-complaints.s3.us-east-1.amazonaws.com/IMAGE/1703123456789_abcd1234ef567890.jpg
```

## Environment Variables Required

Add to `/backend/.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=hostel-complaints
```

## Database Schema

No changes required! The existing schema already supports this:

```sql
CREATE TABLE complaints (
  ...
  image_url VARCHAR(500),  -- Stores full S3 URL
  ...
);
```

S3 URLs are typically 80-150 characters, well within the 500 limit.

## Security Features

### Client-Side Validation (ComplaintForm.jsx)
- ✅ File size limit: 5MB
- ✅ File type validation: images only

### Server-Side Validation (complaints.js)
- ✅ Multer file filter: `image/*` mimetype only
- ✅ File size limit: 5MB
- ✅ Authentication required: `authRequired` middleware

### AWS S3 Security
- ✅ Bucket policy: Only `IMAGE/*` objects are public
- ✅ IAM policy: Limited to necessary S3 actions
- ✅ CORS configured for frontend access

## Testing

### 1. Test Environment Setup

```bash
cd backend
node scripts/test-s3-upload.js
```

This checks if AWS credentials are configured correctly.

### 2. Test with Sample Image

```bash
node scripts/test-s3-upload.js /path/to/test-image.jpg
```

This uploads a test image and returns the S3 URL.

### 3. Test via API

```bash
curl -X POST http://localhost:4000/api/complaints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "category=Mess" \
  -F "title=Test S3 Upload" \
  -F "description=Testing image upload to S3" \
  -F "image=@test-image.jpg"
```

Response should include the S3 URL:
```json
{
  "complaint_id": 123,
  "image_url": "https://hostel-complaints.s3.us-east-1.amazonaws.com/IMAGE/..."
}
```

### 4. Test Frontend

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login as a student
4. Create a complaint with an image
5. Check browser console for response
6. Verify image appears in admin dashboard

## Backward Compatibility

### Old Images
- Local images (`/uploads/*`) remain accessible via static file serving
- Database records with `/uploads/` URLs continue to work
- Only new uploads go to S3

### Migration Option
If you want to migrate old images to S3, use the migration script example in `AWS_S3_SETUP.md`.

## Cost Estimation

For a typical hostel with **500 students**:

### Assumptions
- 50 complaints/month with images
- Average image size: 2MB
- Each image viewed 20 times

### Monthly Cost
- Storage: 100MB = $0.002
- PUT requests: 50 × $0.000005 = $0.00025
- GET requests: 1,000 × $0.0000004 = $0.0004
- **Total: ~$0.003/month** (basically free)

### AWS Free Tier (first 12 months)
- 5GB storage
- 20,000 GET requests
- 2,000 PUT requests
- This covers typical hostel usage completely!

## Production Checklist

Before deploying to production:

- [ ] Create S3 bucket in AWS
- [ ] Configure bucket policy for public read (IMAGE/* only)
- [ ] Enable CORS on bucket
- [ ] Create IAM user with limited S3 permissions
- [ ] Add AWS credentials to production `.env`
- [ ] Test upload with `test-s3-upload.js`
- [ ] Test complaint creation with image via API
- [ ] Verify images are accessible in browser
- [ ] Monitor S3 costs in AWS Cost Explorer
- [ ] Set up S3 bucket lifecycle rules (optional)
- [ ] Consider CloudFront CDN for better performance (optional)

## Troubleshooting

### "Failed to upload image to S3"
- Check AWS credentials in `.env`
- Verify bucket name is correct
- Check IAM permissions

### "Access Denied"
- Bucket policy must allow PutObject
- IAM user needs s3:PutObject permission
- Check bucket name matches ENV variable

### "Images not displaying"
- Bucket policy must allow GetObject for IMAGE/*
- Images must have public-read ACL
- Check CORS configuration

### "SignatureDoesNotMatch"
- AWS credentials are incorrect
- Check for extra spaces in .env
- Regenerate access keys if needed

## Future Enhancements

### Potential Improvements
1. **Image Optimization**: Compress images before upload (sharp/jimp)
2. **CloudFront CDN**: Faster global delivery
3. **Signed URLs**: For private/sensitive images
4. **Thumbnail Generation**: Create thumbnails via Lambda
5. **Lifecycle Policies**: Auto-delete old images after X days
6. **Image Moderation**: AWS Rekognition for content filtering

## Architecture Diagram

```
┌─────────────────┐
│  Frontend       │
│  (React)        │
└────────┬────────┘
         │ multipart/form-data
         ↓
┌─────────────────┐
│  Backend        │
│  Express +      │
│  Multer         │
└────────┬────────┘
         │ uploadImageToS3()
         ↓
┌─────────────────┐
│  AWS S3         │
│  Bucket:        │
│  hostel-        │
│  complaints/    │
│    IMAGE/       │
└────────┬────────┘
         │ Store URL
         ↓
┌─────────────────┐
│  MySQL DB       │
│  complaints     │
│  .image_url     │
└─────────────────┘
```

## Key Benefits

✅ **Scalability**: No disk space concerns on backend server
✅ **Performance**: Images served from AWS infrastructure
✅ **Reliability**: 99.999999999% durability (11 9's)
✅ **Cost-effective**: Pay only for what you use (~$0.003/month)
✅ **Global Access**: Fast access from anywhere
✅ **Backup**: Automatic replication across availability zones
✅ **Security**: IAM policies and bucket policies

## Support

For issues or questions:
1. Check `AWS_S3_SETUP.md` for detailed setup guide
2. Run `node scripts/test-s3-upload.js` to diagnose issues
3. Check AWS CloudWatch logs for S3 errors
4. Review IAM permissions and bucket policies

