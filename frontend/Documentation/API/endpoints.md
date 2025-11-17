# API Endpoints Documentation

## Overview

This document outlines the REST API endpoints available for the Student Productivity Hub frontend. All endpoints require authentication unless otherwise specified.

## Base URL

```
Production: https://api.studentproductivityhub.com
Development: http://localhost:3001/api
```

## Authentication

### POST /auth/login
Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### POST /auth/google
Authenticate with Google OAuth.

**Request Body:**
```json
{
  "token": "google_oauth_token"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "new_jwt_access_token"
}
```

### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST /auth/reset-password
Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "new_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## User Management

### GET /users/profile
Get current user profile.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Student developer",
    "preferences": {
      "theme": "light",
      "notifications": true
    }
  }
}
```

### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Updated bio",
  "preferences": {
    "theme": "dark",
    "notifications": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "bio": "Updated bio",
    "preferences": {
      "theme": "dark",
      "notifications": false
    }
  }
}
```

### GET /users
Get list of users (admin only).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search query

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Workspace Management

### GET /workspaces
Get user's workspaces.

**Response:**
```json
{
  "success": true,
  "workspaces": [
    {
      "id": 1,
      "name": "My Project",
      "description": "Project description",
      "color": "#3b82f6",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "members": [
        {
          "id": 1,
          "name": "John Doe",
          "role": "owner"
        }
      ]
    }
  ]
}
```

### POST /workspaces
Create a new workspace.

**Request Body:**
```json
{
  "name": "New Workspace",
  "description": "Workspace description",
  "color": "#3b82f6"
}
```

**Response:**
```json
{
  "success": true,
  "workspace": {
    "id": 2,
    "name": "New Workspace",
    "description": "Workspace description",
    "color": "#3b82f6",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /workspaces/:id
Get workspace details.

**Response:**
```json
{
  "success": true,
  "workspace": {
    "id": 1,
    "name": "My Project",
    "description": "Project description",
    "color": "#3b82f6",
    "members": [
      {
        "id": 1,
        "name": "John Doe",
        "role": "owner"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /workspaces/:id
Update workspace.

**Request Body:**
```json
{
  "name": "Updated Workspace",
  "description": "Updated description",
  "color": "#10b981"
}
```

**Response:**
```json
{
  "success": true,
  "workspace": {
    "id": 1,
    "name": "Updated Workspace",
    "description": "Updated description",
    "color": "#10b981",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /workspaces/:id
Delete workspace.

**Response:**
```json
{
  "success": true,
  "message": "Workspace deleted successfully"
}
```

## Task Management

### GET /workspaces/:workspaceId/tasks
Get workspace tasks.

**Query Parameters:**
- `status`: Filter by status (pending, in_progress, completed)
- `priority`: Filter by priority (low, medium, high)
- `assignedTo`: Filter by assigned user ID
- `dueBefore`: Filter tasks due before date
- `dueAfter`: Filter tasks due after date

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the project implementation",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2024-01-15T00:00:00Z",
      "assignedTo": {
        "id": 1,
        "name": "John Doe"
      },
      "createdBy": {
        "id": 1,
        "name": "John Doe"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /workspaces/:workspaceId/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "medium",
  "dueDate": "2024-01-15T00:00:00Z",
  "assignedTo": 2
}
```

**Response:**
```json
{
  "success": true,
  "task": {
    "id": 2,
    "title": "New Task",
    "description": "Task description",
    "status": "pending",
    "priority": "medium",
    "dueDate": "2024-01-15T00:00:00Z",
    "assignedTo": {
      "id": 2,
      "name": "Jane Smith"
    },
    "createdBy": {
      "id": 1,
      "name": "John Doe"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /tasks/:id
Update a task.

**Request Body:**
```json
{
  "title": "Updated Task",
  "status": "completed",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "task": {
    "id": 1,
    "title": "Updated Task",
    "status": "completed",
    "priority": "high",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /tasks/:id
Delete a task.

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## Team Management

### GET /workspaces/:workspaceId/members
Get workspace members.

**Response:**
```json
{
  "success": true,
  "members": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "owner",
      "joinedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "member",
      "joinedAt": "2024-01-02T00:00:00Z"
    }
  ]
}
```

### POST /workspaces/:workspaceId/members
Invite a user to workspace.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "member"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully"
}
```

### PUT /workspaces/:workspaceId/members/:userId
Update member role.

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "member": {
    "id": 2,
    "name": "Jane Smith",
    "role": "admin",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /workspaces/:workspaceId/members/:userId
Remove member from workspace.

**Response:**
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

## File Upload

### POST /upload
Upload a file.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File to upload
- `type`: File type (document, image, etc.)

**Response:**
```json
{
  "success": true,
  "file": {
    "id": 1,
    "filename": "document.pdf",
    "url": "https://cdn.example.com/files/document.pdf",
    "size": 1024000,
    "type": "document",
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
}
```

## Notifications

### GET /notifications
Get user notifications.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `read`: Filter by read status (true/false)

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "type": "task_assigned",
      "title": "Task Assigned",
      "message": "You have been assigned a new task",
      "data": {
        "taskId": 1,
        "taskTitle": "Complete project"
      },
      "read": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### PUT /notifications/:id/read
Mark notification as read.

**Response:**
```json
{
  "success": true,
  "notification": {
    "id": 1,
    "read": true,
    "readAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /notifications/read-all
Mark all notifications as read.

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

## Search

### GET /search
Search across workspaces, tasks, and notes.

**Query Parameters:**
- `q`: Search query (required)
- `type`: Search type (all, workspaces, tasks, notes)
- `workspaceId`: Limit search to specific workspace

**Response:**
```json
{
  "success": true,
  "results": {
    "workspaces": [
      {
        "id": 1,
        "name": "My Project",
        "type": "workspace"
      }
    ],
    "tasks": [
      {
        "id": 1,
        "title": "Complete project",
        "type": "task",
        "workspace": {
          "id": 1,
          "name": "My Project"
        }
      }
    ],
    "notes": [
      {
        "id": 1,
        "title": "Meeting Notes",
        "type": "note",
        "workspace": {
          "id": 1,
          "name": "My Project"
        }
      }
    ]
  }
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour
- **File uploads**: 50 uploads per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```