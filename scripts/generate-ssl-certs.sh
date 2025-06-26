#!/bin/bash

# Configuration
DOMAIN="localhost"
COUNTRY="US"
STATE="California"
LOCALITY="San Francisco"
ORGANIZATION="AutoVault Development"
ORGANIZATIONAL_UNIT="Engineering"
EMAIL="dev@autovault.com"
SSL_DIR="nginx/ssl"

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

echo "Generating SSL certificates for development..."

# Generate private key
openssl genrsa -out $SSL_DIR/server.key 2048

# Generate CSR (Certificate Signing Request)
openssl req -new -key $SSL_DIR/server.key -out $SSL_DIR/server.csr -subj "/C=$COUNTRY/ST=$STATE/L=$LOCALITY/O=$ORGANIZATION/OU=$ORGANIZATIONAL_UNIT/CN=$DOMAIN/emailAddress=$EMAIL"

# Generate self-signed certificate
openssl x509 -req -days 365 -in $SSL_DIR/server.csr -signkey $SSL_DIR/server.key -out $SSL_DIR/server.crt

# Generate DH parameters
openssl dhparam -out $SSL_DIR/dhparam.pem 2048

# Set appropriate permissions
chmod 600 $SSL_DIR/server.key
chmod 600 $SSL_DIR/server.crt
chmod 600 $SSL_DIR/dhparam.pem

# Remove CSR as it's no longer needed
rm $SSL_DIR/server.csr

echo "SSL certificates generated successfully!"
echo "Location: $SSL_DIR/"
echo "Files created:"
echo "  - server.key (private key)"
echo "  - server.crt (certificate)"
echo "  - dhparam.pem (DH parameters)"
echo ""
echo "Note: These certificates are self-signed and should only be used for development."
