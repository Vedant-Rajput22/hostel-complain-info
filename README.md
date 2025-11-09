# Hostel Complaint & Information Portal

Full‑stack web app for managing hostel complaints, mess/bus timetables, entry/exit logs, cleaning, internet issues, and admin operations. Authentication is restricted to college emails (e.g., `@iiitn.ac.in`) with email verification and role‑based access.

## Table of Contents
- Features
- Tech Stack
- Monorepo Structure
- Environment Setup
- Quick Start
- Environment Variables
- Roles & Access
- Admin Dashboard
- API Summary
- Database Schema (Overview)
- Development Notes
- Common Scripts
- Production Checklist

## Features
- Authentication
  - Register/Login with college email only, email verification
  - JWT (httpOnly cookie), roles: `student`, `staff`, `admin`
- Complaint Management
  - File complaints (title, category, description, room/floor/block, optional image)
  - Status: Pending → In Progress → Resolved
  - Admin assigns to staff; student can rate after resolution
  - Transparency: All complaints (filterable), Recently resolved
- Mess Timetable
  - Weekly menu (Breakfast/Lunch/Snacks/Dinner)
  - Admin editor; student feedback
- Bus/Transport
  - Routes, stops, timings; printable/downloadable
  - Admin editor
- Entry/Exit Logs
  - Record entry/exit with reason; filter by date/user
  - Admin CSV export
- Cleaning Tracker
  - Cleaning requests, assign staff, mark completion, weekly view
- Internet/Wi‑Fi Issues
  - Log issues (optional screenshot planned)
  - Admin live outage notices
- Dashboards
  - Student: personal complaints, mess/bus, entry/exit history
  - Admin: complaints management, mess/bus editors, logs, users, internet, cleaning

## Tech Stack
- Frontend: React 18, Vite, TailwindCSS, React Router, Axios
- Backend: Node.js, Express, MySQL (mysql2), JWT, bcrypt, multer
- Utilities: CORS, morgan, express‑validator

## Monorepo Structure
```
backend/
  src/
    server.js
    config/db.js
    middleware/auth.js
    routes/
      auth.js
      complaints.js
      mess.js
      bus.js
      cleaning.js
      internet.js
      logs.js
      dashboard.js
      users.js
    utils/
      fs.js
  sql/schema.sql
  scripts/seed.js
  .env.example
  package.json

frontend/
  src/
    lib/api.js
    App.jsx
    main.jsx
    components/ComplaintForm.jsx
    pages/
      Login.jsx
      Register.jsx
      StudentDashboard.jsx
      AdminDashboard.jsx
      AllComplaints.jsx
      ResolvedComplaints.jsx
      MessTimetable.jsx
      BusTimetable.jsx
      EntryExitLogs.jsx
      CleaningRequests.jsx
      InternetIssues.jsx
      admin/
        ComplaintsAdmin.jsx
        UsersAdmin.jsx
        MessEditor.jsx
        BusEditor.jsx
        LogsAdmin.jsx
        CleaningAdmin.jsx
        InternetAdmin.jsx
  .env.example
  package.json

docker-compose.yml
README.md
```

## Environment Setup

Prerequisites:
- Node.js 18+ and npm
- MySQL 8.x (local or Docker)
- Optional: Docker Desktop (for `docker compose`)

### Database
Option A: Docker
```
docker compose up -d
```
- MySQL available on `localhost:3306` with DB `hostel_portal`, root password `changeme`.

Option B: Local MySQL
- Create database `hostel_portal`.

Initialize schema (both options):
- Import `backend/sql/schema.sql` using your client or:
```
mysql -h 127.0.0.1 -P 3306 -u root -p < backend/sql/schema.sql
```

### Backend
```
cd backend
# Copy env template
# macOS/Linux:
cp .env.example .env
# Windows PowerShell:
Copy-Item .env.example .env

# Update .env values for your DB and CORS origin
npm install
# Optional: seed basic data
npm run seed
npm run dev
# http://localhost:4000
```

### Frontend
```
cd frontend
# Copy env template
# macOS/Linux:
cp .env.example .env
# Windows PowerShell:
Copy-Item .env.example .env

# Ensure VITE_API_URL points to your backend API (default shown)
npm install
npm run dev
# http://localhost:5173
```

## Environment Variables

Backend (`backend/.env`)
```
PORT=4000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=changeme
DB_NAME=hostel_portal

JWT_SECRET=supersecretchangeme
JWT_EXPIRES_IN=7d

CLIENT_ORIGIN=http://localhost:5173

UPLOAD_DIR=uploads
```

Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:4000/api
```

## Roles & Access
- Student: File/manage own complaints; view mess/bus; log entry/exit; own cleaning/internet items; transparency pages.
- Staff: Update statuses for assigned complaints/cleaning; operational visibility.
- Admin: Full access to Admin Dashboard (complaints, users/roles, mess, bus, logs export, cleaning, internet outages).

## Admin Dashboard
- Path: `/admin` after login
- Tabs:
  - Overview (metrics)
  - Complaints (filter, assign staff, set status, view attachments)
  - Users (list, change roles)
  - Mess (weekly menu editor)
  - Bus (manage routes/stops/times)
  - Logs (filters, CSV export)
  - Cleaning (assign, mark complete)
  - Internet (manage issues, post/deactivate outages)

Promote a user to admin:
SQL
```
UPDATE users SET role='admin' WHERE email='your@iiitn.ac.in';
```
API
```
# Get user id from /api/users (admin required) or DB, then:
PATCH /api/users/:id/role
Body: { "role": "admin" }
```

## API Summary

Auth
- POST `/api/auth/register` (returns `verify_url` for testing)
- GET `/api/auth/verify?token=...`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

Complaints
- POST `/api/complaints` (multipart; `image` optional)
- GET `/api/complaints/mine`
- GET `/api/complaints/all` (filters: `status,category,q,from,to`)
- GET `/api/complaints/resolved/recent`
- PATCH `/api/complaints/:id/assign` (admin)
- PATCH `/api/complaints/:id/status` (admin/staff)
- PATCH `/api/complaints/:id/rating` (owner)

Mess
- GET `/api/mess`
- PUT `/api/mess` (admin) `{ items: [{ day_of_week, meal_type, menu_items }] }`
- POST `/api/mess/feedback`

Bus
- GET `/api/bus`
- PUT `/api/bus` (admin) `{ entries: [{ route_name, start_time, end_time, stops[] }] }`

Cleaning
- POST `/api/cleaning`
- GET `/api/cleaning/mine`
- GET `/api/cleaning/all` (admin/staff)
- PATCH `/api/cleaning/:id/assign` (admin)
- PATCH `/api/cleaning/:id/complete` (admin/staff)

Internet
- POST `/api/internet/issues`
- GET `/api/internet/issues/mine`
- GET `/api/internet/issues` (admin/staff)
- PATCH `/api/internet/issues/:id/status` (admin/staff)
- GET `/api/internet/outages`
- POST `/api/internet/outages` (admin)
- PATCH `/api/internet/outages/:id/deactivate` (admin)

Logs
- POST `/api/logs` `{ action: entry|exit, reason? }`
- GET `/api/logs` (self; admin can filter `user_id,from,to`)
- GET `/api/logs/export` (admin CSV)

Dashboard
- GET `/api/dashboard/student`
- GET `/api/dashboard/admin`

Users
- GET `/api/users` (admin)
- PATCH `/api/users/:id/role` (admin)

## Database Schema (Overview)
Tables:
- `users` (role, hostel_block, room_no, verified)
- `email_verifications`
- `complaints` (category, status, assigned_to, rating)
- `mess_timetable`, `mess_feedback`
- `bus_timetable` (JSON stops)
- `cleaning_requests` (status, assigned_to)
- `internet_issues`, `internet_outages` (active flag)
- `entry_exit_log`

Initialize with: `backend/sql/schema.sql`

## Development Notes
- Email verification: For local dev, the register endpoint returns a `verify_url`. Integrate a mailer for production.
- Auth: JWT set as httpOnly cookie; frontend axios uses `withCredentials`.
- File uploads: Saved under `backend/uploads` (configurable via `UPLOAD_DIR`) and served at `/uploads/*`.
- CORS: Set `CLIENT_ORIGIN` in backend `.env` to your frontend URL.

## Common Scripts
Backend
```
npm run dev
npm run start
npm run seed
```
Frontend
```
npm run dev
npm run build
npm run preview
```
Docker (DB)
```
docker compose up -d
```

## Production Checklist
- Use strong `JWT_SECRET` and secure DB credentials
- Set `NODE_ENV=production` and enable HTTPS at proxy layer
- Set cookies `secure: true` behind HTTPS
- Consider object storage for uploads
- Add rate limiting, logging, and backups for MySQL
- Build frontend and serve via a CDN or web server; reverse‑proxy API behind Nginx/Caddy

