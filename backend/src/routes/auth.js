import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, body } from 'express-validator';
import dayjs from 'dayjs';
import { query as dbQuery } from '../config/db.js';
import { emailDomainValidator, passwordValidator, handleValidation } from '../utils/validators.js';
import '../setupEnv.js';

const router = express.Router();
const COLLEGE_DOMAIN = 'iiitn.ac.in';

router.post(
  '/register',
  [
    emailDomainValidator(COLLEGE_DOMAIN),
    body('name').isLength({ min: 2 }).withMessage('Name is required'),
    passwordValidator,
    body('hostel_block').optional().isString(),
    body('room_no').optional().isString()
  ],
  async (req, res) => {
    const errors = [];
    const { name, email, password, hostel_block, room_no } = req.body;
    if (!email.toLowerCase().endsWith(`@${COLLEGE_DOMAIN}`)) {
      return res.status(400).json({ error: `Use your college email (@${COLLEGE_DOMAIN})` });
    }
    const existing = await dbQuery('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length) return res.status(400).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const role = 'student';
    const result = await dbQuery(
      'INSERT INTO users (name, email, password_hash, role, hostel_block, room_no, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [name, email.toLowerCase(), hash, role, hostel_block || null, room_no || null, 0]
    );
    const userId = result.insertId;
    const token = generateEmailToken({ user_id: userId, email });
    await dbQuery('INSERT INTO email_verifications (user_id, token, expires_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY), NOW())', [userId, token]);
    const verifyUrl = `/api/auth/verify?token=${token}`;
    return res.status(201).json({ message: 'Registered. Verify email to login.', verify_url: verifyUrl });
  }
);

router.get('/verify', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  const rows = await dbQuery('SELECT ev.user_id, u.verified FROM email_verifications ev JOIN users u ON u.user_id = ev.user_id WHERE ev.token = ? AND ev.expires_at > NOW()', [token]);
  if (!rows.length) return res.status(400).json({ error: 'Invalid or expired token' });
  const { user_id, verified } = rows[0];
  if (verified) return res.json({ message: 'Already verified' });
  await dbQuery('UPDATE users SET verified = 1 WHERE user_id = ?', [user_id]);
  await dbQuery('DELETE FROM email_verifications WHERE token = ?', [token]);
  res.json({ message: 'Email verified successfully' });
});

router.post('/login', [body('email').isEmail(), body('password').isString()], async (req, res) => {
  const { email, password } = req.body;
  const rows = await dbQuery('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!rows.length) return res.status(400).json({ error: 'Invalid credentials' });
  const user = rows[0];
  if (!user.verified) return res.status(403).json({ error: 'Verify your email before login' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ user_id: user.user_id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ token, user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role } });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', async (req, res) => {
  try {
    const header = req.headers['authorization'];
    const cookieToken = req.cookies?.token;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : cookieToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const rows = await dbQuery('SELECT user_id, name, email, role, hostel_block, room_no, created_at FROM users WHERE user_id = ?', [decoded.user_id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

function generateEmailToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
}

export default router;

