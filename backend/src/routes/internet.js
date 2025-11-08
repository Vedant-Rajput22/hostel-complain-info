import express from 'express';
import { authRequired, authorizeRoles } from '../middleware/auth.js';
import { query as db } from '../config/db.js';

const router = express.Router();

router.post('/issues', authRequired, async (req, res) => {
  const { description } = req.body;
  const result = await db('INSERT INTO internet_issues (user_id, description, status, created_at) VALUES (?, ?, "Open", NOW())', [req.user.user_id, description]);
  res.status(201).json({ issue_id: result.insertId });
});

router.get('/issues/mine', authRequired, async (req, res) => {
  const rows = await db('SELECT * FROM internet_issues WHERE user_id = ? ORDER BY created_at DESC', [req.user.user_id]);
  res.json({ issues: rows });
});

router.get('/issues', authRequired, authorizeRoles('admin','staff'), async (req, res) => {
  const rows = await db('SELECT ii.*, u.name as user_name FROM internet_issues ii JOIN users u ON u.user_id = ii.user_id ORDER BY ii.created_at DESC');
  res.json({ issues: rows });
});

router.patch('/issues/:id/status', authRequired, authorizeRoles('admin','staff'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Open | In Progress | Resolved
  await db('UPDATE internet_issues SET status = ? WHERE issue_id = ?', [status, id]);
  res.json({ message: 'Updated' });
});

router.get('/outages', authRequired, async (req, res) => {
  const rows = await db('SELECT * FROM internet_outages WHERE active = 1 ORDER BY created_at DESC');
  res.json({ outages: rows });
});

router.post('/outages', authRequired, authorizeRoles('admin'), async (req, res) => {
  const { message } = req.body;
  await db('INSERT INTO internet_outages (message, active, created_at) VALUES (?, 1, NOW())', [message]);
  res.json({ message: 'Outage posted' });
});

router.patch('/outages/:id/deactivate', authRequired, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  await db('UPDATE internet_outages SET active = 0 WHERE outage_id = ?', [id]);
  res.json({ message: 'Outage deactivated' });
});

export default router;

