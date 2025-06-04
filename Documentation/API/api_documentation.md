## Authentication Routes (`/api/auth`)

The authentication system is configured through dedicated routes that handle login, OAuth, and password management operations.

### Route Configuration

The main authentication routes are registered in the application: index.js:57

### Core Authentication Endpoints

#### 1. Email/Password Login

- **Endpoint**: `POST /api/auth`
- **Handler**: `authController.loginUser`
- **Purpose**: Validates user credentials and generates JWT tokens authRoutes.js:8

The login process validates credentials using bcrypt and generates a 30-day JWT token: authController.js:9-39

#### 2. Google OAuth Integration

- **Initiation**: `GET /api/auth/google`
- **Callback**: `GET /api/auth/google/callback`
- **Scope**: Profile and email access authRoutes.js:11-35

The OAuth flow redirects users to a loading page with the JWT token as a query parameter for frontend processing.

#### 3. Password Reset Flow

- **Request Reset**: `POST /api/auth/forgot-password`
- **Complete Reset**: `PUT /api/auth/reset-password` authRoutes.js:37-38

## Logout Endpoint

The logout functionality is implemented as a standalone endpoint that handles JWT token invalidation.

### Logout Configuration

- **Endpoint**: `POST /api/logout`
- **Handler**: `logoutController` from authMiddleware index.js:59

The logout controller is imported from the authentication middleware: index.js:29

## JWT-Based Authentication System

### Token Generation and Management

The system generates JWT tokens with user identification data and a 30-day expiration: authController.js:20-28

### Frontend Token Handling

The frontend stores JWT tokens in localStorage with expiration timestamps: login.jsx:40-46

For OAuth flows, tokens are processed through a dedicated loading component: auth-loading.jsx:16-28

### Middleware Protection

Protected routes implement authentication middleware to validate JWT tokens. Examples include:

#### User Routes ProtectionuserRoutes.js:11

#### Task Routes ProtectiontaskRoutes.js:8

#### Notification Routes ProtectionnotificationRoutes.js:7

#### Profile Routes ProtectionprofileRoutes.js:8

## Security Features

### Password Security

- **Hashing**: Uses bcrypt with salt rounds for secure password storage
- **Validation**: Client-side and server-side password strength requirements
- **Reset Tokens**: Time-limited tokens for password reset operations

### Rate Limiting

The system includes rate limiting middleware for authentication endpoints to prevent brute force attacks, though it's currently commented out: authRoutes.js:7

### Token Validation

All protected endpoints validate JWT tokens through the `authMiddleware.authMiddleware` function, ensuring only authenticated users can access secured resources.

## Integration with Application Architecture

The authentication system integrates seamlessly with the Express.js application structure: app.js:9-17

The passport middleware is initialized for OAuth handling, and all API routes are protected under the `/api` prefix with authentication middleware applied selectively based on endpoint requirements.

# User Management Documentation

## Overview

The User Management system provides comprehensive user lifecycle management including registration, email verification, profile updates, password management, and account deletion. The system integrates with email services for verification workflows and implements secure authentication patterns.

## Base Route Configuration

The user management routes are registered in the main router: index.js:33

## User Creation and Registration

### Registration Process

User creation is handled through the `createUser` function which implements a comprehensive registration workflow with automatic email verification: userControllers.js:6-18

The registration process includes:

- **Password Security**: Uses bcrypt with salt factor 10 for secure password hashing
- **Token Generation**: Creates a 6-digit random verification token
- **User Role Assignment**: Defaults to "user" role for new registrations

### Email Verification Integration

The system automatically sends verification emails upon user creation: userControllers.js:19-34

Key features:

- **Verification Link**: Generates frontend URL with user ID and token parameters
- **Email Content**: Includes both clickable link and manual token entry option
- **Rollback Protection**: Destroys user record if email sending fails
- **Error Handling**: Returns specific error messages for email delivery failures

### Frontend Registration Interface

The signup component provides a comprehensive registration form with validation: signup.jsx:27-48

Features include:

- **Form Validation**: Real-time email and password validation
- **Password Strength**: Enforces complex password requirements
- **Success Modal**: Displays confirmation dialog upon successful registration
- **Error Handling**: Shows server-side error messages to users

## Email Verification System

### Verification Process

The verification system validates tokens and activates user accounts: userControllers.js:47-65

The verification workflow:

1. **Token Validation**: Compares provided token with stored verification token
2. **Account Activation**: Sets `is_verified` to true and clears verification token
3. **Error Handling**: Returns appropriate error messages for invalid tokens or missing users

### Frontend Verification Interface

The verification component handles both URL parameter and manual token entry: verify-user.jsx:37-55

### Token Regeneration

Users can request new verification tokens through the regeneration system: userControllers.js:68-95

## User Profile Management

### Profile Updates

The system supports comprehensive profile updates through the `updateUser` function: userControllers.js:138-193

### Password Management

Password updates include security validations:

- **Current Password Verification**: Uses bcrypt to verify existing password
- **OAuth Protection**: Prevents password changes for Google-authenticated users
- **Password Confirmation**: Ensures new password matches confirmation
- **Secure Hashing**: Generates new salt and hash for updated passwords

### Frontend Profile Interface

The profile component provides comprehensive user information management: index.jsx:127-155

## User Data Retrieval

### User Lookup Operations

The system provides multiple user data access patterns:

- **Individual User**: Lookup by ID for profile access
- **Email Lookup**: Find users by email address for authentication
- **User Overview**: Comprehensive data including relationships and activity

### User Overview Data

The `getUserOverview` function provides complete user context including workspaces, teams, notifications, and tasks through Sequelize associations.

## Route Structure and Security

### Protected Routes

User management routes implement selective authentication middleware: userRoutes.js:7-24

Key endpoints:

- **POST /api/users**: User registration (public)
- **GET /api/users/verify/:userId/:token**: Email verification (public)
- **PUT /api/users**: Profile updates (protected)
- **DELETE /api/users**: Account deletion (protected)
- **GET /api/users/overview/fetch**: User data overview (protected)

### Email Service Integration

The system integrates with a dedicated email service for all user communications: userControllers.js:277-288

## User Model Schema

The user model defines the complete database schema for user management: user.js:104-140

Key fields include:

- **Authentication**: Email (unique), password_hash, verification tokens
- **Profile**: Name, role, verification status
- **Security**: Forgot password tokens with expiration
- **Management**: Soft delete flag, timestamps

## Password Reset Workflow

### Reset Request Process

The password reset system generates secure tokens with expiration: authController.js:42-64

### Reset Completion

Password reset completion validates tokens and updates passwords: authController.js:66-100

### Frontend Reset Interface

The reset password component handles the complete reset workflow: reset-password.jsx:25-67

# Workspace Management Documentation

## Overview

The Workspace Management system provides comprehensive workspace lifecycle management including creation, membership control, team-based access, and AI-powered analytics. Workspaces serve as organizational containers for tasks, notes, todos, study plans, and other productivity content with sophisticated role-based access control.

## Base Route Configuration

The workspace management routes are registered in the main router: index.js:34

## Workspace CRUD Operations

### Route Structure and Authentication

All workspace routes require authentication middleware protection: workspaceRoutes.js:7

The complete route structure includes: workspaceRoutes.js:9-18

### Workspace Creation

Workspace creation follows a transactional pattern ensuring proper membership assignment: workspaceControllers.js:15-30

Key features:

- **Automatic Admin Assignment**: Creator receives admin role automatically
- **UUID Generation**: Uses UUID v4 for unique workspace identification
- **Membership Creation**: Creates initial workspace_membership record

### Frontend Workspace Creation

The frontend creation process handles both individual and team-based workspaces: add_new.jsx:56-75

For team workspaces, additional membership logic applies: add_new.jsx:77-110

### Workspace Data Retrieval

The system provides multiple data access patterns for workspace content: workspaceControllers.js:285-334

This includes comprehensive content aggregation with tasks, todos, and time blocks for workspace analytics.

### Workspace Updates and Deletion

Workspace modifications require admin role verification: workspaceControllers.js:492-517

Deletion follows similar admin-only access patterns: workspaceControllers.js:521-548

## Membership Management with Team-Based Access Control

### Dual Membership System

The workspace system supports both direct user membership and team-based membership through the `giveUserMembership` function: workspaceControllers.js:33-101

### Access Validation

Workspace access validation implements comprehensive membership checking: workspaceControllers.js:427-458

The system checks both direct user membership and team-based access through team membership resolution.

### Workspace Data Model

The workspace model defines relationships supporting team-based collaboration: workspace.js:10-36

Key relationships include:

- **User Ownership**: `belongsTo` user as creator
- **Team Association**: Optional `belongsTo` team relationship
- **Content Associations**: Links to tasks, todos, time blocks, and roadmaps
- **Membership Management**: `hasMany` workspace_membership records

### Complex Membership Resolution

The `readWorkspaces` function demonstrates sophisticated membership resolution combining direct and team-based access: workspaceControllers.js:156-186

This includes deduplication logic to prevent duplicate workspace access through multiple membership paths: workspaceControllers.js:264-279

## AI-Powered Workspace Summaries and Analytics

### Frontend AI Integration

The workspace overview component integrates Google Gemini AI for workspace analytics: overview.jsx:25-31

### Workspace Analytics Data

The system provides comprehensive workspace data for AI analysis through the `readWorkspacesData` endpoint, which aggregates:

- Task statistics with status and due date information
- Todo completion metrics
- Time block scheduling data
- Workspace activity patterns

### Last Access Tracking

The system tracks workspace usage for analytics: workspaceControllers.js:480-482

### Frontend Workspace Interface

The main workspace interface provides comprehensive management capabilities: index.jsx:33-47

Features include:

- **Grid/List Views**: Multiple display modes for workspace browsing
- **Search and Filtering**: Real-time workspace filtering by name and type
- **Team vs Private Separation**: Distinct handling of team and individual workspaces

### Settings Management

Workspace settings provide comprehensive configuration options: settings.jsx:49-72

## Database Schema and Relationships

The workspace model schema supports comprehensive workspace management: workspace.js:39-76

Key schema features:

- **UUID Primary Key**: Ensures unique identification
- **Owner Reference**: Foreign key to user table with cascade operations
- **Team Association**: Optional team relationship for collaborative workspaces
- **Activity Tracking**: Last accessed timestamp for analytics
- **Customization**: Name, description, and emoji fields for personalization

# Notes and AI Integration Documentation

## Overview

The Notes and AI Integration system provides a sophisticated note-taking platform with markdown editing, AI-powered content generation, intelligent chat assistance, and public sharing capabilities. The system integrates Google Gemini AI to enhance note creation and interaction workflows.

## Base Route Configuration

The notes management routes are registered in the main router:

## Core Endpoints

### Route Structure and Authentication

The note routes implement selective authentication middleware protection: noteRoutes.js:1-29

### Note Creation

**Endpoint**: `POST /api/notes`  
**Handler**: `noteController.createNote`  
**Authentication**: Not required (public endpoint)

The creation process is straightforward with basic validation: noteControllers.js:9-16

Frontend note creation includes automatic title generation with timestamps: notes.jsx:27-61

### Workspace Notes Retrieval

**Endpoint**: `GET /api/notes/:workspace_id`  
**Handler**: `noteController.readNotes`  
**Authentication**: Required

The system implements comprehensive membership validation for workspace access: noteControllers.js:19-72

This includes both direct user membership and team-based access through team membership resolution.

### Specific Note Retrieval

**Endpoint**: `GET /api/notes/:workspace_id/:id`  
**Handler**: `noteController.readNote`  
**Authentication**: Required for private notes

The note access system supports both private and public note access: noteControllers.js:75-129

### Note Updates

**Endpoint**: `PUT /api/notes/:id`  
**Handler**: `noteController.updateNote`  
**Authentication**: Required

The update system provides simple note modification: noteControllers.js:205-218

Frontend updates include auto-saving functionality with cloud sync indicators: opened-note.jsx:94-120

### Note Deletion

**Endpoint**: `DELETE /api/notes/:id`  
**Handler**: `noteController.deleteNote`  
**Authentication**: Required

Deletion includes confirmation dialogs and proper cleanup: noteControllers.js:221-233

## Public Sharing System

### Public Note Access

**Endpoint**: `GET /api/notes/public/:id/note`  
**Handler**: `noteController.readPublicNote`  
**Authentication**: Not required

Public notes are accessible without authentication: noteControllers.js:132-156

The frontend public sharing interface provides clean, branded access: shared-notes.jsx:13-30

### Note Publishing

**Endpoint**: `PATCH /api/notes/:workspace_id/:id/publish`  
**Handler**: `noteController.publishNote`  
**Authentication**: Required

Publishing requires workspace membership and note ownership validation: noteControllers.js:158-202

Frontend publishing includes URL generation and automatic opening: opened-note.jsx:126-154

## AI Integration Features

### AI Note Generation

The system provides AI-powered note creation through the `AiGeneratedNote` component: ai-generated-note.jsx:40-84

Key AI generation features:

- **Structured JSON Response**: Enforces consistent title and content format
- **Temperature Control**: Uses 0.3 for focused, coherent output
- **Context Integration**: Incorporates user and workspace information

### Note Chat Assistant

The `NoteChat` component provides intelligent note interaction: noteChat.jsx:149-198

The chat system includes predefined actions for common note operations and context-aware prompting: noteChat.jsx:200-248

### Advanced Note Editor

The main note editor provides comprehensive editing capabilities: opened-note.jsx:35-120

Features include:

- **Dual-pane Interface**: Side-by-side editing and preview
- **Mode Switching**: Toggle between edit, preview, and AI assist modes
- **Auto-saving**: Real-time content persistence
- **PDF Export**: Professional document generation

The editor integrates AI assistance seamlessly: opened-note.jsx:377-387

## Frontend Note Management

### Note Listing Interface

The notes listing provides comprehensive workspace note management: notes.jsx:66-84

Features include:

- **AI Note Generation**: Modal-based AI note creation
- **File Upload**: Document-to-note conversion
- **Table View**: Organized note listing with metadata
- **Quick Actions**: Direct note access and deletion

# Task Management Documentation

## Overview

The Task Management system provides comprehensive task lifecycle management with Kanban-style organization, team assignment capabilities, and integrated notification features. Tasks are organized within workspaces and support status transitions, deadline tracking, and collaborative workflows.

## Base Route Configuration

The task management routes are registered in the main router: index.js:45

## Route Structure and Authentication

All task routes require authentication middleware protection: taskRoutes.js:8

The complete route structure provides comprehensive CRUD operations: taskRoutes.js:11-44

## Task CRUD Operations

### Task Creation with Notification Integration

The task creation system supports both single and bulk task creation with automatic notification delivery: taskControllers.js:43-88

Key features include:

- **Bulk Creation Support**: Handles arrays of tasks for batch operations
- **Automatic Notifications**: Sends assignment notifications to assigned users
- **Error Handling**: Comprehensive validation and error responses

### Task Retrieval Operations

The system provides multiple data access patterns for different use cases: taskControllers.js:180-244

This includes specialized endpoints for:

- **Incomplete Tasks**: Tasks not marked as "done" with time calculations
- **User-Assigned Tasks**: Tasks assigned to specific users with elapsed time metrics
- **Workspace Tasks**: All tasks within a workspace context

### Task Updates with Status Management

Task updates include permission validation and workspace-wide notifications: taskControllers.js:398-463

The update system implements:

- **Permission Checks**: Only assigned users can change task status
- **Workspace Notifications**: Broadcasts status changes to all workspace members
- **Team Member Resolution**: Identifies all users through direct and team memberships

### Task Archiving and Management

The system provides archive/unarchive functionality for task organization: taskControllers.js:367-380

## Frontend Task Interface

### Kanban Board Implementation

The frontend implements a four-column Kanban board with drag-and-drop functionality: tasks.jsx:287-350

The board includes:

- **Status Columns**: To-do, In Progress, Done, and Archived
- **Task Counts**: Dynamic counters for each status
- **Time Calculations**: Real-time deadline tracking with overdue detection

### Task Card Component

Individual tasks are rendered using a comprehensive card component: task-card.jsx:35-175

Features include:

- **Status Change Buttons**: Quick status transitions
- **Dropdown Actions**: Edit, archive, and delete operations
- **Deadline Indicators**: Visual time remaining calculations
- **Assignment Display**: User assignment with hover interactions

### Task Creation Interface

The task creation form supports team-based assignment: add-new-task.jsx:50-77

The form includes:

- **Team Member Selection**: Dynamic user list for team workspaces
- **Status Selection**: Initial task status configuration
- **Due Date Picker**: DateTime input for deadline setting
- **Validation**: Required field validation and error handling

## Assignment and Notification Features

### Team-Based Assignment

The system supports both individual and team-based task assignment: tasks.jsx:217-221

Users can toggle between viewing all team tasks or only their assigned tasks.

### Notification System Integration

Task operations trigger comprehensive notification workflows: taskControllers.js:73-81

The notification system:

- **Assignment Notifications**: Alerts users when tasks are assigned
- **Status Change Notifications**: Broadcasts updates to workspace members
- **Action Context**: Includes task and workspace IDs for navigation

### Deadline Tracking and Analytics

The system provides sophisticated deadline tracking: tasks.jsx:327-346

Time calculations include:

- **Overdue Detection**: Identifies past-due tasks
- **Remaining Time**: Days and hours until deadline
- **Status-Based Filtering**: Separates completed from active tasks

## Database Schema and Relationships

The task model defines comprehensive relationships: task.js:10-17

Key schema features: task.js:19-63

- **User Assignment**: Foreign key relationship to users table
- **Workspace Association**: Links tasks to specific workspaces
- **Archive Support**: Boolean flag for task archiving
- **Status Management**: String field for workflow states

# Team Collaboration Documentation

## Overview

The Team Collaboration system provides comprehensive team lifecycle management including creation, membership control, role-based access, and real-time discussions. Teams serve as organizational units that can own workspaces and facilitate collaborative workflows with sophisticated permission management.

## Base Route Configuration

The team collaboration routes are registered in the main router: index.js:35

The user-team relations are handled through a separate route: index.js:51

## Team CRUD Operations

### Route Structure and Authentication

All team routes require authentication middleware protection: teamRoutes.js:7

The complete route structure includes comprehensive team management operations: teamRoutes.js:9-28

### Team Creation with Transactional Safety

Team creation follows a transactional pattern ensuring proper membership assignment: teamControllers.js:5-47

Key features include:

- **Transactional Safety**: Uses database transactions to ensure atomicity
- **Automatic Admin Assignment**: Creator receives admin role automatically
- **Rollback Protection**: Reverts changes if any step fails

### Team Data Retrieval

The system provides comprehensive team data access with member information: teamControllers.js:264-327

This includes formatted team data with complete member lists and role information.

## Team Membership Management

### Role-Based Access Control

The system implements a three-tier role hierarchy with sophisticated permission checking:

#### Member Addition

Only team admins can add new members: teamControllers.js:49-81

#### Admin Promotion

Only team owners can promote members to admin status: teamControllers.js:83-147

#### Member Removal

Admins can remove regular members, but only owners can remove admins: teamControllers.js:210-262

### Team Deletion

Team deletion requires both admin role and ownership verification: teamControllers.js:425-461

## Database Schema and Relationships

The team model defines comprehensive relationships supporting collaboration: team.js:10-37

Key relationships include:

- **User Ownership**: `belongsTo` user as creator
- **Member Management**: `belongsToMany` users through team_membership
- **Content Associations**: Links to discussions, workspaces, and workspace memberships

## Frontend Team Interface

### Team Listing and Management

The main team interface provides comprehensive team browsing: index.jsx:24-47

Features include:

- **Grid/List Views**: Multiple display modes for team browsing
- **Role Indicators**: Visual distinction between admin and member roles
- **Owner Identification**: Special marking for team creators

### Team Navigation and Structure

The opened team interface uses tabbed navigation: team_opened.jsx:43-91

### Team Settings and Administration

The settings interface provides comprehensive team management: settings.jsx:48-105

# Classroom Features Documentation

## Overview

The Classroom Features system provides comprehensive educational management capabilities including classroom creation, student enrollment, assignment distribution, submission tracking, and material sharing. The system supports both teacher and student roles with appropriate access controls and collaborative learning workflows.

## Base Route Configuration

The classroom management routes are registered in the main router: index.js:36

## Route Structure and Authentication

All classroom routes require authentication middleware protection: classroomRoutes.js:7

The complete route structure includes comprehensive classroom management operations: classroomRoutes.js:9-16

## Classroom CRUD Operations

### Classroom Creation and Management

The classroom creation system supports teacher-initiated classroom setup: classroomControllers.js:4-11

### Student Enrollment System

The system provides dual enrollment patterns for different user types: classroomControllers.js:13-36

Key features include:

- **Teacher View**: Shows classrooms created by the authenticated user
- **Student View**: Shows enrolled classrooms through the `enrolledClassrooms` association
- **Role-Based Access**: Different data access patterns based on user role

### Classroom Data Retrieval

The system provides comprehensive classroom data including teacher and student information: classroomControllers.js:38-60

## Frontend Classroom Interface

### Main Classroom Dashboard

The classroom interface provides a dual-panel layout for created and joined classrooms: index.jsx:19-28

Features include:

- **Creation Panel**: Displays classrooms created by the user
- **Enrollment Panel**: Shows classrooms the user has joined
- **Modal Creation**: Integrated classroom creation dialog

### Opened Classroom Management

The detailed classroom view provides comprehensive management capabilities: opened-classroom.jsx:27-50

The classroom interface includes comprehensive student management: opened-classroom.jsx:139-192

## Assignment and Submission System

### Assignment Management

The classroom system integrates assignment functionality through dedicated components: opened-classroom.jsx:194-200

### Submission Tracking

Teachers can view and manage student submissions: opened-classroom.jsx:204-231

## Materials Management System

### File Upload and Sharing

The materials system supports file upload with metadata: Materials.jsx:107-134

### Material Display and Access

Materials are displayed with comprehensive metadata and download capabilities: Materials.jsx:158-192

### Materials API Integration

The materials system uses dedicated routes for file management: classroomMaterialsRoutes.js:9-11

## Navigation and Access Control

### Dashboard Integration

Classroom features are integrated into the main dashboard navigation: index.jsx:316-329

### Route Configuration

The classroom system uses nested routing for different views: dashboard-routes.jsx:140-146
