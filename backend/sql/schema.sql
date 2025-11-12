-- Create database (run once if not existing)
-- CREATE DATABASE IF NOT EXISTS hostel_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE hostel_portal;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','admin','staff') NOT NULL DEFAULT 'student',
  hostel_block VARCHAR(50) NULL,
  room_no VARCHAR(50) NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS email_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(512) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_ev_user (user_id),
  CONSTRAINT fk_ev_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS complaints (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category ENUM('Mess','Lift','Room/Floor Appliances','Internet/Wi-Fi','Washroom','Water','Room Cleaning') NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  room_no VARCHAR(50),
  floor VARCHAR(50),
  block VARCHAR(50),
  image_url VARCHAR(500),
  lighthouse_cid VARCHAR(100),
  status ENUM('Pending','In Progress','Resolved') NOT NULL DEFAULT 'Pending',
  assigned_to INT NULL,
  created_at DATETIME NOT NULL,
  resolved_at DATETIME NULL,
  rating TINYINT NULL,
  INDEX idx_complaints_user (user_id),
  INDEX idx_complaints_status (status),
  INDEX idx_complaints_cat (category),
  CONSTRAINT fk_complaints_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_complaints_assigned FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS mess_timetable (
  meal_id INT AUTO_INCREMENT PRIMARY KEY,
  day_of_week ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
  meal_type ENUM('Breakfast','Lunch','Snacks','Dinner') NOT NULL,
  menu_items TEXT NOT NULL,
  updated_by INT NULL,
  updated_at DATETIME NULL,
  UNIQUE KEY uniq_day_meal (day_of_week, meal_type),
  CONSTRAINT fk_mess_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS mess_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  day_of_week ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
  meal_type ENUM('Breakfast','Lunch','Snacks','Dinner') NOT NULL,
  rating TINYINT NULL,
  comment VARCHAR(500) NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_mess_fb_user (user_id),
  CONSTRAINT fk_mess_fb_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bus_timetable (
  bus_id INT AUTO_INCREMENT PRIMARY KEY,
  route_name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  stops JSON NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS cleaning_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  room_no VARCHAR(50) NOT NULL,
  description TEXT,
  status ENUM('Pending','In Progress','Completed') NOT NULL DEFAULT 'Pending',
  assigned_to INT NULL,
  created_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  INDEX idx_cl_user (user_id),
  CONSTRAINT fk_cl_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_cl_assigned FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS internet_issues (
  issue_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  description TEXT,
  status ENUM('Open','In Progress','Resolved') NOT NULL DEFAULT 'Open',
  created_at DATETIME NOT NULL,
  INDEX idx_ii_user (user_id),
  CONSTRAINT fk_ii_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS internet_outages (
  outage_id INT AUTO_INCREMENT PRIMARY KEY,
  message VARCHAR(500) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS entry_exit_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action ENUM('entry','exit') NOT NULL,
  reason VARCHAR(255) NULL,
  timestamp DATETIME NOT NULL,
  INDEX idx_log_user (user_id),
  INDEX idx_log_ts (timestamp),
  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- To seed an admin, run after deployment:
-- INSERT INTO users (name, email, password_hash, role, verified, created_at)
-- VALUES ('Admin', 'admin@iiitn.ac.in', '<bcrypt-hash-here>', 'admin', 1, NOW());
