#!/bin/bash

# MySQL Schema Update Script for Hostel Complaint Portal
# This script safely updates the database schema without data loss

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-changeme}"
DB_NAME="${DB_NAME:-hostel_portal}"

# Migration files directory
MIGRATIONS_DIR="sql/migrations"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to test database connection
test_db_connection() {
    if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
        print_error "Database connection failed"
        return 1
    fi
    return 0
}

# Function to check if database exists
check_database() {
    if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME;" >/dev/null 2>&1; then
        print_error "Database '$DB_NAME' does not exist. Please run setup-db.sh first."
        exit 1
    fi
}

# Function to get current schema version
get_current_version() {
    # Check if schema_version table exists
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES LIKE 'schema_version';" | grep -q "schema_version"; then
        local version=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT version FROM schema_version ORDER BY applied_at DESC LIMIT 1;" 2>/dev/null | tail -n1)
        echo "$version"
    else
        echo "0"
    fi
}

# Function to create schema version table
create_version_table() {
    print_info "Creating schema version tracking table..."
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOF'
CREATE TABLE IF NOT EXISTS schema_version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by VARCHAR(100) DEFAULT 'system',
    UNIQUE KEY unique_version (version)
);
EOF
    print_success "Schema version table created"
}

# Function to execute migration
execute_migration() {
    local migration_file="$1"
    local version="$2"
    local description="$3"

    print_info "Applying migration: $version - $description"

    # Execute the migration
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$migration_file"

    # Record the migration
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << EOF
INSERT INTO schema_version (version, description, applied_by)
VALUES ('$version', '$description', 'update-schema.sh');
EOF

    print_success "Migration $version applied successfully"
}

# Function to check column exists
column_exists() {
    local table="$1"
    local column="$2"
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DESCRIBE $table $column;" >/dev/null 2>&1
}

# Function to check table exists
table_exists() {
    local table="$1"
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES LIKE '$table';" | grep -q "$table"
}

# Function to apply common schema updates
apply_common_updates() {
    print_info "Checking for common schema updates..."

    # Add lighthouse_cid column to complaints table if it doesn't exist
    if table_exists "complaints" && ! column_exists "complaints" "lighthouse_cid"; then
        print_info "Adding lighthouse_cid column to complaints table..."
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOF'
ALTER TABLE complaints
ADD COLUMN lighthouse_cid VARCHAR(100) NULL AFTER image_url;
EOF
        print_success "Added lighthouse_cid column"
    fi

    # Ensure proper character set and collation
    print_info "Ensuring proper character set and collation..."
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOF'
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE complaints CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE mess_timetable CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE mess_feedback CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE bus_timetable CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cleaning_requests CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE internet_issues CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE internet_outages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE entry_exit_log CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF
    print_success "Character set updated"
}

# Function to create backup
create_backup() {
    local backup_file="backup_pre_update_$(date +%Y%m%d_%H%M%S).sql"
    print_info "Creating backup: $backup_file"

    if mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$backup_file"; then
        print_success "Backup created: $backup_file"
        echo "$backup_file"
    else
        print_error "Failed to create backup"
        exit 1
    fi
}

# Function to show database status
show_status() {
    print_info "Database status:"
    echo -e "  ${BLUE}Host:${NC} $DB_HOST:$DB_PORT"
    echo -e "  ${BLUE}Database:${NC} $DB_NAME"
    echo -e "  ${BLUE}User:${NC} $DB_USER"

    # Show table count
    local table_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | tail -n +2 | wc -l)
    echo -e "  ${BLUE}Tables:${NC} $table_count"

    # Show record counts
    if table_exists "users"; then
        local user_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) FROM users;" 2>/dev/null | tail -n1)
        echo -e "  ${BLUE}Users:${NC} $user_count"
    fi

    if table_exists "complaints"; then
        local complaint_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) FROM complaints;" 2>/dev/null | tail -n1)
        echo -e "  ${BLUE}Complaints:${NC} $complaint_count"
    fi

    # Show schema version
    local current_version=$(get_current_version)
    echo -e "  ${BLUE}Schema Version:${NC} $current_version"
}

# Function to run custom migration scripts
run_custom_migrations() {
    if [ -d "$MIGRATIONS_DIR" ]; then
        print_info "Checking for custom migration files..."

        # Find migration files (format: YYYYMMDD_HHMMSS_description.sql)
        local migration_files=$(find "$MIGRATIONS_DIR" -name "*.sql" | sort)

        for migration_file in $migration_files; do
            local filename=$(basename "$migration_file")
            local version=$(echo "$filename" | cut -d'_' -f1-2)
            local description=$(echo "$filename" | sed 's/^[0-9_]*//' | sed 's/\.sql$//' | tr '_' ' ')

            # Check if migration already applied
            local applied=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) FROM schema_version WHERE version = '$version';" 2>/dev/null | tail -n1)

            if [ "$applied" = "0" ]; then
                execute_migration "$migration_file" "$version" "$description"
            else
                print_info "Migration $version already applied - skipping"
            fi
        done
    else
        print_info "No custom migrations directory found"
    fi
}

# Main update function
main() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}           ${GREEN}MySQL Schema Update for Hostel Portal${NC}            ${BLUE}║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo

    # Test connection
    if ! test_db_connection; then
        print_error "Cannot connect to database. Please check your configuration."
        exit 1
    fi

    # Check database exists
    check_database

    # Show current status
    show_status
    echo

    # Create backup
    local backup_file=$(create_backup)
    echo

    # Create version table
    create_version_table

    # Apply common updates
    apply_common_updates

    # Run custom migrations
    run_custom_migrations

    echo
    print_success "Schema update completed successfully! 🎉"
    echo
    print_info "Backup saved as: $backup_file"
    echo
    print_info "Next steps:"
    echo -e "  1. Test your application: ${BLUE}npm run dev${NC}"
    echo -e "  2. Verify data integrity"
    echo -e "  3. Remove backup file if everything works: ${BLUE}rm $backup_file${NC}"
}

# Show help
show_help() {
    echo "MySQL Schema Update Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "This script safely updates the database schema by:"
    echo "  - Creating a backup before making changes"
    echo "  - Applying common schema updates"
    echo "  - Running custom migration files"
    echo "  - Tracking schema versions"
    echo
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  --host HOST         Database host (default: localhost)"
    echo "  --port PORT         Database port (default: 3306)"
    echo "  --user USER         Database user (default: root)"
    echo "  --password PASS     Database password (default: changeme)"
    echo "  --database DB       Database name (default: hostel_portal)"
    echo "  --no-backup         Skip backup creation (not recommended)"
    echo
    echo "Environment variables:"
    echo "  DB_HOST             Database host"
    echo "  DB_PORT             Database port"
    echo "  DB_USER             Database user"
    echo "  DB_PASSWORD         Database password"
    echo "  DB_NAME             Database name"
    echo
    echo "Migration files:"
    echo "  Place SQL migration files in: sql/migrations/"
    echo "  File format: YYYYMMDD_HHMMSS_description.sql"
    echo "  Example: 20241111_143000_add_user_roles.sql"
    echo
    echo "Examples:"
    echo "  $0"
    echo "  $0 --host remote-server --user myuser"
    echo "  DB_HOST=remote $0"
}

# Parse command line arguments
SKIP_BACKUP=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --host)
            DB_HOST="$2"
            shift 2
            ;;
        --port)
            DB_PORT="$2"
            shift 2
            ;;
        --user)
            DB_USER="$2"
            shift 2
            ;;
        --port)
            DB_PORT="$2"
            shift 2
            ;;
        --user)
            DB_USER="$2"
            shift 2
            ;;
        --password)
            DB_PASSWORD="$2"
            shift 2
            ;;
        --database)
            DB_NAME="$2"
            shift 2
            ;;
        --no-backup)
            SKIP_BACKUP=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Override create_backup if --no-backup is used
if [ "$SKIP_BACKUP" = true ]; then
    create_backup() {
        print_warning "Skipping backup as requested"
        echo "no_backup"
    }
fi

# Run main function
main
