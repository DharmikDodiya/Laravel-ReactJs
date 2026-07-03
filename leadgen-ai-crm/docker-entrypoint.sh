#!/bin/bash

# Clear caches to avoid old configuration issues
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Cache configuration for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
# WARNING: If you are using multiple instances, this might run concurrently.
# It is often safer to run this as a separate deploy command on Render, 
# but for a simple setup, it can go here.
php artisan migrate --force

# Execute the CMD passed by the Dockerfile
exec "$@"
