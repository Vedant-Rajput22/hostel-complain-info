import express from 'express';
import { authRequired, authorizeRoles } from '../middleware/auth.js';
import { query as db } from '../config/db.js';

const router = express.Router();

router.get('/student', authRequired, async (req, res) => {
  const uid = req.user.user_id;
  const counts = (await db(
    'SELECT \
          SUM(status = "Pending") as pending,\
          SUM(status = "In Progress") as in_progress,\
          SUM(status = "Resolved") as resolved\
        FROM complaints WHERE user_id = ?',
    [uid]
  ))[0] || { pending: 0, in_progress: 0, resolved: 0 };
  const recent = await db('SELECT complaint_id, title, status, created_at FROM complaints WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [uid]);
  res.json({ counts, recent });
});

router.get('/admin', authRequired, authorizeRoles('admin'), async (req, res) => {
  const totals = (await db('SELECT COUNT(*) as total, SUM(status = "Resolved") as resolved FROM complaints'))[0] || { total: 0, resolved: 0 };
  const byCategory = await db('SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC');
  const avgResolution = (await db('SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_hours FROM complaints WHERE status = "Resolved"'))[0];
  res.json({ totals, byCategory, avgResolution: avgResolution?.avg_hours || 0 });
});

export default router;
