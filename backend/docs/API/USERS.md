# Users API

## Overview

The Users API provides endpoints for user management, including CRUD operations, verification, and user overview.

## Endpoints

### Create User

**POST** `/api/users/`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "is_verified": false
}
```

### Get All Users

**GET** `/api/users/`

Retrieve all users (admin access).

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
]
```

### Get User by Email

**POST** `/api/users/email`

Find user by email address.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Get User by ID

**GET** `/api/users/:id`

Retrieve user details by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "workspaces": [...],
  "teams": [...]
}
```

### Update User

**PUT** `/api/users/`

Update current user's information.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

### Delete User

**DELETE** `/api/users/`

Delete current user account.

### Get User Overview

**GET** `/api/users/overview/fetch`

Get comprehensive user overview including stats and recent activity.

**Response:**
```json
{
  "user": {...},
  "stats": {
    "totalTasks": 15,
    "completedTasks": 10,
    "activeWorkspaces": 3
  },
  "recentActivity": [...]
}
```

### Verify User

**GET** `/api/users/verify/:userId/:token`

Verify user email with verification token.

### Regenerate Verification Token

**POST** `/api/users/regenerate/verification-token`

Generate new email verification token.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## Authentication

Most endpoints require authentication via JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Permissions

- **Create User**: Public (registration)
- **Read Users**: Admin only
- **Update/Delete**: Own account only
- **Overview**: Authenticated users
- **Verification**: Public with valid token