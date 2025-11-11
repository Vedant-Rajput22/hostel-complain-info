Backend (Node.js + Express + MySQL)

Setup
- Copy `.env.example` to `.env` and update values.
- Create database and tables: import `backend/sql/schema.sql` into your MySQL.
- Install deps: `npm install`
- Configure AWS S3 (see AWS_S3_SETUP.md for details):
  - Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET in `.env`
  - Test configuration: `node scripts/test-s3-upload.js`
- Run: `npm run dev`

Key Endpoints
- `POST /api/auth/register` — name,email,password,(hostel_block,room_no) — email limited to @iiitn.ac.in
- `GET /api/auth/verify?token=...` — email verification
- `POST /api/auth/login` — sets httpOnly cookie `token`
- `GET /api/auth/me` — current user info
- Complaints: `/api/complaints` (create), `/mine`, `/all`, `/resolved/recent`, `/id/assign`, `/id/status`, `/id/rating`
- Mess: `GET/PUT /api/mess`, `POST /api/mess/feedback`
- Bus: `GET/PUT /api/bus`
- Cleaning: `POST/GET /api/cleaning`, `/mine`, `/all`, `/:id/assign`, `/:id/complete`
- Internet: issues and outages at `/api/internet/*`
- Logs: `POST/GET /api/logs`, export CSV `GET /api/logs/export`

Roles
- Default role is `student`. Admin can assign staff by updating `users.role` in DB.

Notes
- Email verification returns `verify_url` (simulate email). Wire a mailer in production.
- **Image uploads**: Files are uploaded to AWS S3 in the `IMAGE/` folder. URLs stored in database.
  - Previous local storage (`backend/uploads`) is no longer used for new uploads.
  - See `AWS_S3_SETUP.md` for complete setup instructions.

