# Authentication API Integration

## Overview

The frontend integrates with backend authentication APIs to handle user login, registration, password management, and session management.

## Authentication Flow

### Login Process

```javascript
// services/authService.js
import api from '../utils/api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async signup(userData) {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  async googleLogin(token) {
    const response = await api.post('/auth/google', { token });
    return response.data;
  },

  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(data) {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
```

### Redux Integration

```javascript
// redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { refreshToken } = getState().auth;
      const response = await authService.refreshToken(refreshToken);
      localStorage.setItem('accessToken', response.accessToken);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      });
  },
});

export const { setCredentials, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
```

## Component Integration

### Login Component

```jsx
// pages/auth/login.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await dispatch(loginUser({
        googleToken: credentialResponse.credential
      })).unwrap();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({
              ...prev,
              email: e.target.value
            }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({
              ...prev,
              password: e.target.value
            }))}
            required
          />
        </div>

        {error && (
          <div className="error-message">
            {error.message || 'Login failed'}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="divider">or</div>

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.error('Google login failed')}
      />

      <div className="links">
        <Link to="/auth/forgot-password">Forgot password?</Link>
        <Link to="/auth/signup">Don't have an account?</Link>
      </div>
    </div>
  );
};
```

### Signup Component

```jsx
// pages/auth/signup.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../../redux/slices/authSlice';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await dispatch(signupUser(formData)).unwrap();
      navigate('/auth/verify-user');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              name: e.target.value
            }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              email: e.target.value
            }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              password: e.target.value
            }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              confirmPassword: e.target.value
            }))}
            required
          />
        </div>

        {error && (
          <div className="error-message">
            {error.message || 'Signup failed'}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="links">
        <Link to="/auth/login">Already have an account?</Link>
      </div>
    </div>
  );
};
```

## Protected Routes

### Route Guards

```jsx
// components/ProtectedRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
};
```

### Route Configuration

```jsx
// routers/app-routes.jsx
import { lazy } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard = lazy(() => import('../pages/dashboard/index'));
const Workspace = lazy(() => import('../pages/dashboard/contents/Workspace/index'));

const appRoutes = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'workspace/:workspaceId',
        element: <Workspace />,
      },
    ],
  },
];
```

## Token Management

### Axios Interceptors

```javascript
// utils/api.js
import axios from 'axios';
import store from '../redux/store';
import { logout, refreshAccessToken } from '../redux/slices/authSlice';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await store.dispatch(refreshAccessToken()).unwrap();
        const newToken = store.getState().auth.accessToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## Password Management

### Forgot Password Component

```jsx
// pages/auth/forgot-password.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../redux/slices/authSlice';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(forgotPassword(email)).unwrap();
      alert('Password reset email sent');
    } catch (error) {
      console.error('Forgot password failed:', error);
    }
  };

  return (
    <div className="forgot-password-container">
      <form onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="error-message">
            {error.message || 'Failed to send reset email'}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
      </form>

      <div className="links">
        <Link to="/auth/login">Back to login</Link>
      </div>
    </div>
  );
};
```

### Reset Password Component

```jsx
// pages/auth/reset-password.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../redux/slices/authSlice';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await dispatch(resetPassword({ token, password: formData.password })).unwrap();
      alert('Password reset successfully');
      navigate('/auth/login');
    } catch (error) {
      console.error('Reset password failed:', error);
    }
  };

  return (
    <div className="reset-password-container">
      <form onSubmit={handleSubmit}>
        <h2>Set New Password</h2>

        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              password: e.target.value
            }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              confirmPassword: e.target.value
            }))}
            required
          />
        </div>

        {error && (
          <div className="error-message">
            {error.message || 'Failed to reset password'}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};
```

## User Verification

### Email Verification Component

```jsx
// pages/auth/verify-user.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyUser } from '../../redux/slices/authSlice';

const VerifyUser = () => {
  const [code, setCode] = useState('');
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(verifyUser({ email, code })).unwrap();
      alert('Account verified successfully');
      navigate('/auth/login');
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  return (
    <div className="verify-user-container">
      <form onSubmit={handleSubmit}>
        <h2>Verify Your Account</h2>
        <p>Enter the verification code sent to your email.</p>

        <div className="form-group">
          <label htmlFor="code">Verification Code</label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="error-message">
            {error.message || 'Verification failed'}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>
      </form>

      <div className="links">
        <Link to="/auth/login">Back to login</Link>
      </div>
    </div>
  );
};
```

## Security Considerations

### Secure Token Storage

- Access tokens stored in memory (Redux state)
- Refresh tokens stored in httpOnly cookies (recommended)
- Automatic token refresh on expiration
- Secure logout clears all stored tokens

### Password Policies

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting

- Login attempts limited to prevent brute force
- Password reset requests rate limited
- Account verification attempts limited

## Error Handling

### Authentication Errors

```javascript
// utils/authErrors.js
export const handleAuthError = (error) => {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password';
    case 'ACCOUNT_LOCKED':
      return 'Account is temporarily locked';
    case 'EMAIL_NOT_VERIFIED':
      return 'Please verify your email first';
    case 'TOKEN_EXPIRED':
      return 'Session expired, please login again';
    default:
      return 'Authentication failed';
  }
};
```

## Best Practices

1. **Secure Storage**: Never store sensitive data in localStorage
2. **Token Refresh**: Implement automatic token refresh
3. **Error Handling**: Provide clear error messages to users
4. **Loading States**: Show loading indicators during auth operations
5. **Route Protection**: Protect all sensitive routes
6. **Password Security**: Enforce strong password policies
7. **Rate Limiting**: Implement client-side rate limiting
8. **Logout**: Clear all stored data on logout