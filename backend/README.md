# Student Productivity Hub - Backend

The backend component of the Student Productivity Hub, built with Node.js and Express.js. This API server provides comprehensive endpoints for task management, AI-powered note-taking, team collaboration, study planning, and more.

## Features

- **RESTful API**: Complete API coverage for all platform features
- **Real-time Communication**: Socket.IO integration for live updates
- **Authentication**: JWT-based auth with Google OAuth support
- **Database**: PostgreSQL with Sequelize ORM
- **File Storage**: Supabase integration for secure file uploads
- **AI Integration**: Google Gemini API for intelligent features
- **Notifications**: Automated email and real-time notifications
- **Rate Limiting**: Protection against abuse with express-rate-limit

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: Passport.js with JWT and Google OAuth
- **Real-time**: Socket.IO
- **File Storage**: Supabase
- **Email**: Nodemailer
- **Scheduling**: Node-cron
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Google Gemini API key (optional, for AI features)

### Installation

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the backend directory with the following variables:

   ```env
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
   ```

4. **Database Setup**

   Run the database migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000` (or the port specified in your `.env`).

## API Documentation

Comprehensive API documentation is available in the [`docs/API/`](docs/API/) directory, including:

- Authentication endpoints
- User management
- Workspace operations
- Task management
- Team collaboration
- Study planning
- Classroom features
- And more...

## Project Structure

```
backend/
├── api/                 # API route handlers
├── config/              # Configuration files
├── controllers/         # Request handlers
├── cron/                # Scheduled jobs
├── docs/                # Documentation
├── middlewares/         # Custom middleware
├── migrations/          # Database migrations
├── models/              # Sequelize models
├── routes/              # Route definitions
├── services/            # Business logic services
├── tests/               # Test files
├── utils/               # Utility functions
├── app.js               # Express app configuration
├── server.js            # Server entry point
└── package.json         # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start the development server with nodemon
- `npm test` - Run tests with Jest

## Documentation

Detailed technical documentation is available in the [`docs/`](docs/) directory:

- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [Models](docs/MODELS.md)
- [Routes](docs/ROUTES.md)
- [Middleware](docs/MIDDLEWARE.md)
- [Services](docs/SERVICES.md)
- [Configuration](docs/CONFIGURATION.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Testing](docs/TESTING.md)

## Contributing

When contributing to the backend:

1. Follow the existing code structure and patterns
2. Add appropriate tests for new features
3. Update documentation for any changes
4. Ensure all tests pass before submitting

## License

This project is licensed under the MIT License.
