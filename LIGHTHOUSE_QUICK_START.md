# Lighthouse Integration - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Lighthouse API Key

1. Go to **https://files.lighthouse.storage/**
2. Click "Sign In" or "Get Started"
3. Connect your wallet (MetaMask, etc.)
4. Navigate to **API Keys** section
5. Click **"Generate API Key"**
6. Copy the generated API key

### Step 2: Add to Backend .env

Open `backend/.env` and add:

```env
LIGHTHOUSE_API_KEY=paste_your_api_key_here
```

### Step 3: Restart Backend Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
cd backend
npm run dev
```

That's it! ✅

## 📝 Testing the Integration

1. **Login** to your hostel portal
2. **File a complaint** with some test data
3. **Submit** the form
4. **See the modal** pop up with your Lighthouse CID!
5. **Click "View on IPFS"** to see your data on the blockchain

## ⚡ What You'll See

After submitting a complaint, you'll get a beautiful modal showing:

- ✅ Success message
- ✅ Complaint ID (e.g., #123)
- ✅ **Lighthouse CID** (e.g., QmT5Nv...)
- ✅ Button to **Copy CID**
- ✅ Button to **View on IPFS**

## 🔍 Verifying It Works

### Check Backend Logs
You should see:
```
Uploading to Lighthouse...
Successfully uploaded to Lighthouse. CID: QmT5Nv...
Updated complaint with Lighthouse CID
```

### Check Database
```sql
SELECT complaint_id, title, lighthouse_cid FROM complaints;
```

You should see the CID populated in the `lighthouse_cid` column.

### View on IPFS
Click "View on IPFS" or manually visit:
```
https://gateway.lighthouse.storage/ipfs/YOUR_CID_HERE
```

You'll see your complaint data in JSON format!

## 📦 What Gets Stored on IPFS

```json
{
  "complaint": {
    "complaint_id": 123,
    "category": "Internet/Wi-Fi",
    "title": "Not working",
    "description": "Internet connection issue",
    "room_no": "801",
    "floor": "8th",
    "block": "A",
    "image_url": "https://...",
    "status": "Pending",
    "created_at": "2025-11-11T..."
  },
  "filed_by": {
    "user_id": 3,
    "name": "Student Name",
    "email": "student@example.com",
    "room_no": "801",
    "hostel_block": "A"
  },
  "metadata": {
    "timestamp": "2025-11-11T...",
    "platform": "Hostel Complaint Portal",
    "version": "1.0"
  }
}
```

## 🔧 Troubleshooting

### Problem: "Lighthouse API key not configured"
**Solution**: Add LIGHTHOUSE_API_KEY to backend/.env and restart server

### Problem: Modal doesn't show CID
**Solution**: Check browser console for errors. Verify backend returned lighthouse_cid in response.

### Problem: Upload takes too long
**Solution**: Lighthouse might be slow. The complaint is still saved! CID will be null but complaint exists in DB.

## 🎯 Features

✅ **Immutable Storage**: Data can't be changed once on IPFS
✅ **Decentralized**: Not controlled by any single entity
✅ **Transparent**: Anyone with CID can verify the data
✅ **Permanent**: Data persists on blockchain
✅ **Proof**: CID serves as cryptographic proof of filing

## 💡 Pro Tips

1. **Save the CID**: Keep it for your records - it's your proof!
2. **Share the CID**: Anyone can verify your complaint with it
3. **IPFS Explorer**: Use any IPFS gateway to view data
4. **Backup**: CID is backup of your complaint on blockchain

## 📚 More Information

- Full Documentation: See `LIGHTHOUSE_INTEGRATION.md`
- Lighthouse Docs: https://docs.lighthouse.storage/
- IPFS Info: https://ipfs.io/

## 🎉 You're Done!

Your complaints are now stored on the blockchain! 🚀

