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
    content: `# Frontend environment variables (placeholders)
# Replace the values with your actual keys/URLs
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_NEWS_API_KEY=your_news_api_key
VITE_API_URL=http://localhost:3000
`
  },
  {
    dir: path.join(root, 'backend'),
    name: '.env',
    content: `# Backend environment variables (placeholders)
# Replace the values with your actual credentials and secrets
EMAIL_USER=your_email_service_username
EMAIL_PASS=your_email_service_password
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLIC_KEY=your_supabase_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DEV_CLIENT_URL=http://localhost:5173
PROD_CLIENT_URL=your_production_frontend_url
PROD_GOOGLE_CALLBACK_URL=your_production_google_callback_url
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
NODE_ENV=development
REMOTE_PORT=5432
REMOTE_USER=your_db_username
REMOTE_PASSWORD=your_db_password
REMOTE_DATABASE=your_db_name
REMOTE_HOST=your_db_host
REMOTE_DIALECT=postgres
JWT_SECRET_KEY=your_jwt_secret_key
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
