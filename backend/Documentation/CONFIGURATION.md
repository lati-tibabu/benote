# Configuration

## Overview

The application uses environment variables and configuration files for different deployment environments.

## Environment Variables

### Database Configuration
- `DB_DATABASE` - Development database name
- `DB_USER` - Development database username
- `DB_PASSWORD` - Development database password
- `DB_HOST` - Development database host
- `DB_PORT` - Development database port

- `REMOTE_DATABASE` - Production database name
- `REMOTE_USER` - Production database username
- `REMOTE_PASSWORD` - Production database password
- `REMOTE_HOST` - Production database host
- `REMOTE_PORT` - Production database port
- `REMOTE_DIALECT` - Database dialect (postgres)

### Authentication
- `JWT_SECRET_KEY` - Secret key for JWT token signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL
- `PROD_GOOGLE_CALLBACK_URL` - Production Google OAuth callback URL

### Application
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `FRONTEND_URL` - Frontend application URL
- `DEV_CLIENT_URL` - Development client URL
- `PROD_CLIENT_URL` - Production client URL

### External Services
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_PUBLIC_KEY` - Supabase public API key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Email Configuration
- `EMAIL_USER` - SMTP email username
- `EMAIL_PASS` - SMTP email password

## Configuration Files

### Sequelize Config (`config/config.json`)

```json
{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

**Note:** The config.json is primarily for Sequelize CLI migrations. Runtime database connections use environment variables.

## Environment Detection

The application automatically detects the environment:

```javascript
const environment = process.env.NODE_ENV || "dev";
```

- `dev` - Uses local database configuration
- `production` - Uses remote database with SSL

## SSL Configuration

Production databases require SSL certificates:

- CA certificate loaded from `certificates/ca.pem`
- SSL enabled for remote connections
- Self-signed certificates allowed for development

## Security Best Practices

- **Never commit .env files** to version control
- **Use strong, unique passwords** for all services
- **Rotate secrets regularly** in production
- **Validate environment variables** on startup
- **Use different credentials** for each environment

## Required Environment Variables

### Minimum Required for Development
- `DB_DATABASE`
- `DB_USER`
- `DB_HOST`
- `JWT_SECRET_KEY`
- `PORT`

### Additional for Production
- `REMOTE_DATABASE`
- `REMOTE_USER`
- `REMOTE_PASSWORD`
- `REMOTE_HOST`
- `REMOTE_PORT`
- `SUPABASE_URL`
- `SUPABASE_PUBLIC_KEY`
- `EMAIL_USER`
- `EMAIL_PASS`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Configuration Validation

The application should validate required environment variables on startup and provide clear error messages for missing configuration.