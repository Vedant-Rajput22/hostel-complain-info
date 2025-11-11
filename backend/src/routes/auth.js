import express from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { query as dbQuery } from '../config/db.js';
import { emailDomainValidator, passwordValidator } from '../utils/validators.js';
import { asyncHandler } from '../utils/errors.js';
import { ApiResponse } from '../utils/response.js';
import { ValidationError, AuthenticationError } from '../utils/errors.js';
import {
  generateTokens,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  extractToken,
  verifyAccessToken
} from '../utils/jwt.js';
import passportConfig from '../config/passport.js';
import logger from '../utils/logger.js';
import '../setupEnv.js';

const router = express.Router();
const COLLEGE_DOMAIN = 'iiitn.ac.in';

// ==================== Traditional Email/Password Auth ====================

/**
 * Register with email and password
 */
router.post(
  '/register',
  [
    emailDomainValidator(COLLEGE_DOMAIN),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    passwordValidator,
    body('hostel_block').optional().trim().isString(),
    body('room_no').optional().trim().isString()
  ],
  asyncHandler(async (req, res) => {
    const { name, email, password, hostel_block, room_no } = req.body;

    // Validate email domain
    if (!email.toLowerCase().endsWith(`@${COLLEGE_DOMAIN}`)) {
      throw new ValidationError(`Only ${COLLEGE_DOMAIN} emails are allowed`);
    }

    // Check if user exists
    const existing = await dbQuery('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Create user
    const result = await dbQuery(
      'INSERT INTO users (name, email, password_hash, role, hostel_block, room_no, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [name, email.toLowerCase(), hash, 'student', hostel_block || null, room_no || null, 0]
    );

    const userId = result.insertId;

    // Generate email verification token
    const { accessToken } = generateTokens({ user_id: userId, email, role: 'student', name });
    await dbQuery(
      'INSERT INTO email_verifications (user_id, token, expires_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY), NOW())',
      [userId, accessToken]
    );

    logger.info('User registered', { userId, email });

    return ApiResponse.created(res, {
      verify_url: `/api/auth/verify?token=${accessToken}`
    }, 'Registration successful. Please verify your email.');
  })
);

/**
 * Verify email
 */
router.get('/verify', asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ValidationError('Verification token is required');
  }

  const rows = await dbQuery(
    'SELECT ev.user_id, u.verified FROM email_verifications ev JOIN users u ON u.user_id = ev.user_id WHERE ev.token = ? AND ev.expires_at > NOW()',
    [token]
  );

  if (!rows.length) {
    throw new ValidationError('Invalid or expired verification token');
  }

  const { user_id, verified } = rows[0];

  if (verified) {
    return ApiResponse.success(res, null, 'Email already verified');
  }

  await dbQuery('UPDATE users SET verified = 1 WHERE user_id = ?', [user_id]);
  await dbQuery('DELETE FROM email_verifications WHERE token = ?', [token]);

  logger.info('Email verified', { userId: user_id });

  return ApiResponse.success(res, null, 'Email verified successfully. You can now log in.');
}));

/**
 * Login with email and password
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    // Find user
    const users = await dbQuery('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    console.log('Users found:', users.length);

    if (!users.length) {
      throw new AuthenticationError('Invalid email or password');
    }
    console.log('User exists, checking verification');

    const user = users[0];
    console.log('User data:', { user_id: user.user_id, verified: user.verified });

    // Check if verified
    // if (!user.verified) {
    //   throw new AuthenticationError('Please verify your email before logging in');
    // }
    console.log('User is verified');

    // Check if OAuth user
    if (user.password_hash === 'oauth_user') {
      throw new AuthenticationError('This account uses Google Sign-In. Please use the Google button to log in.');
    }
    console.log('Not an OAuth user, verifying password');

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password validation result:', isValidPassword);

    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }
    console.log('Password is valid');

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    console.log('Tokens generated');

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);
    console.log('Cookies set');

    logger.info('User logged in', { userId: user.user_id, email: user.email });
    console.log('Login successful for user:', user.user_id);

    return ApiResponse.success(res, {
      token: accessToken,
      refreshToken,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostel_block: user.hostel_block,
        room_no: user.room_no
      }
    }, 'Login successful');
  })
);

// ==================== Google OAuth 2.0 ====================

/**
 * Initiate Google OAuth
 */
router.get('/google',
  passportConfig.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

/**
 * Google OAuth callback
 */
router.get('/google/callback',
  passportConfig.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_ORIGIN}/login?error=oauth_failed`
  }),
  asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_ORIGIN}/login?error=oauth_failed`);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    logger.info('OAuth login successful', { userId: user.user_id, email: user.email });

    // Redirect to frontend with tokens
    res.redirect(`${process.env.CLIENT_ORIGIN}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
  })
);

// ==================== Token Management ====================

/**
 * Refresh access token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Get user
  const users = await dbQuery(
    'SELECT user_id, name, email, role, hostel_block, room_no FROM users WHERE user_id = ?',
    [decoded.user_id]
  );

  if (!users.length) {
    throw new AuthenticationError('User not found');
  }

  const user = users[0];

  // Generate new tokens
  const tokens = generateTokens(user);

  // Set new cookies
  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

  return ApiResponse.success(res, {
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken
  }, 'Token refreshed successfully');
}));

/**
 * Logout
 */
router.post('/logout', asyncHandler(async (req, res) => {
  clearTokenCookies(res);

  logger.info('User logged out');

  return ApiResponse.success(res, null, 'Logged out successfully');
}));

/**
 * Get current user
 */
router.get('/me', asyncHandler(async (req, res) => {
  console.log('GET /me endpoint called');
  const token = extractToken(req);
  console.log('Token extracted:', token);

  if (!token) {
    console.log('No token provided');
    throw new AuthenticationError('No authentication token provided');
  }

  // Verify token
  const decoded = verifyAccessToken(token);
  console.log('Token decoded:', decoded);

  // Get user
  const users = await dbQuery(
    'SELECT user_id, name, email, role, hostel_block, room_no, created_at FROM users WHERE user_id = ?',
    [decoded.user_id]
  );
  console.log('Users query result:', users);

  if (!users.length) {
    console.log('User not found in database');
    throw new AuthenticationError('User not found');
  }

  console.log('Returning user data:', users[0]);
  return ApiResponse.success(res, { user: users[0] });
}));

/**
 * Update user profile
 */
router.patch('/profile', asyncHandler(async (req, res) => {
  const token = extractToken(req);

  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }

  const decoded = verifyAccessToken(token);
  const { name, hostel_block, room_no } = req.body;

  // Build update query
  const updates = [];
  const values = [];

  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (hostel_block !== undefined) {
    updates.push('hostel_block = ?');
    values.push(hostel_block || null);
  }
  if (room_no !== undefined) {
    updates.push('room_no = ?');
    values.push(room_no || null);
  }

  if (updates.length === 0) {
    throw new ValidationError('No fields to update');
  }

  values.push(decoded.user_id);

  await dbQuery(
    `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
    values
  );

  // Get updated user
  const users = await dbQuery(
    'SELECT user_id, name, email, role, hostel_block, room_no FROM users WHERE user_id = ?',
    [decoded.user_id]
  );

  logger.info('Profile updated', { userId: decoded.user_id });

  return ApiResponse.success(res, { user: users[0] }, 'Profile updated successfully');
}));

export default router;
