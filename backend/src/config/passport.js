import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { query } from './db.js';
import logger from '../utils/logger.js';
import '../setupEnv.js';

const COLLEGE_DOMAIN = 'iiitn.ac.in';

// Configure Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Extract email from profile
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(null, false, { message: 'No email found in Google profile' });
                }

                // Validate email domain
                if (!email.toLowerCase().endsWith(`@${COLLEGE_DOMAIN}`)) {
                    logger.warn('OAuth attempt with invalid domain', { email });
                    return done(null, false, {
                        message: `Only ${COLLEGE_DOMAIN} emails are allowed`
                    });
                }

                // Check if user exists
                let users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
                let user;

                if (users.length > 0) {
                    // User exists - update last login and verify status
                    user = users[0];

                    // Auto-verify OAuth users
                    if (!user.verified) {
                        await query('UPDATE users SET verified = 1 WHERE user_id = ?', [user.user_id]);
                        user.verified = 1;
                    }

                    logger.info('OAuth login successful', { userId: user.user_id, email });
                } else {
                    // Create new user
                    const name = profile.displayName || email.split('@')[0];
                    const result = await query(
                        'INSERT INTO users (name, email, password_hash, role, verified, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                        [name, email.toLowerCase(), 'oauth_user', 'student', 1]
                    );

                    user = {
                        user_id: result.insertId,
                        name,
                        email: email.toLowerCase(),
                        role: 'student',
                        verified: 1,
                    };

                    logger.info('New OAuth user created', { userId: user.user_id, email });
                }

                // Return user object
                return done(null, user);
            } catch (error) {
                logger.error('OAuth authentication error', { error: error.message });
                return done(error, null);
            }
        }
    )
);

// Serialize user for session (not used with JWT, but required by Passport)
passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const users = await query('SELECT user_id, name, email, role FROM users WHERE user_id = ?', [id]);
        done(null, users[0] || null);
    } catch (error) {
        done(error, null);
    }
});

export default passport;






