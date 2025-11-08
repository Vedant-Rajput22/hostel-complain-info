import express from 'express';
import { authRequired, authorizeRoles } from '../middleware/auth.js';
import { query as db } from '../config/db.js';

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  const { action, reason } = req.body; // entry|exit
  if (!['entry', 'exit'].includes(action)) return res.status(400).json({ error: 'Invalid action' });
  await db('INSERT INTO entry_exit_log (user_id, action, reason, timestamp) VALUES (?, ?, ?, NOW())', [req.user.user_id, action, reason || null]);
  res.json({ message: 'Logged' });
});

router.get('/', authRequired, async (req, res) => {
  const { user_id, from, to } = req.query;
  const isAdmin = ['admin', 'staff'].includes(req.user.role);
  const filters = [];
  const params = [];
  if (user_id && isAdmin) { filters.push('l.user_id = ?'); params.push(user_id); }
  if (from) { filters.push('l.timestamp >= ?'); params.push(from); }
  if (to) { filters.push('l.timestamp <= ?'); params.push(to); }
  if (!isAdmin) { filters.push('l.user_id = ?'); params.push(req.user.user_id); }
  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
  const rows = await db(`SELECT l.*, u.name as user_name, u.room_no FROM entry_exit_log l JOIN users u ON u.user_id = l.user_id ${where} ORDER BY l.timestamp DESC`, params);
  res.json({ logs: rows });
});

router.get('/export', authRequired, authorizeRoles('admin'), async (req, res) => {
  const rows = await db('SELECT l.log_id, u.name, u.email, l.action, l.reason, l.timestamp FROM entry_exit_log l JOIN users u ON u.user_id = l.user_id ORDER BY l.timestamp DESC');
  const header = 'log_id,name,email,action,reason,timestamp\n';
  const csv = header + rows.map(r => `${r.log_id},${q(r.name)},${q(r.email)},${r.action},${q(r.reason)},${r.timestamp.toISOString()}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="entry_exit_logs.csv"');
  res.send(csv);
});

function q(v) { return (v || '').toString().replace(/"/g, '""'); }

export default router;

