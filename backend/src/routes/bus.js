import express from 'express';
import { authRequired, authorizeRoles } from '../middleware/auth.js';
import { query as db } from '../config/db.js';

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const rows = await db('SELECT * FROM bus_timetable ORDER BY route_name, start_time');
  res.json({ timetable: rows });
});

router.put('/', authRequired, authorizeRoles('admin'), async (req, res) => {
  const { entries } = req.body; // array of {route_name,start_time,end_time,stops}
  const conn = await (await import('../config/db.js')).getConnection();
  try {
    await conn.beginTransaction();
    for (const e of entries) {
      await conn.query(
        'INSERT INTO bus_timetable (route_name, start_time, end_time, stops, updated_at) VALUES (?, ?, ?, ?, NOW())',
        [e.route_name, e.start_time, e.end_time, JSON.stringify(e.stops || [])]
      );
    }
    await conn.commit();
    res.json({ message: 'Updated bus timetable' });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export default router;

