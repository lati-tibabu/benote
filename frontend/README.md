# Benote - Frontend

The frontend component of the Benote, built with React and modern web technologies. This responsive web application provides an intuitive interface for task management, AI-powered note-taking, team collaboration, and study planning.

## Features

- **Modern React Architecture**: Component-based UI with hooks and functional components
- **State Management**: Redux Toolkit for centralized state management with persistence
- **Responsive Design**: Mobile-first design with Tailwind CSS and DaisyUI
- **Real-time Updates**: Socket.IO integration for live notifications and collaboration
- **AI Integration**: Google Gemini API for intelligent note generation and assistance
- **Rich Text Editing**: Markdown support with math expressions (KaTeX) and code highlighting
- **File Management**: PDF processing, document conversion, and secure file uploads
- **Authentication**: Google OAuth integration with JWT token management
- **PWA Support**: Progressive Web App capabilities for offline functionality

## Tech Stack

- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit with Redux Persist
- **Styling**: Tailwind CSS with DaisyUI components
- **Routing**: React Router DOM v7
- **Build Tool**: Vite
- **AI Integration**: Google Generative AI
- **Real-time**: Socket.IO Client
- **Charts**: Recharts
- **PDF Processing**: PDF-lib, html2pdf.js, pdf-parse
- **Markdown**: React Markdown with syntax highlighting
- **Math Rendering**: KaTeX with remark-math
- **File Conversion**: Mammoth (Word docs), html2canvas
- **Notifications**: React Toastify with browser notifications
- **Drag & Drop**: React Beautiful DnD

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the frontend directory with the following variables:

   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   VITE_NEWS_API_KEY=your_news_api_key
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`.

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality checks

## Project Structure

```
frontend/
├── public/              # Static assets and PWA files
├── src/
│   ├── assets/          # Images, icons, and other assets
│   ├── components/      # Reusable React components
│   │   ├── _discussion/ # Discussion-related components
│   │   ├── _footers/    # Footer components
│   │   ├── _notes/      # Note-related components
│   │   ├── _tasks/      # Task management components
│   │   └── _workspaces/ # Workspace components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components organized by feature
│   │   ├── app/         # Main application pages
│   │   ├── auth/        # Authentication pages
│   │   ├── dashboard/   # Dashboard and workspace pages
│   │   ├── ErrorPages/  # Error handling pages
│   │   └── InfoPages/   # Information pages
│   ├── redux/           # Redux store configuration
│   │   ├── slices/      # Redux slices for state management
│   │   └── store.js     # Redux store setup
│   ├── routers/         # Route definitions and guards
│   ├── utils/           # Utility functions and helpers
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Application entry point
├── docs/                # Technical documentation
└── package.json         # Dependencies and scripts
```

## Key Components

### Core Features

- **Dashboard**: Central hub with workspace overview and quick actions
- **Workspaces**: Collaborative project spaces with tasks, notes, and team management
- **Notes**: AI-powered note-taking with markdown support and PDF export
- **Tasks**: Kanban-style task management with drag-and-drop functionality
- **Teams**: Team collaboration with discussions and shared resources
- **Study Plans**: Personalized study scheduling with calendar integration
- **Notifications**: Real-time notifications and browser alerts

### Authentication Flow

- Google OAuth integration
- JWT token management
- Protected routes with role-based access
- Password reset and email verification

## Documentation

Comprehensive technical documentation is available in the [`docs/`](docs/) directory:

- [Architecture](docs/architecture.md) - Application architecture and patterns
- [Components](docs/components.md) - Component structure and reusable patterns
- [State Management](docs/state-management.md) - Redux store and slices
- [Routing](docs/routing.md) - Navigation and route protection
- [Authentication](docs/authentication.md) - Auth flow and implementation
- [API Integration](docs/api-integration.md) - Backend communication patterns
- [Styling](docs/styling.md) - Tailwind CSS and design system
- [Deployment](docs/deployment.md) - Build and deployment process
- [Testing](docs/testing.md) - Testing strategies and setup
- [Hooks](docs/hooks.md) - Custom React hooks
- [Utils](docs/utils.md) - Utility functions and helpers

### Refactoring Documentation

Documentation about the feature-based architecture refactoring:

- [Refactoring Overview](docs/refactoring/README.md) - Overview of the refactoring process
- [Quick Reference](docs/refactoring/QUICK_REFERENCE.md) - Quick guide for developers
- [Architecture Comparison](docs/refactoring/ARCHITECTURE_COMPARISON.md) - Before/after comparison
- [Detailed Guide](docs/refactoring/REFACTORING.md) - Complete refactoring documentation

### API Documentation

Detailed API integration docs in [`docs/API/`](docs/API/):

- [Endpoints](docs/API/endpoints.md) - Complete API reference
- [Authentication](docs/API/authentication-api.md) - Auth API integration
- [User Management](docs/API/user-api.md) - User profile and settings
- [Workspaces](docs/API/workspace-api.md) - Workspace operations
- [Tasks](docs/API/tasks-api.md) - Task management
- [Teams](docs/API/teams-api.md) - Team collaboration
- [File Upload](docs/API/file-upload-api.md) - File handling
- [Notifications](docs/API/notifications-api.md) - Real-time notifications
- [Search](docs/API/search-api.md) - Global search functionality

## Development Guidelines

### Code Style

- Use functional components with hooks
- Follow React best practices and ESLint rules
- Use TypeScript for type safety (planned)
- Maintain consistent naming conventions
- Write descriptive commit messages

### Component Patterns

- Use custom hooks for shared logic
- Implement proper error boundaries
- Optimize with React.memo for expensive components
- Use Redux for global state, local state for component-specific data

### Styling

- Use Tailwind CSS utility classes
- Leverage DaisyUI components for consistency
- Maintain responsive design principles
- Support both light and dark themes

## Contributing

When contributing to the frontend:

1. Follow the established component patterns and architecture
2. Add comprehensive documentation for new features
3. Ensure responsive design and accessibility
4. Test components across different browsers and devices
5. Update relevant documentation files

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License.
