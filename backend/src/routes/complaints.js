import express from 'express';
import multer from 'multer';
import path from 'path';
import dayjs from 'dayjs';
import { authRequired, authorizeRoles } from '../middleware/auth.js';
import { query as db } from '../config/db.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'backend', process.env.UPLOAD_DIR || 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

router.post('/', authRequired, upload.single('image'), async (req, res) => {
  const { category, title, description, room_no, floor, block } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  const userId = req.user.user_id;
  const status = 'Pending';
  const result = await db(
    'INSERT INTO complaints (user_id, category, title, description, room_no, floor, block, image_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
    [userId, category, title, description, room_no || null, floor || null, block || null, image_url, status]
  );
  res.status(201).json({ complaint_id: result.insertId });
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

router.patch('/:id/status', authRequired, authorizeRoles('admin','staff'), async (req, res) => {
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

