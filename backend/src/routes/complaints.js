import express from 'express';
import multer from 'multer';
import path from 'path';
import dayjs from 'dayjs';
import { authRequired, authorizeRoles } from '../middleware/auth.js';
import { query as db } from '../config/db.js';
import { uploadImageToS3 } from '../utils/s3Upload.js';
import { uploadToLighthouse } from '../utils/lighthouseUpload.js';

const router = express.Router();

// Use memory storage for multer - files will be in req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});
router.post('/', authRequired, upload.single('image'), async (req, res) => {
  console.log('POST / - Starting complaint creation');
  try {
    const { category, title, description, room_no, floor, block } = req.body;
    console.log('Extracted body fields:', { category, title, description, room_no, floor, block });
    const userId = req.user.user_id;
    console.log('User ID:', userId);
    const status = 'Pending';
    console.log('Status set to:', status);

    // Upload image to S3 if file exists
    let image_url = null;
    console.log('Initialized image_url to null');
    if (req.file) {
      console.log('File detected, uploading to S3:', req.file.originalname);
      image_url = await uploadImageToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      console.log('Image uploaded to S3, URL:', image_url);
    }

    // Insert complaint into database first
    const result = await db(
      'INSERT INTO complaints (user_id, category, title, description, room_no, floor, block, image_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [userId, category, title, description, room_no || null, floor || null, block || null, image_url, status]
    );
    console.log('Database insert result:', result);

    const complaintId = result.insertId;

    // Get user details for Lighthouse upload
    const [userDetails] = await db('SELECT user_id, name, email, room_no, hostel_block FROM users WHERE user_id = ?', [userId]);
    console.log('User details retrieved:', userDetails);

    // Upload to Lighthouse with complaint and user data
    let lighthouse_cid = null;
    try {
      const complaintData = {
        complaint_id: complaintId,
        category,
        title,
        description,
        room_no: room_no || null,
        floor: floor || null,
        block: block || null,
        image_url,
        status,
        created_at: new Date().toISOString(),
      };

      console.log('Uploading to Lighthouse...');
      lighthouse_cid = await uploadToLighthouse(complaintData, userDetails);
      console.log('Lighthouse upload successful. CID:', lighthouse_cid);

      // Update the complaint with the Lighthouse CID
      await db('UPDATE complaints SET lighthouse_cid = ? WHERE complaint_id = ?', [lighthouse_cid, complaintId]);
      console.log('Updated complaint with Lighthouse CID');
    } catch (lighthouseError) {
      console.error('Lighthouse upload failed, but complaint was created:', lighthouseError);
      // Don't fail the entire request if Lighthouse fails - complaint is already created
    }

    res.status(201).json({
      complaint_id: complaintId,
      image_url,
      lighthouse_cid
    });
    console.log('Response sent with complaint_id:', complaintId, 'and CID:', lighthouse_cid);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: error.message || 'Failed to create complaint' });
    console.log('Error response sent');
  }
});

router.get('/mine', authRequired, async (req, res) => {
  const rows = await db('SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC', [req.user.user_id]);
  res.json({ complaints: rows });
});

router.get('/all', authRequired, async (req, res) => {
  const { status, category, q, from, to } = req.query;
  const filters = [];
  const params = [];
  if (status) { filters.push('status = ?'); params.push(status); }
  if (category) { filters.push('category = ?'); params.push(category); }
  if (q) { filters.push('(title LIKE ? OR description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
  if (from) { filters.push('created_at >= ?'); params.push(from); }
  if (to) { filters.push('created_at <= ?'); params.push(to); }
  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
  const rows = await db(`SELECT c.*, u.name as user_name, u.room_no as user_room FROM complaints c JOIN users u ON u.user_id = c.user_id ${where} ORDER BY c.created_at DESC`, params);
  res.json({ complaints: rows });
});

router.get('/resolved/recent', authRequired, async (req, res) => {
  const rows = await db('SELECT c.*, u.name as user_name FROM complaints c JOIN users u ON u.user_id = c.user_id WHERE c.status = "Resolved" ORDER BY c.resolved_at DESC LIMIT 20');
  res.json({ complaints: rows });
});

router.patch('/:id/assign', authRequired, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body; // should be staff user_id
  await db('UPDATE complaints SET assigned_to = ?, status = "In Progress" WHERE complaint_id = ?', [assigned_to || null, id]);
  res.json({ message: 'Assigned' });
});

router.patch('/:id/status', authRequired, authorizeRoles('admin', 'staff'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Pending | In Progress | Resolved
  const resolvedAt = status === 'Resolved' ? ', resolved_at = NOW()' : '';
  await db(`UPDATE complaints SET status = ? ${resolvedAt} WHERE complaint_id = ?`, [status, id]);
  res.json({ message: 'Updated' });
});

router.patch('/:id/rating', authRequired, async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body; // 1..5
  // only owner can rate
  const rows = await db('SELECT user_id FROM complaints WHERE complaint_id = ?', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  if (rows[0].user_id !== req.user.user_id) return res.status(403).json({ error: 'Forbidden' });
  await db('UPDATE complaints SET rating = ? WHERE complaint_id = ?', [rating, id]);
  res.json({ message: 'Rated' });
});

export default router;

