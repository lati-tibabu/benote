# Middleware

## Overview

Middleware functions handle cross-cutting concerns like authentication, rate limiting, and file uploads.

## Authentication Middleware (`authMiddleware.js`)

### JWT Authentication
Validates JWT tokens in request headers.

**Usage:**
```javascript
router.use(authMiddleware.authMiddleware);
```

**Features:**
- Extracts token from `Authorization: Bearer <token>` header
- Verifies token signature and expiration
- Attaches user info to `req.user`
- Returns 401 for invalid/missing tokens

### Logout Handler
Clears authentication state.

## Rate Limiting (`authRateLimiter.js`)

### Auth Rate Limiter
Limits authentication attempts to prevent brute force attacks.

**Configuration:**
- Window: 15 minutes
- Max requests: 5 per window
- Block duration: 15 minutes

**Usage:**
```javascript
router.use(authRateLimiter.authRateLimiter);
```

## Passport Configuration (`passport.js`)

### Google OAuth Strategy
Handles Google OAuth 2.0 authentication.

**Configuration:**
- Client ID and Secret from environment variables
- Callback URL handling
- User profile mapping

**Flow:**
1. Redirect to Google consent screen
2. Handle callback with authorization code
3. Exchange code for access token
4. Create/update user record
5. Generate JWT token

## File Upload (`supabaseUpload.js`)

### Supabase Storage Upload
Handles file uploads to Supabase storage.

**Features:**
- Multer integration for multipart handling
- Automatic file type detection
- Secure file storage with access controls
- Public/private file access

**Usage:**
```javascript
const upload = require('./middlewares/supabaseUpload');
router.post('/upload', upload.single('file'), controller);
```

## Middleware Order

Typical middleware application order:

1. **CORS** - Cross-origin requests
2. **Rate Limiting** - Request throttling
3. **Body Parsing** - JSON/form data parsing
4. **Authentication** - JWT validation
5. **Authorization** - Permission checks
6. **File Upload** - Multipart handling
7. **Error Handling** - Centralized error responses

## Error Handling

All middleware includes proper error handling:

- Validation errors return 400 status
- Authentication errors return 401 status
- Authorization errors return 403 status
- Server errors return 500 status

## Security Considerations

- **Input Validation**: Sanitize all inputs
- **Token Security**: Secure token storage and transmission
- **Rate Limiting**: Prevent abuse and DoS attacks
- **CORS Policy**: Restrict cross-origin access
- **File Upload Security**: Validate file types and sizes