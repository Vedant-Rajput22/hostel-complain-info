#!/bin/bash

# Complete MySQL Setup Script for Hostel Complaint Portal
# This script installs MySQL, sets it up, and initializes the database

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

# Function to check if running as root or with sudo
check_privileges() {
    if [ "$EUID" -eq 0 ]; then
        print_info "Running with root privileges"
    elif sudo -n true 2>/dev/null; then
        print_info "Running with sudo privileges"
    else
        print_error "This script requires root privileges. Please run with sudo or as root."
        exit 1
    fi
}

# Function to update package lists
update_packages() {
    print_info "Updating package lists..."
    sudo apt update -y
    print_success "Package lists updated"
}

# Function to install MySQL
install_mysql() {
    print_info "Installing MySQL Server..."
    sudo apt install -y mysql-server
    print_success "MySQL Server installed"
}

# Function to secure MySQL installation
secure_mysql() {
    print_info "Securing MySQL installation..."

    # Create expect script for automated mysql_secure_installation
    cat > /tmp/mysql_secure.exp << 'EOF'
#!/usr/bin/expect -f
set timeout 10
spawn mysql_secure_installation

# Press ENTER for password validation
expect "Press y|Y for Yes, any other key for No:"
send "\n"

# Remove anonymous users
expect "Remove anonymous users? (Press y|Y for Yes, any other key for No) :"
send "y\n"

# Disallow root login remotely
expect "Disallow root login remotely? (Press y|Y for Yes, any other key for No) :"
send "y\n"

# Remove test database
expect "Remove test database and access to it? (Press y|Y for Yes, any other key for No) :"
send "y\n"

# Reload privilege tables
expect "Reload privilege tables now? (Press y|Y for Yes, any other key for No) :"
send "y\n"

expect eof
EOF

    chmod +x /tmp/mysql_secure.exp
    sudo /tmp/mysql_secure.exp

    # Clean up
    rm /tmp/mysql_secure.exp

    print_success "MySQL installation secured"
}

# Function to start MySQL service
start_mysql() {
    print_info "Starting MySQL service..."
    sudo systemctl start mysql
    sudo systemctl enable mysql

    # Wait for MySQL to start
    sleep 5

    print_success "MySQL service started"
}

# Function to test MySQL connection
test_mysql() {
    print_info "Testing MySQL connection..."
    if mysql -u root -p"$DB_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
        print_success "MySQL connection successful"
    else
        print_error "MySQL connection failed"
        exit 1
    fi
}

# Function to setup database
setup_database() {
    print_info "Setting up database..."

    cd backend

    # Run the database setup script
    if [ -f "scripts/setup-db.sh" ]; then
        chmod +x scripts/setup-db.sh
        ./scripts/setup-db.sh
    else
        print_error "Database setup script not found"
        exit 1
    fi
}

# Function to create environment file
create_env_file() {
    print_info "Creating environment configuration..."

    cd backend

    if [ ! -f ".env" ]; then
        cat > .env << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# Application Configuration
NODE_ENV=development
PORT=4000

# Session Configuration
SESSION_SECRET=your-secret-key-here

# Email Configuration (configure as needed)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# AWS S3 Configuration (configure as needed)
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=your-bucket-name

# Lighthouse Configuration (configure as needed)
# LIGHTHOUSE_API_KEY=your-api-key
EOF
        print_success "Environment file created: backend/.env"
    else
        print_warning "Environment file already exists, skipping..."
    fi
}

# Function to show status
show_status() {
    echo
    print_success "MySQL setup completed successfully! 🎉"
    echo
    print_info "Installation Summary:"
    echo -e "  ${BLUE}MySQL Version:${NC} $(mysql --version)"
    echo -e "  ${BLUE}Database:${NC} $DB_NAME"
    echo -e "  ${BLUE}Service Status:${NC} $(sudo systemctl is-active mysql)"
    echo
    print_info "Next Steps:"
    echo -e "  1. ${BLUE}cd backend${NC}"
    echo -e "  2. ${BLUE}npm install${NC} (install dependencies)"
    echo -e "  3. ${BLUE}npm run dev${NC} (start development server)"
    echo -e "  4. Open ${BLUE}http://localhost:5173${NC} in your browser"
    echo
    print_info "Database Management:"
    echo -e "  • View tables: ${BLUE}mysql -u root -p -e \"USE $DB_NAME; SHOW TABLES;\"${NC}"
    echo -e "  • Backup: ${BLUE}mysqldump -u root -p $DB_NAME > backup.sql${NC}"
    echo -e "  • Schema updates: ${BLUE}./scripts/update-schema.sh${NC}"
    echo
    print_info "Configuration Files:"
    echo -e "  • Database config: ${BLUE}backend/.env${NC}"
    echo -e "  • Schema file: ${BLUE}backend/sql/schema.sql${NC}"
    echo -e "  • Setup scripts: ${BLUE}backend/scripts/${NC}"
}

# Function to check if MySQL is already installed
check_mysql_installed() {
    if command -v mysql >/dev/null 2>&1 && systemctl is-active --quiet mysql; then
        print_warning "MySQL appears to be already installed and running"
        read -p "Continue with database setup only? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
        SKIP_INSTALL=true
    else
        SKIP_INSTALL=false
    fi
}

# Main function
main() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}          ${GREEN}Complete MySQL Setup for Hostel Portal${NC}            ${BLUE}║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo

    # Check privileges
    check_privileges

    # Display configuration
    echo -e "${YELLOW}Database Configuration:${NC}"
    echo -e "  Host: ${BLUE}$DB_HOST${NC}"
    echo -e "  Port: ${BLUE}$DB_PORT${NC}"
    echo -e "  User: ${BLUE}$DB_USER${NC}"
    echo -e "  Password: ${BLUE}$DB_PASSWORD${NC}"
    echo -e "  Database: ${BLUE}$DB_NAME${NC}"
    echo

    # Check if MySQL is already installed
    check_mysql_installed

    if [ "$SKIP_INSTALL" = false ]; then
        # Full installation
        update_packages
        install_mysql
        secure_mysql
        start_mysql
        test_mysql
    fi

    # Database setup
    setup_database

    # Create environment file
    create_env_file

    # Show status
    show_status
}

# Show help
show_help() {
    echo "Complete MySQL Setup Script for Hostel Complaint Portal"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "This script will:"
    echo "  - Install MySQL Server (if not installed)"
    echo "  - Secure the MySQL installation"
    echo "  - Create and setup the hostel_portal database"
    echo "  - Create environment configuration"
    echo
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  --host HOST         Database host (default: localhost)"
    echo "  --port PORT         Database port (default: 3306)"
    echo "  --user USER         Database user (default: root)"
    echo "  --password PASS     Database password (default: changeme)"
    echo "  --database DB       Database name (default: hostel_portal)"
    echo "  --skip-install      Skip MySQL installation, only setup database"
    echo
    echo "Environment variables:"
    echo "  DB_HOST             Database host"
    echo "  DB_PORT             Database port"
    echo "  DB_USER             Database user"
    echo "  DB_PASSWORD         Database password"
    echo "  DB_NAME             Database name"
    echo
    echo "Examples:"
    echo "  sudo $0"
    echo "  sudo $0 --password mysecurepassword"
    echo "  sudo $0 --skip-install  # Only setup database"
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
        --skip-install)
            SKIP_INSTALL=true
            shift
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
