# MySQL Database Setup Guide

This guide provides step-by-step instructions for installing, configuring, and setting up MySQL database for the Hostel Complaint Portal.

## Prerequisites

- Linux (Ubuntu/Debian recommended)
- Root/sudo access
- Internet connection for downloads

## Database Credentials

The application uses these database credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=changeme
DB_NAME=hostel_portal
```

## Installation Options

### Option 1: Install MySQL Server (Recommended)

#### Step 1: Update Package Index
```bash
sudo apt update
```

#### Step 2: Install MySQL Server
```bash
sudo apt install mysql-server
```

#### Step 3: Secure MySQL Installation
```bash
sudo mysql_secure_installation
```
Follow the prompts:
- Press ENTER to set root password
- Type 'Y' to remove anonymous users
- Type 'Y' to disallow root login remotely
- Type 'Y' to remove test database
- Type 'Y' to reload privilege tables

#### Step 4: Start MySQL Service
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### Step 5: Verify Installation
```bash
sudo systemctl status mysql
mysql --version
```

### Option 2: Install MariaDB (Alternative)

#### Step 1: Update Package Index
```bash
sudo apt update
```

#### Step 2: Install MariaDB
```bash
sudo apt install mariadb-server mariadb-client
```

#### Step 3: Secure MariaDB Installation
```bash
sudo mysql_secure_installation
```
Follow the same prompts as MySQL above.

#### Step 4: Start MariaDB Service
```bash
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

#### Step 5: Verify Installation
```bash
sudo systemctl status mariadb
mysql --version
```

### Option 3: Using Docker (For Development)

#### Step 1: Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
```

#### Step 2: Run MySQL Container
```bash
docker run --name mysql-hostel \
  -e MYSQL_ROOT_PASSWORD=changeme \
  -e MYSQL_DATABASE=hostel_portal \
  -p 3306:3306 \
  -d mysql:8.0 \
  --default-authentication-plugin=mysql_native_password
```

#### Step 3: Verify Container
```bash
docker ps
docker logs mysql-hostel
```

## Database Setup

### Method 1: Using Setup Scripts (Recommended)

#### Step 1: Navigate to Backend Directory
```bash
cd backend
```

#### Step 2: Make Scripts Executable
```bash
chmod +x scripts/setup-db.sh
chmod +x scripts/update-schema.sh
```

#### Step 3: Run Database Setup
```bash
./scripts/setup-db.sh
```

#### Step 4: Verify Setup
```bash
mysql -u root -p -e "SHOW DATABASES;"
mysql -u root -p -e "USE hostel_portal; SHOW TABLES;"
```

### Method 2: Manual Setup

#### Step 1: Connect to MySQL
```bash
mysql -u root -p
```
Enter password: `changeme`

#### Step 2: Create Database
```sql
CREATE DATABASE IF NOT EXISTS hostel_portal
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Step 3: Use Database
```sql
USE hostel_portal;
```

#### Step 4: Execute Schema
```sql
SOURCE sql/schema.sql;
```

#### Step 5: Verify Tables
```sql
SHOW TABLES;
DESCRIBE users;
DESCRIBE complaints;
```

#### Step 6: Exit MySQL
```sql
EXIT;
```

## Environment Configuration

### Step 1: Create Environment File
```bash
cd backend
touch .env
```

### Step 2: Add Database Configuration
```bash
cat >> .env << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=changeme
DB_NAME=hostel_portal
EOF
```

### Step 3: Verify Configuration
```bash
cat .env
```

## Testing Database Connection

### Step 1: Test Connection
```bash
cd backend
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Database connection successful!');
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
"
```

### Step 2: Test with Application
```bash
cd backend
npm test
# or
npm run dev
```

## Database Maintenance

### Backup Database
```bash
# Full backup
mysqldump -u root -p hostel_portal > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables
mysqldump -u root -p hostel_portal users complaints > backup_users_complaints.sql
```

### Restore Database
```bash
mysql -u root -p hostel_portal < backup_file.sql
```

### View Database Status
```bash
mysql -u root -p -e "SHOW DATABASES;"
mysql -u root -p -e "USE hostel_portal; SHOW TABLES;"
mysql -u root -p -e "USE hostel_portal; SELECT COUNT(*) FROM users;"
mysql -u root -p -e "USE hostel_portal; SELECT COUNT(*) FROM complaints;"
```

## Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL if stopped
sudo systemctl start mysql

# Check port
netstat -tlnp | grep 3306
```

#### 2. Access Denied
```bash
# Reset root password
sudo systemctl stop mysql
sudo mysqld_safe --skip-grant-tables &
mysql -u root
UPDATE mysql.user SET authentication_string = PASSWORD('changeme') WHERE User = 'root';
FLUSH PRIVILEGES;
EXIT;
sudo systemctl restart mysql
```

#### 3. Database Doesn't Exist
```bash
mysql -u root -p -e "CREATE DATABASE hostel_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 4. Tables Missing
```bash
mysql -u root -p hostel_portal < sql/schema.sql
```

### Docker Issues

#### Container Not Starting
```bash
# Check logs
docker logs mysql-hostel

# Remove and recreate
docker rm -f mysql-hostel
# Then run the docker run command again
```

#### Port Already in Use
```bash
# Kill process using port 3306
sudo lsof -i :3306
sudo kill -9 <PID>

# Or use different port
docker run --name mysql-hostel -p 3307:3306 -d mysql:8.0
```

## Schema Updates

When the schema changes, use the update script:

```bash
cd backend
./scripts/update-schema.sh
```

This will safely apply schema changes without data loss.

## Production Considerations

### Security
1. Change default password
2. Create dedicated database user
3. Restrict remote access
4. Enable SSL connections
5. Regular backups

### Performance
1. Configure innodb_buffer_pool_size
2. Enable query caching
3. Set up connection pooling
4. Monitor slow queries

### Monitoring
1. Enable general log
2. Set up error logging
3. Monitor disk usage
4. Track connection count

## Quick Reference

### Commands Summary
```bash
# Install MySQL
sudo apt update && sudo apt install mysql-server
sudo mysql_secure_installation

# Start service
sudo systemctl start mysql && sudo systemctl enable mysql

# Setup database
cd backend
./scripts/setup-db.sh

# Test connection
mysql -u root -p -e "USE hostel_portal; SHOW TABLES;"

# Backup
mysqldump -u root -p hostel_portal > backup.sql

# Restore
mysql -u root -p hostel_portal < backup.sql
```

## Next Steps

After setting up the database:
1. Configure environment variables
2. Run database migrations if needed
3. Start the application
4. Test all features
5. Set up automated backups
