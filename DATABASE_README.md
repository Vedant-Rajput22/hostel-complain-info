# Database Setup & Management

This guide covers everything you need to know about setting up, managing, and maintaining the MySQL database for the Hostel Complaint Portal.

## Quick Start

### One-Command Setup (Recommended)
```bash
# Install MySQL, setup database, and configure environment
sudo ./setup-mysql.sh
```

### Manual Setup
```bash
# 1. Install MySQL
sudo apt update && sudo apt install mysql-server
sudo mysql_secure_installation

# 2. Setup database
cd backend
./scripts/setup-db.sh

# 3. Configure environment
cp .env.example .env  # Edit with your credentials
```

## Database Configuration

### Default Credentials
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=changeme
DB_NAME=hostel_portal
```

### Environment Variables
Create `backend/.env`:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=changeme
DB_NAME=hostel_portal
```

## Database Schema

### Tables Overview

| Table | Description | Key Fields |
|-------|-------------|------------|
| `users` | User accounts | user_id, name, email, role |
| `complaints` | Complaint records | complaint_id, user_id, category, title, status |
| `mess_timetable` | Mess meal schedule | meal_id, day_of_week, meal_type |
| `bus_timetable` | Bus routes and times | bus_id, route_name, start_time |
| `cleaning_requests` | Room cleaning requests | request_id, user_id, room_no |
| `internet_issues` | Internet connectivity issues | issue_id, user_id, description |
| `entry_exit_log` | User entry/exit records | log_id, user_id, action |

### Schema File
Location: `backend/sql/schema.sql`

Contains all table definitions, indexes, and foreign key constraints.

## Management Scripts

### Database Setup Script
```bash
cd backend
./scripts/setup-db.sh
```

**Features:**
- Tests database connection
- Creates database if it doesn't exist
- Executes schema file
- Runs seed data (if available)
- Verifies setup

### Schema Update Script
```bash
cd backend
./scripts/update-schema.sh
```

**Features:**
- Creates automatic backup
- Applies common schema updates
- Runs custom migrations
- Tracks schema versions
- Safe rollback capability

### Complete Setup Script
```bash
sudo ./setup-mysql.sh
```

**Features:**
- Installs MySQL server
- Secures installation
- Sets up database
- Creates environment file
- All-in-one solution

## Database Migrations

### Migration Directory
Location: `backend/sql/migrations/`

### Creating Migrations
```bash
# Create migration file
touch backend/sql/migrations/$(date +%Y%m%d_%H%M%S)_your_description.sql

# Example: 20241111_143000_add_user_roles.sql
```

### Migration Format
```sql
-- Migration: Add user roles
-- Description: Adds role column to users table
-- Date: 2024-11-11

ALTER TABLE users
ADD COLUMN role ENUM('student', 'admin', 'staff') NOT NULL DEFAULT 'student'
AFTER email;

CREATE INDEX idx_users_role ON users(role);
```

### Running Migrations
```bash
cd backend
./scripts/update-schema.sh
```

## Backup & Recovery

### Creating Backups
```bash
# Full backup
mysqldump -u root -p hostel_portal > backup_$(date +%Y%m%d).sql

# Specific tables
mysqldump -u root -p hostel_portal users complaints > backup_users_complaints.sql

# Compressed backup
mysqldump -u root -p hostel_portal | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restoring Backups
```bash
# Restore full backup
mysql -u root -p hostel_portal < backup_20241111.sql

# Restore compressed backup
gunzip < backup_20241111.sql.gz | mysql -u root -p hostel_portal
```

### Automated Backups
```bash
# Add to crontab for daily backups
crontab -e

# Add this line for daily 2 AM backup
0 2 * * * mysqldump -u root -p'changeme' hostel_portal > /path/to/backups/backup_$(date +\%Y\%m\%d).sql
```

## Monitoring & Maintenance

### Check Database Status
```bash
# Service status
sudo systemctl status mysql

# Connection test
mysql -u root -p -e "SELECT VERSION();"

# Database info
mysql -u root -p -e "SHOW DATABASES;"
mysql -u root -p -e "USE hostel_portal; SHOW TABLES;"
```

### Monitor Performance
```bash
# Show running processes
mysql -u root -p -e "SHOW PROCESSLIST;"

# Check table sizes
mysql -u root -p -e "
SELECT
  table_name,
  ROUND(data_length/1024/1024, 2) as 'Size (MB)',
  table_rows as 'Rows'
FROM information_schema.tables
WHERE table_schema = 'hostel_portal'
ORDER BY data_length DESC;
"
```

### Optimize Tables
```bash
# Analyze and optimize tables
mysql -u root -p -e "USE hostel_portal; ANALYZE TABLE users, complaints, mess_timetable;"

# Repair tables if needed
mysql -u root -p -e "USE hostel_portal; REPAIR TABLE users, complaints;"
```

## Troubleshooting

### Common Issues

#### Connection Failed
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Check port
netstat -tlnp | grep 3306
```

#### Access Denied
```bash
# Reset root password
sudo systemctl stop mysql
sudo mysqld_safe --skip-grant-tables &
mysql -u root
UPDATE mysql.user SET authentication_string = PASSWORD('newpassword') WHERE User = 'root';
FLUSH PRIVILEGES;
EXIT;
sudo systemctl restart mysql
```

#### Database Doesn't Exist
```bash
mysql -u root -p -e "CREATE DATABASE hostel_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p hostel_portal < backend/sql/schema.sql
```

#### Tables Missing
```bash
cd backend
./scripts/setup-db.sh
```

#### Port Already in Use
```bash
# Find process using port 3306
sudo lsof -i :3306

# Kill the process
sudo kill -9 <PID>

# Or change MySQL port in /etc/mysql/mysql.conf.d/mysqld.cnf
```

### Docker Issues

#### MySQL Container Not Starting
```bash
# Check logs
docker logs mysql-hostel

# Remove and recreate
docker rm -f mysql-hostel
docker run --name mysql-hostel \
  -e MYSQL_ROOT_PASSWORD=changeme \
  -e MYSQL_DATABASE=hostel_portal \
  -p 3306:3306 \
  -d mysql:8.0
```

#### Permission Issues
```bash
# Fix Docker socket permissions
sudo usermod -aG docker $USER
# Logout and login again
```

## Security Best Practices

### Production Setup
1. **Change default password**
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
   ```

2. **Create dedicated database user**
   ```sql
   CREATE USER 'hostel_app'@'localhost' IDENTIFIED BY 'AppPassword123!';
   GRANT ALL PRIVILEGES ON hostel_portal.* TO 'hostel_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Restrict remote access**
   ```sql
   DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
   ```

4. **Enable SSL connections**
   ```sql
   ALTER USER 'root'@'localhost' REQUIRE SSL;
   ```

### Backup Security
- Store backups on encrypted drives
- Use separate credentials for backup operations
- Regularly test backup restoration
- Keep multiple backup copies

## Development Workflow

### Local Development
```bash
# 1. Setup database
sudo ./setup-mysql.sh

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Start services
cd backend && npm run dev    # Terminal 1
cd frontend && npm run dev   # Terminal 2

# 4. Access application
# Backend: http://localhost:4000
# Frontend: http://localhost:5173
```

### Schema Changes
```bash
# 1. Create migration file
cd backend
touch sql/migrations/$(date +%Y%m%d_%H%M%S)_your_change.sql

# 2. Write SQL changes
# Edit the migration file

# 3. Test migration
./scripts/update-schema.sh

# 4. Commit changes
git add sql/migrations/
git commit -m "Add migration: your change description"
```

### Testing Database Changes
```bash
# 1. Create test database
mysql -u root -p -e "CREATE DATABASE hostel_portal_test;"

# 2. Load schema
mysql -u root -p hostel_portal_test < sql/schema.sql

# 3. Run tests
npm test

# 4. Clean up
mysql -u root -p -e "DROP DATABASE hostel_portal_test;"
```

## Performance Tuning

### MySQL Configuration
Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:
```ini
[mysqld]
# Basic settings
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
max_connections = 100

# Query cache (MySQL 5.7)
query_cache_size = 64M
query_cache_type = 1

# Character set
character_set_server = utf8mb4
collation_server = utf8mb4_unicode_ci
```

### Application-Level Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_complaints_user_status ON complaints(user_id, status);
CREATE INDEX idx_complaints_created ON complaints(created_at);
CREATE INDEX idx_users_email ON users(email);
```

### Query Optimization
```sql
-- Use EXPLAIN to analyze queries
EXPLAIN SELECT * FROM complaints WHERE user_id = 1 AND status = 'Pending';

-- Add composite indexes for complex queries
CREATE INDEX idx_complaints_user_status_date ON complaints(user_id, status, created_at);
```

## File Structure

```
backend/
├── sql/
│   ├── schema.sql                    # Main schema file
│   └── migrations/                   # Migration files
│       ├── README.md                 # Migration guide
│       └── 20241111_143000_add_lighthouse_cid.sql
├── scripts/
│   ├── setup-db.sh                   # Database setup script
│   └── update-schema.sh              # Schema update script
└── .env                              # Environment variables

setup-mysql.sh                        # Complete setup script
MYSQL_SETUP_GUIDE.md                  # Detailed installation guide
DATABASE_README.md                    # This file
```

## Support

### Getting Help
1. Check the logs: `tail -f /var/log/mysql/error.log`
2. Test connection: `mysql -u root -p -e "SELECT 1;"`
3. Verify configuration: `cat backend/.env`
4. Check schema: `mysql -u root -p -e "USE hostel_portal; SHOW TABLES;"`

### Common Commands Reference
```bash
# MySQL operations
sudo systemctl start mysql          # Start MySQL
sudo systemctl stop mysql           # Stop MySQL
sudo systemctl restart mysql        # Restart MySQL
mysql -u root -p                    # Connect to MySQL

# Database operations
mysql -u root -p -e "SHOW DATABASES;"
mysql -u root -p -e "USE hostel_portal; SHOW TABLES;"
mysql -u root -p -e "USE hostel_portal; DESCRIBE users;"

# Backup operations
mysqldump -u root -p hostel_portal > backup.sql
mysql -u root -p hostel_portal < backup.sql

# Schema operations
cd backend
./scripts/setup-db.sh               # Initial setup
./scripts/update-schema.sh          # Apply migrations
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-11-11 | Initial database setup |
| 1.1.0 | 2024-11-11 | Added Lighthouse CID support |
| 1.2.0 | 2024-11-11 | Migration system implemented |

---

For more detailed information, see:
- [MySQL Setup Guide](MYSQL_SETUP_GUIDE.md) - Detailed installation instructions
- [Migration Guide](backend/sql/migrations/README.md) - Working with migrations
