# AWS S3 Image Upload Flow Diagram

## Complete Upload Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                                │
└─────────────────────────────────────────────────────────────────────────┘

    Student Dashboard
         │
         ├─> Selects image file
         │   (ComplaintForm.jsx)
         │
         ├─> Client-side validation:
         │   • File size ≤ 5MB
         │   • File type: image/*
         │
         ├─> Creates preview
         │   (FileReader API)
         │
         └─> Submits form


┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Axios)                            │
└─────────────────────────────────────────────────────────────────────────┘

    ComplaintForm.jsx - submit()
         │
         ├─> Creates FormData:
         │   • category: "Mess"
         │   • title: "..."
         │   • description: "..."
         │   • room_no: "101"
         │   • floor: "1"
         │   • block: "A"
         │   • image: [File object]
         │
         └─> POST /api/complaints
             Content-Type: multipart/form-data
             Authorization: Bearer {JWT}


┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express + Multer)                            │
└─────────────────────────────────────────────────────────────────────────┘

    server.js
         │
         ├─> CORS validation
         ├─> Rate limiting check
         ├─> JWT authentication (authRequired)
         │
         └─> Routes to: /api/complaints


    complaints.js - POST /
         │
         ├─> Multer middleware:
         │   • memoryStorage()
         │   • File size limit: 5MB
         │   • File type filter: image/*
         │   • Loads file into: req.file.buffer
         │
         ├─> Extract form data:
         │   const { category, title, ... } = req.body
         │   const userId = req.user.user_id
         │
         ├─> IF req.file exists:
         │   │
         │   └─> Call uploadImageToS3()
         │
         └─> Continue to S3 upload...


┌─────────────────────────────────────────────────────────────────────────┐
│                        AWS S3 UPLOAD UTILITY                             │
└─────────────────────────────────────────────────────────────────────────┘

    s3Upload.js - uploadImageToS3()
         │
         ├─> Generate unique filename:
         │   timestamp = Date.now()           → 1703123456789
         │   randomHash = crypto.random(8)    → abcd1234ef567890
         │   ext = path.extname(file)         → .jpg
         │   filename = "1703123456789_abcd1234ef567890.jpg"
         │
         ├─> Construct S3 key:
         │   s3Key = "IMAGE/1703123456789_abcd1234ef567890.jpg"
         │
         ├─> Create upload parameters:
         │   • Bucket: hostel-complaints
         │   • Key: IMAGE/1703123456789_abcd1234ef567890.jpg
         │   • Body: req.file.buffer
         │   • ContentType: image/jpeg
         │   • ACL: public-read
         │
         └─> Upload to S3...


┌─────────────────────────────────────────────────────────────────────────┐
│                           AWS S3 SERVICE                                 │
└─────────────────────────────────────────────────────────────────────────┘

    S3 Client (AWS SDK v3)
         │
         ├─> Authenticate with:
         │   • AWS_ACCESS_KEY_ID
         │   • AWS_SECRET_ACCESS_KEY
         │   • AWS_REGION
         │
         ├─> Upload to bucket:
         │   s3://hostel-complaints/IMAGE/1703123456789_abcd1234ef567890.jpg
         │
         ├─> Set permissions:
         │   ACL: public-read
         │
         ├─> Apply bucket policy:
         │   Allow GetObject for IMAGE/*
         │
         └─> Return success ✅


┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND - DATABASE INSERT                           │
└─────────────────────────────────────────────────────────────────────────┘

    complaints.js (continued)
         │
         ├─> Construct S3 URL:
         │   image_url = "https://hostel-complaints.s3.us-east-1.amazonaws.com/IMAGE/1703123456789_abcd1234ef567890.jpg"
         │
         ├─> Insert to MySQL:
         │   INSERT INTO complaints (
         │     user_id,        → 123
         │     category,       → "Mess"
         │     title,          → "Food quality issue"
         │     description,    → "..."
         │     room_no,        → "101"
         │     floor,          → "1"
         │     block,          → "A"
         │     image_url,      → "https://hostel-complaints.s3..."
         │     status,         → "Pending"
         │     created_at      → NOW()
         │   )
         │
         ├─> Get inserted ID:
         │   complaint_id = result.insertId
         │
         └─> Send response:
             {
               "complaint_id": 456,
               "image_url": "https://hostel-complaints.s3..."
             }


┌─────────────────────────────────────────────────────────────────────────┐
│                       FRONTEND - SUCCESS HANDLING                        │
└─────────────────────────────────────────────────────────────────────────┘

    ComplaintForm.jsx
         │
         ├─> Receive response:
         │   { complaint_id, image_url }
         │
         ├─> Show success toast:
         │   "Complaint submitted successfully!"
         │
         ├─> Reset form
         │
         └─> Trigger data refresh:
             onCreated() → fetchData()


┌─────────────────────────────────────────────────────────────────────────┐
│                        IMAGE ACCESS & DISPLAY                            │
└─────────────────────────────────────────────────────────────────────────┘

    Admin Dashboard (ComplaintsAdmin.jsx)
         │
         ├─> Fetch complaints from API:
         │   GET /api/complaints/all
         │
         ├─> Database returns:
         │   [{
         │     complaint_id: 456,
         │     title: "...",
         │     image_url: "https://hostel-complaints.s3..."
         │   }]
         │
         └─> Render table row:
             <a href={c.image_url} target="_blank">
               Image
             </a>


    User clicks "Image" link
         │
         ├─> Browser requests:
         │   GET https://hostel-complaints.s3.us-east-1.amazonaws.com/IMAGE/1703123456789_abcd1234ef567890.jpg
         │
         ├─> S3 checks bucket policy:
         │   ✅ GetObject allowed for IMAGE/*
         │
         ├─> S3 returns image
         │
         └─> Browser displays image 🖼️


═══════════════════════════════════════════════════════════════════════════
                              DATA FLOW SUMMARY
═══════════════════════════════════════════════════════════════════════════

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │────>│ Backend  │────>│  AWS S3  │────>│  MySQL   │
│  React   │     │ Express  │     │  Bucket  │     │ Database │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                  │                │
     │                │                  │                │
  [Image]        [Buffer]           [Storage]         [URL]
   File          Memory             IMAGE/...      image_url


═══════════════════════════════════════════════════════════════════════════
                           SECURITY LAYERS
═══════════════════════════════════════════════════════════════════════════

Layer 1 - Client Side (ComplaintForm.jsx):
   ├─> File size validation (≤ 5MB)
   ├─> File type validation (image/*)
   └─> Preview generation

Layer 2 - API Layer (server.js):
   ├─> CORS validation
   ├─> Rate limiting (100 req/15min)
   ├─> JWT authentication
   └─> Auth limiter (5 attempts/15min)

Layer 3 - Upload Middleware (complaints.js):
   ├─> Multer file filter (image/* only)
   ├─> File size limit (5MB)
   └─> Memory storage (no disk writes)

Layer 4 - AWS S3:
   ├─> IAM authentication
   ├─> Bucket policy (IMAGE/* public only)
   ├─> CORS configuration
   └─> Encryption at rest


═══════════════════════════════════════════════════════════════════════════
                           FILE LOCATIONS
═══════════════════════════════════════════════════════════════════════════

Local (Old - Deprecated):
   /backend/uploads/1703123456789_image.jpg
   URL: http://localhost:4000/uploads/1703123456789_image.jpg
   Storage: Local disk
   Access: Via Express static middleware

AWS S3 (New - Active):
   s3://hostel-complaints/IMAGE/1703123456789_abcd1234ef567890.jpg
   URL: https://hostel-complaints.s3.us-east-1.amazonaws.com/IMAGE/1703123456789_abcd1234ef567890.jpg
   Storage: AWS S3 cloud
   Access: Direct public HTTPS


═══════════════════════════════════════════════════════════════════════════
                         ENVIRONMENT VARIABLES
═══════════════════════════════════════════════════════════════════════════

Required in /backend/.env:

   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCY...
   AWS_S3_BUCKET=hostel-complaints


═══════════════════════════════════════════════════════════════════════════
                           ERROR HANDLING
═══════════════════════════════════════════════════════════════════════════

Frontend:
   ├─> File too large → Toast error: "Image size must be less than 5MB"
   ├─> Invalid file type → Toast error: "Please select a valid image file"
   └─> Upload failed → Toast error: "Failed to file complaint"

Backend:
   ├─> No file → Continue (image_url = null)
   ├─> S3 upload fails → 500 error: "Failed to upload image to S3"
   ├─> DB insert fails → 500 error: "Failed to create complaint"
   └─> Invalid auth → 401 error: "Unauthorized"

AWS S3:
   ├─> Access Denied → Check bucket policy & IAM
   ├─> SignatureDoesNotMatch → Check credentials
   └─> Invalid Region → Check AWS_REGION


═══════════════════════════════════════════════════════════════════════════
                              TESTING FLOW
═══════════════════════════════════════════════════════════════════════════

1. Environment Check:
   npm run test:s3
   └─> Validates AWS credentials

2. Upload Test:
   npm run test:s3 image.jpg
   └─> Uploads test image to S3

3. API Test:
   curl -X POST ... -F "image=@test.jpg"
   └─> Tests full complaint creation

4. Frontend Test:
   Login → Create complaint → Upload image
   └─> Tests end-to-end flow

5. Verification:
   Check S3 bucket → Check MySQL → Check admin dashboard
   └─> Confirms complete flow

