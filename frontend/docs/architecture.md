# Frontend Architecture

## Overview

The Student Productivity Hub frontend is a single-page application (SPA) built with React 18, utilizing modern web development practices for optimal performance and maintainability.

## Technology Stack

### Core Framework

- **React 18**: Component-based UI library with hooks and concurrent features
- **Vite**: Fast build tool and development server
- **React Router v7**: Client-side routing with nested routes

### State Management

- **Redux Toolkit**: Simplified Redux with RTK Query for API state
- **Redux Persist**: Local storage persistence for critical state

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library built on Tailwind
- **PostCSS**: CSS processing with autoprefixer

### API Integration

- **Axios**: HTTP client for API requests
- **Socket.io Client**: Real-time communication

### Additional Libraries

- **Google Generative AI**: AI-powered features
- **React OAuth Google**: Google authentication
- **React Markdown**: Markdown rendering with syntax highlighting
- **Recharts**: Data visualization
- **PDF-lib**: PDF generation and manipulation

## Application Structure

```text
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── redux/              # State management
│   ├── slices/         # Redux slices
│   ├── store.js        # Store configuration
│   └── rootReducer.js  # Combined reducers
├── routers/            # Route definitions
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Key Architectural Patterns

### Component Architecture

- Functional components with hooks
- Container/Presentational pattern where appropriate
- Custom hooks for shared logic

### State Management Patterns

- Global state in Redux for user data, app settings
- Local state with useState for component-specific data
- Persisted state for authentication and preferences

### API Layer

- Axios instances configured for different environments
- Centralized error handling
- Request/response interceptors

### Routing

- Nested routes for dashboard sections
- Protected routes with authentication guards
- Lazy loading for performance

## Performance Optimizations

- Code splitting with React.lazy()
- Memoization with React.memo and useMemo
- Virtual scrolling for large lists
- Image optimization and lazy loading

## Development Workflow

- ESLint for code quality
- Hot module replacement in development
- Progressive Web App (PWA) capabilities
- Environment-based configuration