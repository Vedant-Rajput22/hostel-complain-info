# Database Migrations

This directory contains SQL migration files for updating the database schema safely.

## Migration File Format

Migration files should follow this naming convention:
```
YYYYMMDD_HHMMSS_description.sql
```

### Examples:
- `20241111_143000_add_user_roles.sql`
- `20241112_090000_create_admin_logs.sql`
- `20241113_160000_add_complaint_categories.sql`

## How to Create a Migration

1. **Create a new migration file:**
   ```bash
   # Format: YYYYMMDD_HHMMSS_description.sql
   touch sql/migrations/$(date +%Y%m%d_%H%M%S)_your_description.sql
   ```

2. **Add your SQL changes:**
   ```sql
   -- Migration: Add user roles
   -- Description: Adds role column to users table
   -- Date: 2024-11-11

   ALTER TABLE users
   ADD COLUMN role ENUM('student', 'admin', 'staff') NOT NULL DEFAULT 'student'
   AFTER email;

   -- Add index for performance
   CREATE INDEX idx_users_role ON users(role);
   ```

3. **Run the migration:**
   ```bash
   cd backend
   ./scripts/update-schema.sh
   ```

## Migration Best Practices

### Safe Operations
- ✅ Adding new tables
- ✅ Adding new columns (with defaults)
- ✅ Adding indexes
- ✅ Modifying data (carefully)
- ✅ Adding constraints

### Potentially Dangerous Operations
- ⚠️ Dropping tables
- ⚠️ Dropping columns
- ⚠️ Changing column types
- ⚠️ Removing constraints
- ⚠️ Large data modifications

### Always Include
- Clear comments explaining what the migration does
- Rollback instructions (if complex)
- Test the migration on a copy of production data first

## Migration Examples

### Adding a Column
```sql
-- Add email verification timestamp
ALTER TABLE users
ADD COLUMN email_verified_at TIMESTAMP NULL
AFTER verified;
```

### Creating a New Table
```sql
-- Create user sessions table
CREATE TABLE user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_expires (expires_at),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### Adding an Index
```sql
-- Add index for faster complaint searches
CREATE INDEX idx_complaints_status_created ON complaints(status, created_at);
```

### Data Migration
```sql
-- Set default role for existing users
UPDATE users
SET role = 'student'
WHERE role IS NULL;
```

## Running Migrations

### Automatic (Recommended)
```bash
cd backend
./scripts/update-schema.sh
```

This will:
- Create a backup automatically
- Apply common schema updates
- Run all pending migrations
- Track versions in schema_version table

### Manual Execution
```bash
# Test the migration first
mysql -u root -p hostel_portal < sql/migrations/20241111_143000_add_user_roles.sql

# If successful, record it
mysql -u root -p hostel_portal -e "
INSERT INTO schema_version (version, description, applied_by)
VALUES ('20241111_143000', 'Add user roles', 'manual');
"
```

## Checking Migration Status

```bash
# See all applied migrations
mysql -u root -p hostel_portal -e "SELECT * FROM schema_version ORDER BY applied_at DESC;"

# Check current schema version
mysql -u root -p hostel_portal -e "SELECT version FROM schema_version ORDER BY applied_at DESC LIMIT 1;"
```

## Rollback Strategy

For complex migrations, consider creating rollback scripts:

### Example Rollback
```sql
-- Rollback: Remove user roles
-- This should undo the changes made by the migration

DROP INDEX idx_users_role ON users;
ALTER TABLE users DROP COLUMN role;
```

## Testing Migrations

1. **Create a backup first:**
   ```bash
   mysqldump -u root -p hostel_portal > backup_before_migration.sql
   ```

2. **Test on development:**
   ```bash
   # On your development machine
   ./scripts/update-schema.sh
   ```

3. **Verify data integrity:**
   ```bash
   # Check table structures
   mysql -u root -p hostel_portal -e "DESCRIBE users; DESCRIBE complaints;"

   # Check data counts
   mysql -u root -p hostel_portal -e "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM complaints;"
   ```

4. **Test application:**
   ```bash
   npm run dev
   # Test all features
   ```

## Troubleshooting

### Migration Fails
1. Check the error message in the console
2. Review the SQL syntax in your migration file
3. Ensure all referenced tables/columns exist
4. Check for foreign key constraints

### Data Loss Concerns
1. Always create backups before running migrations
2. Test migrations on development data first
3. Use transactions for complex operations:
   ```sql
   START TRANSACTION;
   -- Your migration SQL here
   COMMIT;
   ```

### Version Conflicts
If you get version conflicts, check what's already applied:
```bash
mysql -u root -p hostel_portal -e "SELECT * FROM schema_version WHERE version LIKE '20241111%';"
```

## Migration History

| Date | Version | Description | Status |
|------|---------|-------------|--------|
| 2024-11-11 | 20241111_143000 | Add user roles | ✅ Applied |
| 2024-11-12 | 20241112_090000 | Create admin logs | ✅ Applied |
| 2024-11-13 | 20241113_160000 | Add complaint categories | ⏳ Pending |

## Related Scripts

- `scripts/setup-db.sh` - Initial database setup
- `scripts/update-schema.sh` - Apply migrations safely
- `scripts/seed.js` - Populate initial data
