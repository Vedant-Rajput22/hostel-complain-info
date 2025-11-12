#!/bin/bash

# MySQL Database Setup Script for Hostel Complaint Portal
# This script sets up the MySQL database with the required schema

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to test database connection
test_db_connection() {
    print_info "Testing database connection..."
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
        print_success "Database connection successful"
        return 0
    else
        print_error "Database connection failed"
        return 1
    fi
}

# Function to check if database exists
check_database_exists() {
    print_info "Checking if database '$DB_NAME' exists..."
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME;" >/dev/null 2>&1; then
        print_warning "Database '$DB_NAME' already exists"
        return 0
    else
        print_info "Database '$DB_NAME' does not exist"
        return 1
    fi
}

# Function to create database
create_database() {
    print_info "Creating database '$DB_NAME'..."
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "
        CREATE DATABASE IF NOT EXISTS $DB_NAME
        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    "
    print_success "Database '$DB_NAME' created successfully"
}

# Function to execute schema
execute_schema() {
    local schema_file="$1"
    if [ ! -f "$schema_file" ]; then
        print_error "Schema file not found: $schema_file"
        exit 1
    fi

    print_info "Executing schema from $schema_file..."
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$schema_file"
    print_success "Schema executed successfully"
}

# Function to verify tables
verify_setup() {
    print_info "Verifying database setup..."

    # Check if tables exist
    local tables=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | wc -l)

    if [ "$tables" -gt 1 ]; then
        print_success "Tables created successfully"

        # Show table count
        local table_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | tail -n +2 | wc -l)
        print_info "Created $table_count tables"

        # Show table names
        print_info "Tables created:"
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | tail -n +2 | while read -r table; do
            echo -e "  ${BLUE}•${NC} $table"
        done
    else
        print_error "No tables were created. Please check the schema file."
        exit 1
    fi
}

# Function to seed initial data
seed_data() {
    print_info "Checking for seed data..."
    local seed_file="scripts/seed.js"

    if [ -f "$seed_file" ]; then
        print_info "Running seed data script..."
        node "$seed_file"
        print_success "Seed data executed"
    else
        print_warning "No seed file found at $seed_file"
    fi
}

# Main setup function
main() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}           ${GREEN}MySQL Database Setup for Hostel Portal${NC}            ${BLUE}║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo

    # Check if mysql client is installed
    if ! command_exists mysql; then
        print_error "MySQL client is not installed. Please install MySQL first."
        print_info "Run: sudo apt install mysql-client"
        exit 1
    fi

    # Check if Node.js is installed (for seed data)
    if ! command_exists node; then
        print_warning "Node.js is not installed. Seed data will be skipped."
    fi

    # Display configuration
    echo -e "${YELLOW}Database Configuration:${NC}"
    echo -e "  Host: ${BLUE}$DB_HOST${NC}"
    echo -e "  Port: ${BLUE}$DB_PORT${NC}"
    echo -e "  User: ${BLUE}$DB_USER${NC}"
    echo -e "  Database: ${BLUE}$DB_NAME${NC}"
    echo

    # Test connection
    if ! test_db_connection; then
        print_error "Cannot connect to MySQL. Please check your credentials and ensure MySQL is running."
        exit 1
    fi

    # Check if database exists
    if check_database_exists; then
        echo
        read -p "Database '$DB_NAME' already exists. Continue anyway? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Setup cancelled by user"
            exit 0
        fi
    else
        create_database
    fi

    # Execute schema
    execute_schema "sql/schema.sql"

    # Verify setup
    verify_setup

    # Seed data
    seed_data

    echo
    print_success "Database setup completed successfully! 🎉"
    echo
    print_info "Next steps:"
    echo -e "  1. Configure your environment variables in .env"
    echo -e "  2. Start the application: ${BLUE}npm run dev${NC}"
    echo -e "  3. Test the application functionality"
    echo
    print_info "To backup your database:"
    echo -e "  ${BLUE}mysqldump -u $DB_USER -p $DB_NAME > backup.sql${NC}"
}

# Show help
show_help() {
    echo "MySQL Database Setup Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  --host HOST         Database host (default: localhost)"
    echo "  --port PORT         Database port (default: 3306)"
    echo "  --user USER         Database user (default: root)"
    echo "  --password PASS     Database password (default: changeme)"
    echo "  --database DB       Database name (default: hostel_portal)"
    echo
    echo "Environment variables:"
    echo "  DB_HOST             Database host"
    echo "  DB_PORT             Database port"
    echo "  DB_USER             Database user"
    echo "  DB_PASSWORD         Database password"
    echo "  DB_NAME             Database name"
    echo
    echo "Examples:"
    echo "  $0"
    echo "  $0 --host remote-server --user myuser --password mypass"
    echo "  DB_HOST=remote DB_USER=myuser $0"
}

# Parse command line arguments
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
        --password)
            DB_PASSWORD="$2"
            shift 2
            ;;
        --database)
            DB_NAME="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main
