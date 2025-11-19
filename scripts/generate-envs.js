#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const force = args.includes('--force');

const root = path.resolve(__dirname, '..');

const files = [
  {
    dir: path.join(root, 'frontend'),
    name: '.env',
    content: `# Frontend Environment Variables Configuration
# ============================================
# This file contains environment variables for the Student Productivity Hub frontend.
# Replace all placeholder values with your actual credentials and configuration.
# NEVER commit this file to version control - it contains sensitive information.

# Google OAuth Configuration
# =========================
# Required for Google authentication
# Create credentials at: https://console.developers.google.com/
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id

# News API Configuration
# =====================
# API key for fetching news content (optional feature)
# Get your key from: https://newsapi.org/
VITE_NEWS_API_KEY=your_news_api_key

# Backend API Configuration
# ========================
# URL where the backend API server is running
VITE_API_URL=http://localhost:3000
`
  },
  {
    dir: path.join(root, 'backend'),
    name: '.env',
    content: `# Backend Environment Variables Configuration
# ===========================================
# This file contains all environment variables needed for the Student Productivity Hub backend.
# Replace all placeholder values with your actual credentials and configuration.
# NEVER commit this file to version control - it contains sensitive information.

# Email Configuration
# ===================
# Used for sending notifications, password resets, and user verification emails
# You can use services like Gmail, SendGrid, Mailgun, etc.
EMAIL_USER=your_email_service_username
EMAIL_PASS=your_email_service_password
EMAIL_SERVICE=your_email_service_provider

# Frontend URLs
# =============
# URLs where the frontend application is hosted
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
# =====================
# Supabase is used for file storage and real-time features
# Get these values from your Supabase project dashboard at https://supabase.com
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLIC_KEY=your_supabase_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OAuth Client URLs
# =================
# URLs for OAuth callbacks and client applications
DEV_CLIENT_URL=http://localhost:5173
PROD_CLIENT_URL=your_production_frontend_url

# Google OAuth Configuration
# =========================
# Required for Google authentication
# Create credentials at: https://console.developers.google.com/
# Add authorized redirect URIs for both development and production
PROD_GOOGLE_CALLBACK_URL=your_production_google_callback_url
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CLIENT_ID=your_google_client_id

# Application Environment
# =======================
# Set to 'development' for local development, 'production' for deployed app
NODE_ENV=development

# Database Configuration (Remote/Production)
# ==========================================
# PostgreSQL database connection settings
# For production deployment or remote database
REMOTE_PORT=5432
REMOTE_USER=your_db_username
REMOTE_PASSWORD=your_db_password
REMOTE_DATABASE=your_db_name
REMOTE_HOST=your_db_host
REMOTE_DIALECT=postgres

# Database Configuration (Local Development)
# ==========================================
# Alternative database settings for local development
# Use these if you have a different local database setup
DB_PORT=5432
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name
DB_HOST=your_db_host
DB_DIALECT=postgres

# JWT Configuration
# =================
# Secret key for signing and verifying JSON Web Tokens
# Generate a strong, random secret key (at least 32 characters)
# You can use: openssl rand -base64 32
JWT_SECRET_KEY=your_jwt_secret_key

# Server Configuration
# ====================
# Port where the backend server will listen
PORT=3000
`
  }
];

files.forEach(({dir, name, content}) => {
  try {
    if (!fs.existsSync(dir)) {
      console.error(`Directory not found: ${dir}`);
      return;
    }

    const filePath = path.join(dir, name);
    if (fs.existsSync(filePath) && !force) {
      console.log(`Skipping existing file: ${filePath} (use --force to overwrite)`);
      return;
    }

    fs.writeFileSync(filePath, content, { encoding: 'utf8', flag: 'w' });
    console.log(`Wrote ${filePath}`);
  } catch (err) {
    console.error(`Failed writing ${name} in ${dir}:`, err.message);
  }
});

console.log('\nDone. Use `node scripts/generate-envs.js --force` to overwrite existing files.');
