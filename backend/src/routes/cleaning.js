import express from 'express';
import { authRequired, authorizeRoles } from '../middleware/auth.js';
import { query as db } from '../config/db.js';

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  const { room_no, description } = req.body;
  const result = await db('INSERT INTO cleaning_requests (user_id, room_no, description, status, created_at) VALUES (?, ?, ?, "Pending", NOW())', [req.user.user_id, room_no, description]);
  res.status(201).json({ request_id: result.insertId });
});

router.get('/mine', authRequired, async (req, res) => {
  const rows = await db('SELECT * FROM cleaning_requests WHERE user_id = ? ORDER BY created_at DESC', [req.user.user_id]);
  res.json({ requests: rows });
});

router.get('/all', authRequired, authorizeRoles('admin','staff'), async (req, res) => {
  const rows = await db('SELECT cr.*, u.name as user_name FROM cleaning_requests cr JOIN users u ON u.user_id = cr.user_id ORDER BY cr.created_at DESC');
  res.json({ requests: rows });
});

router.patch('/:id/assign', authRequired, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body; // staff id
  await db('UPDATE cleaning_requests SET assigned_to = ?, status = "In Progress" WHERE request_id = ?', [assigned_to || null, id]);
  res.json({ message: 'Assigned' });
});

router.patch('/:id/complete', authRequired, authorizeRoles('admin','staff'), async (req, res) => {
  const { id } = req.params;
  await db('UPDATE cleaning_requests SET status = "Completed", completed_at = NOW() WHERE request_id = ?', [id]);
  res.json({ message: 'Completed' });
});

export default router;

