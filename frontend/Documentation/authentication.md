# Authentication System

## Overview

The application implements a comprehensive authentication system supporting multiple login methods including traditional email/password, Google OAuth, and JWT-based session management.

## Authentication Flow

### Login Process

1. User submits credentials or initiates OAuth
2. Frontend sends request to authentication endpoint
3. Backend validates credentials and returns JWT tokens
4. Frontend stores tokens in Redux state and localStorage
5. User is redirected to dashboard

### Token Management

#### JWT Tokens

- **Access Token**: Short-lived token for API authentication
- **Refresh Token**: Long-lived token for obtaining new access tokens

#### Token Storage

```javascript
// In authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
    },
  },
});
```

## Authentication Methods

### Email/Password Authentication

#### Login Component

```jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });
      dispatch(login(response.data));
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### Google OAuth Authentication

#### Google OAuth Setup

```jsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />
    </GoogleOAuthProvider>
  );
};
```

#### Google Login Handler

```jsx
const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const response = await axios.post('/api/auth/google', {
      token: credentialResponse.credential,
    });
    dispatch(setCredentials(response.data));
    navigate('/dashboard');
  } catch (error) {
    console.error('Google login failed:', error);
  }
};
```

## Route Protection

### Protected Route Component

```jsx
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
};
```

### Usage in Routes

```jsx
const dashboardRoutes = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
  },
];
```

## Token Refresh

### Automatic Token Refresh

```javascript
// axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = store.getState().auth.refreshToken;
        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data;
        store.dispatch(setAccessToken(accessToken));

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## Password Management

### Forgot Password Flow

1. User requests password reset
2. Email with reset token sent
3. User clicks link and sets new password
4. Password updated on backend

#### Forgot Password Component

```jsx
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setMessage('Password reset email sent');
    } catch (error) {
      setMessage('Error sending reset email');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Send Reset Email</button>
      {message && <p>{message}</p>}
    </form>
  );
};
```

### Password Reset

```jsx
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        password,
      });
      navigate('/auth/login');
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm password"
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  );
};
```

## User Registration

### Signup Process

```jsx
const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await axios.post('/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/auth/verify-user');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit">Sign Up</button>
    </form>
  );
};
```

## User Verification

### Email Verification

```jsx
const VerifyUser = () => {
  const [code, setCode] = useState('');
  const { email } = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/verify', {
        email,
        code,
      });
      navigate('/auth/login');
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Verification code"
        required
      />
      <button type="submit">Verify</button>
    </form>
  );
};
```

## Security Considerations

### Password Policies

- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, symbols
- No common passwords

### Rate Limiting

- Login attempts limited per IP
- Password reset requests limited

### Secure Storage

- Tokens stored securely
- Sensitive data encrypted
- Automatic logout on suspicious activity

## Logout

### Logout Implementation

```jsx
const logout = () => async (dispatch) => {
  try {
    await axios.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    dispatch(clearCredentials());
    localStorage.removeItem('persist:root');
  }
};
```

## Best Practices

1. **Token Security**: Store tokens securely, never in plain text
2. **Automatic Refresh**: Implement automatic token refresh
3. **Route Protection**: Protect all sensitive routes
4. **Error Handling**: Handle authentication errors gracefully
5. **User Feedback**: Provide clear feedback for auth states
6. **Security Headers**: Implement proper security headers
 
 