import express from 'express';
import { authRequired, authorizeRoles } from '../middleware/auth.js';
import { query as db } from '../config/db.js';

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const rows = await db('SELECT * FROM mess_timetable ORDER BY FIELD(day_of_week, "Mon","Tue","Wed","Thu","Fri","Sat","Sun"), meal_type');
  res.json({ timetable: rows });
});

router.put('/', authRequired, authorizeRoles('admin'), async (req, res) => {
  const { items } = req.body; // array of {day_of_week, meal_type, menu_items}
  const conn = await (await import('../config/db.js')).getConnection();
  try {
    await conn.beginTransaction();
    for (const it of items) {
      await conn.query(
        'INSERT INTO mess_timetable (day_of_week, meal_type, menu_items, updated_by, updated_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE menu_items = VALUES(menu_items), updated_by = VALUES(updated_by), updated_at = NOW()',
        [it.day_of_week, it.meal_type, it.menu_items, req.user.user_id]
      );
    }
    await conn.commit();
    res.json({ message: 'Updated mess timetable' });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

router.post('/feedback', authRequired, async (req, res) => {
  const { day_of_week, meal_type, rating, comment } = req.body;
  await db('INSERT INTO mess_feedback (user_id, day_of_week, meal_type, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [req.user.user_id, day_of_week, meal_type, rating || null, comment || null]);
  res.json({ message: 'Feedback submitted' });
});

export default router;

