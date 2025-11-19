# Authentication API

## Overview

The authentication API handles user login, registration, OAuth, and password management.

## Endpoints

### Login

**POST** `/api/auth/`

Authenticate a user with email and password.

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
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "role": "student"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid credentials
- `400` - Bad request

### Google OAuth Login

**GET** `/api/auth/google`

Initiate Google OAuth login flow.

**Response:**
Redirects to Google OAuth consent screen.

### Google OAuth Callback

**GET** `/api/auth/google/callback`

Handle Google OAuth callback and redirect to frontend with token.

**Response:**
Redirects to frontend loading page with token parameter.

### Forgot Password

**POST** `/api/auth/forgot-password`

Send password reset email to user.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

**Status Codes:**
- `200` - Email sent
- `404` - User not found
- `400` - Bad request

### Reset Password

**PUT** `/api/auth/reset-password`

Reset user password using reset token.

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid token or password
- `404` - Token not found

## Authentication Flow

### Standard Login
1. User submits email and password
2. Server validates credentials
3. JWT token is generated and returned
4. Client stores token for subsequent requests

### Google OAuth
1. User clicks Google login
2. Redirected to Google consent screen
3. User grants permission
4. Google redirects back with authorization code
5. Server exchanges code for user info
6. JWT token generated and user redirected to frontend

### Password Reset
1. User requests password reset with email
2. Server generates reset token and sends email
3. User clicks email link with token
4. User submits new password with token
5. Server validates token and updates password

## Security Features

- **Rate Limiting**: Prevents brute force attacks
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt for secure password storage
- **Token Expiration**: Automatic token invalidation
- **OAuth Security**: Secure OAuth 2.0 implementation

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```