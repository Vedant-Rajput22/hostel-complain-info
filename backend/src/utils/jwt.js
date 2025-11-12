import jwt from 'jsonwebtoken';
import { AuthenticationError } from './errors.js';
import '../setupEnv.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate access token
 */
export function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokens(user) {
    const payload = {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        name: user.name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ user_id: user.user_id });

    return { accessToken, refreshToken };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AuthenticationError('Access token expired');
        }
        throw new AuthenticationError('Invalid access token');
    }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AuthenticationError('Refresh token expired');
        }
        throw new AuthenticationError('Invalid refresh token');
    }
}

/**
 * Extract token from request
 */
export function extractToken(req) {
    // Check Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    // Check cookies
    if (req.cookies?.token) {
        return req.cookies.token;
    }

    return null;
}

/**
 * Set token cookies
 */
export function setTokenCookies(res, accessToken, refreshToken) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Access token cookie (7 days)
    res.cookie('token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Refresh token cookie (30 days)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
}

/**
 * Clear token cookies
 */
export function clearTokenCookies(res) {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
}






