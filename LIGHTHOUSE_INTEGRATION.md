# Lighthouse Integration Guide

## Overview

This application now integrates with Lighthouse for decentralized storage of complaint data on IPFS. When a user files a complaint, the complaint details along with user information are uploaded to Lighthouse and a Content Identifier (CID) is returned and stored in the database.

## Features

✅ **Automatic Upload**: Complaint data is automatically uploaded to Lighthouse IPFS when created
✅ **User Information**: Stores both complaint and user details on IPFS for transparency
✅ **CID Storage**: Lighthouse CID is stored in the database for future reference
✅ **Frontend Display**: Beautiful modal shows the CID to users after submission
✅ **IPFS Gateway Access**: Users can view their data on IPFS via gateway URL
✅ **Copy CID**: One-click copy functionality for the CID
✅ **Graceful Fallback**: If Lighthouse is unavailable, complaint is still saved to database

## Setup Instructions

### 1. Get Lighthouse API Key

1. Visit [https://files.lighthouse.storage/](https://files.lighthouse.storage/)
2. Sign up or login with your wallet
3. Go to API Keys section
4. Generate a new API key

### 2. Configure Backend

Add the following to your `.env` file in the backend directory:

```env
# Lighthouse Configuration
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
```

### 3. Database Migration

The database schema has been updated to include a `lighthouse_cid` column. If you're setting up fresh, just run the schema. If updating existing database, run:

```bash
cd backend
node scripts/add-lighthouse-cid-column.js
```

## How It Works

### Backend Flow

1. **User submits complaint** → Form data sent to `/api/complaints` endpoint
2. **Image upload** → If image exists, uploaded to S3 first
3. **Database insert** → Complaint saved to MySQL database
4. **User details fetch** → User information retrieved from database
5. **Lighthouse upload** → Combined complaint + user data uploaded to Lighthouse IPFS
6. **CID storage** → Returned CID stored in database
7. **Response** → CID sent back to frontend along with complaint ID

### Frontend Flow

1. **Form submission** → User fills out complaint form
2. **API call** → Data sent to backend
3. **Success response** → Receives complaint_id, image_url, and lighthouse_cid
4. **Modal display** → CIDModal automatically opens showing:
   - Success message
   - Complaint ID
   - Lighthouse CID
   - Copy CID button
   - View on IPFS button
5. **User actions** → User can copy CID or view data on IPFS gateway

## Data Structure on IPFS

The data uploaded to Lighthouse follows this structure:

```json
{
  "complaint": {
    "complaint_id": 123,
    "category": "Internet/Wi-Fi",
    "title": "Connection Issue",
    "description": "Internet not working",
    "room_no": "801",
    "floor": "8th",
    "block": "A",
    "image_url": "https://s3.amazonaws.com/...",
    "status": "Pending",
    "created_at": "2025-11-11T11:28:43.000Z"
  },
  "filed_by": {
    "user_id": 3,
    "name": "John Doe",
    "email": "john@example.com",
    "room_no": "801",
    "hostel_block": "A"
  },
  "metadata": {
    "timestamp": "2025-11-11T11:28:43.123Z",
    "platform": "Hostel Complaint Portal",
    "version": "1.0"
  }
}
```

## Files Modified/Created

### Backend
- ✅ `backend/package.json` - Added @lighthouse-web3/sdk dependency
- ✅ `backend/sql/schema.sql` - Added lighthouse_cid column
- ✅ `backend/src/config/lighthouse.js` - Lighthouse configuration
- ✅ `backend/src/utils/lighthouseUpload.js` - Upload utility functions
- ✅ `backend/src/routes/complaints.js` - Modified to upload to Lighthouse
- ✅ `backend/scripts/add-lighthouse-cid-column.js` - Migration script

### Frontend
- ✅ `frontend/src/components/CIDModal.jsx` - New modal component
- ✅ `frontend/src/components/ComplaintForm.jsx` - Modified to show CID modal

## API Response Changes

The `/api/complaints` POST endpoint now returns:

```json
{
  "complaint_id": 123,
  "image_url": "https://s3.amazonaws.com/...",
  "lighthouse_cid": "Qm...hash..." // NEW FIELD
}
```

## Accessing Data on IPFS

Users can access their complaint data using:

**Gateway URL**: `https://gateway.lighthouse.storage/ipfs/{CID}`

Example: `https://gateway.lighthouse.storage/ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX`

## Error Handling

- If Lighthouse upload fails, the complaint is still saved to the database
- Users are notified if Lighthouse storage is unavailable
- Lighthouse errors are logged but don't block complaint creation
- Graceful degradation ensures system reliability

## Benefits of Lighthouse Integration

1. **Immutability**: Once uploaded, data cannot be altered
2. **Transparency**: Public record of complaints on blockchain
3. **Decentralization**: Data stored on IPFS, not centralized servers
4. **Proof of Filing**: CID serves as cryptographic proof
5. **Permanence**: Data persists even if main database fails
6. **Auditability**: Anyone can verify complaint data using CID

## Troubleshooting

### "Lighthouse API key not configured" error
- Ensure LIGHTHOUSE_API_KEY is set in backend/.env
- Restart the backend server after adding the key

### CID not showing in modal
- Check browser console for errors
- Verify backend is returning lighthouse_cid in response
- Check if Lighthouse service is operational

### Upload timing out
- Lighthouse might be experiencing high load
- The complaint is still saved to database
- CID can be generated manually later if needed

## Future Enhancements

- 🔄 Add ability to retrieve and verify data from IPFS using CID
- 🔄 Display CID on complaint details page
- 🔄 Admin panel to view all CIDs
- 🔄 Bulk IPFS upload for existing complaints
- 🔄 IPFS pinning service integration for redundancy

## Support

For issues with Lighthouse:
- Lighthouse Docs: https://docs.lighthouse.storage/
- Lighthouse Discord: https://discord.gg/lighthouse

For issues with the integration:
- Check backend logs for detailed error messages
- Verify API key is valid
- Ensure network connectivity to Lighthouse servers

