# Google OAuth 2.0 Setup Guide

## 🎯 Overview

This guide will help you set up Google OAuth 2.0 authentication for the Hostel Portal, allowing users with `@iiitn.ac.in` emails to sign in using their Google accounts.

---

## 📋 Prerequisites

- Google Cloud Platform account
- Access to Google Cloud Console
- Backend and frontend applications running

---

## 🔧 Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: "Hostel Portal" (or your preferred name)
5. Click "CREATE"

---

## 🔑 Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and click "ENABLE"

---

## 🎫 Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Click "CONFIGURE CONSENT SCREEN"
   - Choose "External" (or "Internal" if using Google Workspace)
   - Fill in the required fields:
     - App name: "Hostel Portal"
     - User support email: Your email
     - Developer contact email: Your email
   - Click "SAVE AND CONTINUE"
   - Skip "Scopes" for now (click "SAVE AND CONTINUE")
   - Add test users if needed (for development)
   - Click "SAVE AND CONTINUE"

4. Back to creating OAuth client ID:
   - Application type: **Web application**
   - Name: "Hostel Portal Web Client"
   
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:4000
   ```
   
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:4000/api/auth/google/callback
   ```
   
7. Click "CREATE"

8. **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these!

---

## ⚙️ Step 4: Configure Backend Environment Variables

1. Open your backend `.env` file
2. Add the following variables:

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# JWT Secrets (if not already set)
JWT_SECRET=your_secure_random_string_here
JWT_REFRESH_SECRET=your_secure_random_string_for_refresh_here
```

**Example**:
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

3. **Generate secure JWT secrets** (optional but recommended):
```bash
# Generate random strings for JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🚀 Step 5: Restart Backend Server

```bash
cd backend
npm run dev
```

The server should start without errors. Check the logs for:
```
Backend running on http://localhost:4000
Database connection established successfully
```

---

## 🎨 Step 6: Test Google Sign-In

1. Make sure frontend is running:
```bash
cd frontend
npm run dev
```

2. Open http://localhost:5173/login

3. You should see a "Sign in with Google" button

4. Click it and test the flow:
   - You'll be redirected to Google's sign-in page
   - Sign in with a `@iiitn.ac.in` email
   - You'll be redirected back to the app
   - You should be logged in!

---

## 🔒 Email Domain Restriction

The system is configured to **only allow** emails ending with `@iiitn.ac.in`. 

If a user tries to sign in with a different email domain:
- They will see an error message
- No account will be created
- They will be redirected back to the login page

---

## 🏭 Production Deployment

### Update OAuth Settings

1. In Google Cloud Console, go to **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add production URLs:

**Authorized JavaScript origins**:
```
https://your-domain.com
```

**Authorized redirect URIs**:
```
https://your-domain.com/api/auth/google/callback
```

### Update Environment Variables

Update your production `.env` file:

```env
# Production URLs
CLIENT_ORIGIN=https://your-domain.com
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback

# Use strong secrets in production!
JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_refresh_secret

# Enable production mode
NODE_ENV=production
```

### OAuth Consent Screen

For production, you'll need to:
1. Complete the OAuth consent screen fully
2. Add privacy policy and terms of service URLs
3. Submit for verification (if needed)
4. Move from "Testing" to "Published" status

---

## 🧪 Testing Checklist

- [ ] Google Sign-In button appears on login page
- [ ] Google Sign-In button appears on register page
- [ ] Clicking button redirects to Google
- [ ] Can sign in with `@iiitn.ac.in` email
- [ ] Non-IIITN emails are rejected
- [ ] User is created in database
- [ ] User is redirected to dashboard after sign-in
- [ ] JWT tokens are set correctly
- [ ] User can access protected routes
- [ ] Logout works correctly
- [ ] Can sign in again after logout

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match what's configured in Google Cloud Console.

**Solution**:
1. Check your `GOOGLE_CALLBACK_URL` in `.env`
2. Make sure it exactly matches one of the authorized redirect URIs in Google Cloud Console
3. Include the protocol (`http://` or `https://`)
4. No trailing slashes

### Error: "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen not configured properly.

**Solution**:
1. Go to OAuth consent screen in Google Cloud Console
2. Complete all required fields
3. Add test users (for development)
4. Save changes

### Error: "Only @iiitn.ac.in emails are allowed"

**Problem**: User is trying to sign in with a non-IIITN email.

**Solution**: This is expected behavior! Only IIITN emails are allowed. Use a valid `@iiitn.ac.in` email address.

### Database Error: "Unknown column 'user_id'"

**Problem**: Database schema not created.

**Solution**:
```bash
# Run the schema file
cd backend
docker compose exec -T db mysql -u root -p'changeme' hostel_portal < sql/schema.sql
```

### OAuth User Can't Login with Password

**Problem**: OAuth users don't have passwords.

**Solution**: This is by design. OAuth users must always use "Sign in with Google". Their `password_hash` is set to `'oauth_user'` to prevent password login.

---

## 📊 How It Works

### Authentication Flow

1. **User clicks "Sign in with Google"**
   - Frontend redirects to: `http://localhost:4000/api/auth/google`

2. **Backend redirects to Google**
   - User sees Google's sign-in page
   - User selects/enters their Google account

3. **Google redirects back to backend**
   - URL: `http://localhost:4000/api/auth/google/callback?code=...`
   - Backend receives authorization code

4. **Backend exchanges code for user info**
   - Gets user's email and name from Google
   - Validates email domain (`@iiitn.ac.in`)

5. **Backend creates/updates user**
   - If user exists: Update and log in
   - If new user: Create account with `verified=1`
   - Generate JWT tokens

6. **Backend redirects to frontend**
   - URL: `http://localhost:5173/auth/callback?token=...&refresh=...`
   - Includes access and refresh tokens

7. **Frontend completes login**
   - Stores tokens
   - Redirects to dashboard
   - User is logged in!

---

## 🔐 Security Features

1. **Email Domain Validation**: Only `@iiitn.ac.in` emails allowed
2. **Auto-Verification**: OAuth users are automatically verified
3. **JWT Tokens**: Secure token-based authentication
4. **Refresh Tokens**: Long-lived refresh tokens for seamless experience
5. **HttpOnly Cookies**: Tokens stored in secure cookies
6. **HTTPS in Production**: Secure flag enabled for production
7. **No Password Storage**: OAuth users don't have passwords

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google | `123456-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret | `GOCSPX-abcdefg...` |
| `GOOGLE_CALLBACK_URL` | Redirect URI after Google auth | `http://localhost:4000/api/auth/google/callback` |
| `JWT_SECRET` | Secret for access tokens | Random 64-char string |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Random 64-char string |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` (7 days) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `30d` (30 days) |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |

---

## 🎓 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## ✅ Quick Setup Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 credentials
- [ ] Added authorized origins and redirect URIs
- [ ] Copied Client ID and Secret
- [ ] Updated backend `.env` file
- [ ] Restarted backend server
- [ ] Tested Google Sign-In flow
- [ ] Verified email domain restriction
- [ ] Tested user creation
- [ ] Tested logout and re-login

---

**Need Help?** Check the troubleshooting section or review the backend logs for detailed error messages.

**Last Updated**: November 2025
**Version**: 2.1.0






