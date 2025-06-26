#!/bin/bash

# Configuration
APP_NAME="autovault"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
    echo "Development Utility Script"
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup       - Initial project setup"
    echo "  start       - Start development server"
    echo "  test        - Run tests"
    echo "  lint        - Run linter"
    echo "  format      - Format code"
    echo "  docs        - Generate documentation"
    echo "  clean       - Clean project"
    echo "  deps        - Check dependencies"
    echo "  docker      - Manage Docker environment"
    echo "  ssl         - Generate SSL certificates"
    echo "  db         - Database operations"
    echo "  help       - Show this help message"
}

# Function to log messages
log() {
    local level=$1
    local message=$2
    case $level in
        "info")
            echo -e "${GREEN}[INFO]${NC} $message"
            ;;
        "warn")
            echo -e "${YELLOW}[WARN]${NC} $message"
            ;;
        "error")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
}

# Function to check prerequisites
check_prerequisites() {
    log "info" "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log "error" "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log "error" "npm is not installed"
        exit 1
    }
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log "warn" "Docker is not installed"
    fi
    
    # Check MongoDB
    if ! command -v mongosh &> /dev/null; then
        log "warn" "MongoDB shell is not installed"
    fi
}

# Function to setup project
setup_project() {
    log "info" "Setting up project..."
    
    # Initialize environment
    ./scripts/setup-env.sh init
    
    # Install dependencies
    npm install
    
    # Generate SSL certificates
    ./scripts/generate-ssl-certs.sh
    
    # Initialize database
    ./scripts/init-db.js
    
    log "info" "Project setup completed"
}

# Function to start development server
start_dev() {
    log "info" "Starting development server..."
    
    # Check if port is in use
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        log "error" "Port 3000 is already in use"
        exit 1
    fi
    
    # Start server
    npm run dev
}

# Function to run tests
run_tests() {
    local test_type=$1
    
    case $test_type in
        "unit")
            log "info" "Running unit tests..."
            npm run test:unit
            ;;
        "integration")
            log "info" "Running integration tests..."
            npm run test:integration
            ;;
        "e2e")
            log "info" "Running end-to-end tests..."
            npm run test:e2e
            ;;
        *)
            log "info" "Running all tests..."
            npm test
            ;;
    esac
}

# Function to run linter
run_lint() {
    log "info" "Running linter..."
    npm run lint
}

# Function to format code
format_code() {
    log "info" "Formatting code..."
    npm run format
}

# Function to generate documentation
generate_docs() {
    log "info" "Generating documentation..."
    npm run docs
}

# Function to clean project
clean_project() {
    log "info" "Cleaning project..."
    
    # Remove build artifacts
    rm -rf dist build coverage
    
    # Remove dependencies
    rm -rf node_modules
    
    # Clean Docker
    docker-compose down -v
    
    # Remove logs
    rm -rf logs/*
    touch logs/.gitkeep
    
    # Remove uploads
    rm -rf uploads/*
    touch uploads/.gitkeep
    
    log "info" "Project cleaned"
}

# Function to check dependencies
check_deps() {
    log "info" "Checking dependencies..."
    
    # Check for outdated packages
    npm outdated
    
    # Check for vulnerabilities
    npm audit
    
    # Check package-lock.json
    if [ ! -f package-lock.json ]; then
        log "warn" "package-lock.json not found"
    fi
}

# Function to manage Docker environment
manage_docker() {
    local action=$1
    
    case $action in
        "up")
            log "info" "Starting Docker containers..."
            docker-compose up -d
            ;;
        "down")
            log "info" "Stopping Docker containers..."
            docker-compose down
            ;;
        "restart")
            log "info" "Restarting Docker containers..."
            docker-compose restart
            ;;
        "logs")
            log "info" "Showing Docker logs..."
            docker-compose logs -f
            ;;
        *)
            log "error" "Invalid Docker command"
            exit 1
            ;;
    esac
}

# Function to manage database
manage_db() {
    local action=$1
    
    case $action in
        "backup")
            log "info" "Backing up database..."
            ./scripts/backup-db.sh
            ;;
        "restore")
            log "info" "Restoring database..."
            if [ -z "$2" ]; then
                log "error" "Please specify backup file"
                exit 1
            fi
            ./scripts/backup-db.sh restore "$2"
            ;;
        "seed")
            log "info" "Seeding database..."
            node scripts/init-db.js
            ;;
        *)
            log "error" "Invalid database command"
            exit 1
            ;;
    esac
}

# Main script
case "$1" in
    "setup")
        check_prerequisites
        setup_project
        ;;
    "start")
        start_dev
        ;;
    "test")
        run_tests "$2"
        ;;
    "lint")
        run_lint
        ;;
    "format")
        format_code
        ;;
    "docs")
        generate_docs
        ;;
    "clean")
        clean_project
        ;;
    "deps")
        check_deps
        ;;
    "docker")
        manage_docker "$2"
        ;;
    "db")
        manage_db "$2" "$3"
        ;;
    "help"|"")
        show_help
        ;;
    *)
        log "error" "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
