# Student Productivity Hub

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/lati-tibabu/student_productivity_hub)

A comprehensive productivity platform designed to enhance academic performance for students through intelligent task management, AI-powered note-taking, team collaboration, and personalized study planning.

## Key Features

### AI-Powered Note Management

- **Smart Note Creation**: AI-generated notes with structured formatting [1](#0-0)
- **Interactive Note Chat**: AI assistant for note enhancement and Q&A [2](#0-1)
- **Markdown Support**: Rich text editing with math expressions and code highlighting [3](#0-2)
- **PDF Export**: Professional document export with customizable formatting [4](#0-3)

### Task Management

- **Kanban Boards**: Visual task organization with drag-and-drop functionality
- **Smart Deadlines**: Automated deadline tracking with AI recommendations
- **Status Workflows**: Todo → Doing → Done progression with visual indicators

### Team Collaboration

- **Shared Workspaces**: Collaborative project management with role-based permissions
- **Real-time Communication**: Socket.IO powered team discussions and notifications
- **Resource Sharing**: File upload and sharing within teams [5](#0-4)

### Study Planning

- **Interactive Calendar**: Time-block based study scheduling
- **AI Study Plans**: Personalized study recommendations
- **Progress Tracking**: Visual progress monitoring and analytics

### Smart Notifications

- **Real-time Alerts**: Instant notifications for deadlines and team activities [6](#0-5)
- **Background Jobs**: Automated deadline monitoring and study reminders
- **Browser Notifications**: Native desktop alerts for important updates

## Architecture

### Backend

- **Node.js/Express**: RESTful API with comprehensive endpoint coverage [7](#0-6)
- **PostgreSQL**: Robust data persistence with Sequelize ORM
- **Socket.IO**: Real-time communication infrastructure
- **Supabase Storage**: Secure file storage and management

### Frontend

- **React**: Modern component-based UI architecture [8](#0-7)
- **Redux Toolkit**: Centralized state management
- **Tailwind CSS**: Responsive, utility-first styling
- **Vite**: Fast development and optimized builds

### AI Integration

- **Google Gemini**: Advanced AI capabilities for note generation and assistance
- **Structured Responses**: JSON schema enforcement for consistent AI outputs
- **Context-Aware**: AI responses tailored to user content and workspace context

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/lati-tibabu/student_productivity_hub.git
   cd student_productivity_hub
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   # Configure environment variables
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Available Scripts

The project includes several npm scripts to help with development and setup:

#### Root Level Scripts

- **`npm run generate-envs`**: Generates comprehensive `.env` placeholder files in both `frontend/` and `backend/` directories
  - Creates files with detailed comments, sections, and setup instructions for each variable
  - Includes links to service dashboards and configuration guides
  - Use `--force` flag to overwrite existing `.env` files: `npm run generate-envs -- --force`

#### Backend Scripts (`cd backend` first)

- **`npm start`**: Starts the backend server with nodemon for development
- **`npm test`**: Runs tests using Jest

#### Frontend Scripts (`cd frontend` first)

- **`npm run dev`**: Starts the development server with hot reload
- **`npm run build`**: Builds the application for production
- **`npm run preview`**: Previews the production build locally
- **`npm run lint`**: Runs ESLint for code quality checks

### Environment Configuration

**Quick Setup**: Use the provided script to generate comprehensive `.env` files with detailed comments and setup instructions:

```bash
npm run generate-envs
```

The script creates `.env` files with:

- Detailed comments explaining each variable's purpose
- Links to service dashboards for obtaining credentials
- Security best practices and configuration tips
- Organized sections for different types of configuration

Then edit the generated files with your actual values.

#### Frontend (.env in frontend/)

- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_NEWS_API_KEY`: API key for news services
- `VITE_API_URL`: Base URL for the backend API
- `VITE_DEFAULT_GEMINI_MODEL`: Default Gemini model for AI features (gemini-2.5-flash, gemini-2.5-pro, etc.)

#### Backend (.env in backend/)

- `EMAIL_USER`: Email service username
- `EMAIL_PASS`: Email service password
- `FRONTEND_URL`: Frontend application URL
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_PUBLIC_KEY`: Supabase public API key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `DEV_CLIENT_URL`: Development client URL
- `PROD_CLIENT_URL`: Production client URL
- `PROD_GOOGLE_CALLBACK_URL`: Production Google OAuth callback URL
- `GOOGLE_CALLBACK_URL`: Google OAuth callback URL
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `NODE_ENV`: Node.js environment (e.g., development, production)
- `REMOTE_PORT`: Remote database port
- `REMOTE_USER`: Remote database username
- `REMOTE_PASSWORD`: Remote database password
- `REMOTE_DATABASE`: Remote database name
- `REMOTE_HOST`: Remote database host
- `REMOTE_DIALECT`: Remote database dialect (e.g., postgres)
- `JWT_SECRET_KEY`: Secret key for JWT token generation
- `PORT`: Port for the backend server

## Core Functionality

The platform is organized around **Workspaces** - central hubs that contain all project-related content including notes, tasks, study plans, and team collaboration tools. [9](#0-8)

Users can create both individual and team workspaces, with comprehensive permission management and real-time collaboration features.

## Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests to help improve the Student Productivity Hub.

## License

This project is licensed under the MIT License.

**Notes**: The Student Productivity Hub integrates multiple productivity systems into a cohesive platform, with particular emphasis on AI-enhanced learning and collaborative study environments. The modular architecture supports both individual productivity workflows and team-based academic projects.
