#!/bin/bash

# Configuration
ENV_FILE=".env"
ENV_EXAMPLE_FILE=".env.example"
ENV_TEMPLATE_FILE=".env.template"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to generate a random string
generate_random_string() {
    openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c $1
}

# Function to prompt for value with default
prompt_with_default() {
    local prompt=$1
    local default=$2
    local value

    echo -n "$prompt [$default]: "
    read value
    echo ${value:-$default}
}

# Create environment template file
create_env_template() {
    cat << EOF > $ENV_TEMPLATE_FILE
# Application
NODE_ENV=development
PORT=3000
APP_NAME=AutoVault
APP_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/autovault
MONGODB_USER=
MONGODB_PASS=

# Session
SESSION_SECRET=

# JWT
JWT_SECRET=
JWT_EXPIRY=1d

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@example.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASS=

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,pdf

# API Keys
GOOGLE_MAPS_API_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined

# Company Info
COMPANY_NAME=AutoVault
COMPANY_EMAIL=info@example.com
COMPANY_PHONE=+1234567890
COMPANY_ADDRESS=123 Main St, City, Country
EOF

    echo "Created environment template file: $ENV_TEMPLATE_FILE"
}

# Create example environment file
create_env_example() {
    cat << EOF > $ENV_EXAMPLE_FILE
# Application
NODE_ENV=development
PORT=3000
APP_NAME=AutoVault
APP_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/autovault
MONGODB_USER=dbuser
MONGODB_PASS=dbpassword

# Session
SESSION_SECRET=your-session-secret

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=1d

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@example.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASS=your-redis-password

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,pdf

# API Keys
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined

# Company Info
COMPANY_NAME=AutoVault
COMPANY_EMAIL=info@example.com
COMPANY_PHONE=+1234567890
COMPANY_ADDRESS=123 Main St, City, Country
EOF

    echo "Created example environment file: $ENV_EXAMPLE_FILE"
}

# Backup existing environment file
backup_env() {
    if [ -f $ENV_FILE ]; then
        cp $ENV_FILE "${ENV_FILE}.backup_${TIMESTAMP}"
        echo "Backed up existing environment file to: ${ENV_FILE}.backup_${TIMESTAMP}"
    fi
}

# Generate new environment file
generate_env() {
    echo "Generating new environment file..."
    
    # Application
    echo "# Application" > $ENV_FILE
    echo "NODE_ENV=$(prompt_with_default 'Node environment' 'development')" >> $ENV_FILE
    echo "PORT=$(prompt_with_default 'Port' '3000')" >> $ENV_FILE
    echo "APP_NAME=$(prompt_with_default 'Application name' 'AutoVault')" >> $ENV_FILE
    echo "APP_URL=$(prompt_with_default 'Application URL' 'http://localhost:3000')" >> $ENV_FILE
    echo "" >> $ENV_FILE

    # Database
    echo "# Database" >> $ENV_FILE
    echo "MONGODB_URI=$(prompt_with_default 'MongoDB URI' 'mongodb://localhost:27017/autovault')" >> $ENV_FILE
    echo "MONGODB_USER=$(prompt_with_default 'MongoDB user' '')" >> $ENV_FILE
    echo "MONGODB_PASS=$(prompt_with_default 'MongoDB password' '')" >> $ENV_FILE
    echo "" >> $ENV_FILE

    # Session & JWT
    echo "# Security" >> $ENV_FILE
    echo "SESSION_SECRET=$(generate_random_string 32)" >> $ENV_FILE
    echo "JWT_SECRET=$(generate_random_string 32)" >> $ENV_FILE
    echo "JWT_EXPIRY=$(prompt_with_default 'JWT expiry' '1d')" >> $ENV_FILE
    echo "" >> $ENV_FILE

    # Email
    echo "# Email" >> $ENV_FILE
    echo "SMTP_HOST=$(prompt_with_default 'SMTP host' 'smtp.example.com')" >> $ENV_FILE
    echo "SMTP_PORT=$(prompt_with_default 'SMTP port' '587')" >> $ENV_FILE
    echo "SMTP_USER=$(prompt_with_default 'SMTP user' '')" >> $ENV_FILE
    echo "SMTP_PASS=$(prompt_with_default 'SMTP password' '')" >> $ENV_FILE
    echo "SMTP_FROM=$(prompt_with_default 'SMTP from address' 'noreply@example.com')" >> $ENV_FILE
    echo "" >> $ENV_FILE

    # Redis
    echo "# Redis" >> $ENV_FILE
    echo "REDIS_HOST=$(prompt_with_default 'Redis host' 'localhost')" >> $ENV_FILE
    echo "REDIS_PORT=$(prompt_with_default 'Redis port' '6379')" >> $ENV_FILE
    echo "REDIS_PASS=$(prompt_with_default 'Redis password' '')" >> $ENV_FILE
    echo "" >> $ENV_FILE

    echo "Generated new environment file: $ENV_FILE"
}

# Validate environment file
validate_env() {
    local errors=0
    
    # Required variables
    required_vars=(
        "NODE_ENV"
        "PORT"
        "MONGODB_URI"
        "SESSION_SECRET"
        "JWT_SECRET"
    )
    
    echo "Validating environment file..."
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" $ENV_FILE || [ -z "$(grep "^${var}=" $ENV_FILE | cut -d'=' -f2)" ]; then
            echo "Error: Missing or empty required variable: $var"
            errors=$((errors + 1))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        echo "Environment file validation successful!"
        return 0
    else
        echo "Found $errors error(s) in environment file"
        return 1
    fi
}

# Main script
case "$1" in
    "init")
        create_env_template
        create_env_example
        backup_env
        generate_env
        validate_env
        ;;
    "validate")
        validate_env
        ;;
    "template")
        create_env_template
        ;;
    "example")
        create_env_example
        ;;
    "backup")
        backup_env
        ;;
    *)
        echo "Usage: $0 {init|validate|template|example|backup}"
        echo "  init      - Initialize new environment files"
        echo "  validate  - Validate existing environment file"
        echo "  template  - Create environment template file"
        echo "  example   - Create example environment file"
        echo "  backup    - Backup existing environment file"
        exit 1
        ;;
esac
