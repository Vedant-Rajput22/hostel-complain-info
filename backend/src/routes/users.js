import express from 'express';
import { authRequired, authorizeRoles } from '../middleware/auth.js';
import { query as db } from '../config/db.js';

const router = express.Router();

router.get('/', authRequired, authorizeRoles('admin'), async (req, res) => {
  const users = await db('SELECT user_id, name, email, role, hostel_block, room_no, created_at FROM users ORDER BY created_at DESC');
  res.json({ users });
});

router.patch('/:id/role', authRequired, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // student|admin|staff
  if (!['student','admin','staff'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  await db('UPDATE users SET role = ? WHERE user_id = ?', [role, id]);
  res.json({ message: 'Role updated' });
});

export default router;

