# Routes

## Overview

The application uses Express.js routing to organize API endpoints. Routes are modularized by feature and mounted under the `/api` prefix.

## Route Structure

Routes are organized in the following structure:

```bash
routes/
├── index.js           # Main router that mounts all route modules
├── authRoutes.js      # Authentication routes
├── userRoutes.js      # User management routes
├── workspaceRoutes.js # Workspace management routes
├── teamRoutes.js      # Team management routes
├── classroomRoutes.js # Classroom management routes
├── assignmentRoutes.js # Assignment management routes
├── discussionRoutes.js # Discussion routes
├── mindmapRoutes.js   # Mindmap routes
├── mindmapItemRoutes.js # Mindmap item routes
├── roadmapRoutes.js   # Roadmap routes
├── roadmapItemRoutes.js # Roadmap item routes
├── studyPlanRoutes.js # Study plan routes
├── submissionRoutes.js # Submission routes
├── taskRoutes.js      # Task management routes
├── timeBlockRoutes.js # Time block routes
├── todoRoutes.js      # Todo list routes
├── noteRoutes.js      # Note management routes
├── todoItemRoutes.js  # Todo item routes
├── courseRoutes.js    # Course routes
├── userTeamRoutes.js  # User-team relationship routes
├── notificationRoutes.js # Notification routes
├── profileRoutes.js   # User profile routes
├── resourceRoutes.js  # Resource management routes
├── classroomMaterialsRoutes.js # Classroom materials routes
└── search.js          # Search functionality routes
```

## API Endpoints

All routes are prefixed with `/api`. Below is a summary of available endpoints:

### Authentication (`/auth`)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/verify-email` - Email verification
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset

### Users (`/users`)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:id/profile` - Get user profile

### Workspaces (`/workspaces`)
- `GET /workspaces` - Get user's workspaces
- `POST /workspaces` - Create workspace
- `GET /workspaces/:id` - Get workspace details
- `PUT /workspaces/:id` - Update workspace
- `DELETE /workspaces/:id` - Delete workspace
- `POST /workspaces/:id/members` - Add member to workspace

### Teams (`/teams`)
- `GET /teams` - Get user's teams
- `POST /teams` - Create team
- `GET /teams/:id` - Get team details
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team
- `POST /teams/:id/members` - Add member to team

### Tasks (`/tasks`)
- `GET /tasks` - Get user's tasks
- `POST /tasks` - Create task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PUT /tasks/:id/status` - Update task status

### Notes (`/notes`)
- `GET /notes` - Get user's notes
- `POST /notes` - Create note
- `GET /notes/:id` - Get note details
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `POST /notes/:id/chat` - AI chat with note

### Study Plans (`/studyPlans`)
- `GET /studyPlans` - Get study plans
- `POST /studyPlans` - Create study plan
- `GET /studyPlans/:id` - Get study plan details
- `PUT /studyPlans/:id` - Update study plan
- `DELETE /studyPlans/:id` - Delete study plan

### Classrooms (`/classrooms`)
- `GET /classrooms` - Get classrooms
- `POST /classrooms` - Create classroom
- `GET /classrooms/:id` - Get classroom details
- `PUT /classrooms/:id` - Update classroom
- `DELETE /classrooms/:id` - Delete classroom

### Assignments (`/assignments`)
- `GET /assignments` - Get assignments
- `POST /assignments` - Create assignment
- `GET /assignments/:id` - Get assignment details
- `PUT /assignments/:id` - Update assignment
- `DELETE /assignments/:id` - Delete assignment

### Notifications (`/notifications`)
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification

### Resources (`/resources`)
- `GET /resources` - Get resources
- `POST /resources` - Upload resource
- `GET /resources/:id` - Get resource details
- `DELETE /resources/:id` - Delete resource

### Search (`/search`)
- `GET /search` - Global search with query parameters

## Route Middleware

Most routes use the following middleware:

- **Authentication**: JWT token verification
- **Authorization**: Role-based access control
- **Rate Limiting**: Request rate limiting
- **Validation**: Input validation and sanitization
- **Error Handling**: Centralized error handling

## Route Conventions

- RESTful API design principles
- Consistent HTTP status codes
- JSON request/response format
- Proper error messages and validation
- Pagination for list endpoints
- Filtering and sorting capabilities