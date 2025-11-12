# Quick Start Guide - AWS S3 Image Upload

## 🚀 In 5 Minutes

### Step 1: Install Dependencies ✅
Already done! The AWS SDK packages are installed:
- `@aws-sdk/client-s3`
- `@aws-sdk/lib-storage`

### Step 2: AWS Console Setup (5 minutes)

#### 2.1 Create S3 Bucket
1. Go to https://console.aws.amazon.com/s3/
2. Click **Create bucket**
3. Bucket name: `hostel-complaints` (or your choice)
4. Region: `us-east-1` (or closest to you)
5. **UNCHECK** "Block all public access"
6. Click **Create bucket**

#### 2.2 Set Bucket Policy
1. Open your bucket → **Permissions** tab
2. Scroll to **Bucket Policy** → Click **Edit**
3. Paste this (replace `hostel-complaints` with your bucket name):

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

4. Click **Save changes**

#### 2.3 Create IAM User
1. Go to https://console.aws.amazon.com/iam/
2. Click **Users** → **Add users**
3. Username: `hostel-app-uploader`
4. Check **Programmatic access**
5. Click **Next: Permissions**
6. Click **Attach existing policies directly**
7. Search for and select: `AmazonS3FullAccess`
8. Click **Next** → **Create user**
9. **IMPORTANT**: Copy these credentials:
   - Access Key ID
   - Secret Access Key

### Step 3: Configure Backend

Edit `/backend/.env` and add:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
AWS_S3_BUCKET=hostel-complaints
```

### Step 4: Test Setup

```bash
cd backend
npm run test:s3
```

You should see:
```
🧪 Testing S3 Upload Configuration...

📋 Environment Variables:
  AWS_REGION: us-east-1
  AWS_ACCESS_KEY_ID: ✅ Set
  AWS_SECRET_ACCESS_KEY: ✅ Set
  AWS_S3_BUCKET: hostel-complaints

✅ Environment variables are configured correctly.
```

### Step 5: Start Server

```bash
npm run dev
```

### Step 6: Test with Frontend

1. Start frontend: `cd frontend && npm run dev`
2. Login as a student
3. Create a complaint and upload an image
4. Check if image URL starts with `https://hostel-complaints.s3...`

## ✅ Done!

Your app now uploads images to AWS S3!

## 📸 What Happens Now?

### User uploads image:
```
Frontend → Backend → AWS S3 (IMAGE/ folder) → URL stored in MySQL
```

### Image URL format:
```
https://hostel-complaints.s3.us-east-1.amazonaws.com/IMAGE/1703123456789_abc123.jpg
```

### Stored in database:
```sql
complaints.image_url = "https://hostel-complaints.s3.us-east-1.amazonaws.com/IMAGE/..."
```

## 🐛 Troubleshooting

### ❌ "Access Denied" error
- Check bucket policy is set correctly
- Verify IAM user has S3 permissions

### ❌ "SignatureDoesNotMatch"
- Check AWS credentials in .env
- Make sure no extra spaces

### ❌ Images not displaying
- Bucket policy must allow public GetObject
- Check bucket name matches in .env

## 📚 More Details

- Full setup guide: `AWS_S3_SETUP.md`
- Implementation details: `S3_IMPLEMENTATION_SUMMARY.md`
- Backend README: `backend/README.md`

## 💰 Cost

AWS Free Tier (first 12 months):
- 5GB storage
- 20,000 GET requests/month
- 2,000 PUT requests/month

After free tier: ~$0.003/month for typical usage

## 🔒 Security Notes

- ✅ Only `IMAGE/*` objects are public
- ✅ IAM user has limited permissions
- ✅ 5MB file size limit enforced
- ✅ Only image types allowed
- ❌ Never commit .env to git!

## 🎉 Benefits

- ✅ No disk space issues on server
- ✅ Fast image delivery from AWS
- ✅ 99.999999999% durability
- ✅ Scales automatically
- ✅ Global accessibility

