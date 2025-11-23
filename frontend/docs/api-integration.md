# API Integration

## Overview

The frontend communicates with the backend through RESTful APIs using Axios for HTTP requests. The integration includes request/response interceptors, error handling, and centralized configuration.

## Axios Configuration

### Base Configuration

```javascript
// utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### Request Interceptors

```javascript
// Add authorization header to requests
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
```

### Response Interceptors

```javascript
// Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      store.dispatch(logout());
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

## API Service Layer

### Centralized API Calls

```javascript
// services/apiService.js
import api from '../utils/api';

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUsers: (params) => api.get('/users', { params }),
};

export const workspaceAPI = {
  getWorkspaces: () => api.get('/workspaces'),
  createWorkspace: (data) => api.post('/workspaces', data),
  getWorkspace: (id) => api.get(`/workspaces/${id}`),
  updateWorkspace: (id, data) => api.put(`/workspaces/${id}`, data),
  deleteWorkspace: (id) => api.delete(`/workspaces/${id}`),
};

export const taskAPI = {
  getTasks: (workspaceId) => api.get(`/workspaces/${workspaceId}/tasks`),
  createTask: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/tasks`, data),
  updateTask: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
};
```

## React Query Integration

### Using React Query for Data Fetching

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const useTasks = (workspaceId) => {
  return useQuery({
    queryKey: ['tasks', workspaceId],
    queryFn: () => taskAPI.getTasks(workspaceId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }) => taskAPI.createTask(workspaceId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['tasks', variables.workspaceId]);
    },
  });
};
```

## Custom Hooks for API Calls

### Data Fetching Hooks

```javascript
// hooks/useFetchTasks.js
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { taskAPI } from '../services/apiService';

export const useFetchTasks = (workspaceId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!workspaceId) return;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await taskAPI.getTasks(workspaceId);
        setTasks(response.data);
        dispatch(setTasks(response.data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [workspaceId, dispatch]);

  return { tasks, loading, error };
};
```

### Mutation Hooks

```javascript
// hooks/useCreateTask.js
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { taskAPI } from '../services/apiService';
import { addTask } from '../redux/slices/tasksSlice';

export const useCreateTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const createTask = async (workspaceId, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAPI.createTask(workspaceId, taskData);
      dispatch(addTask(response.data));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createTask, loading, error };
};
```

## Error Handling

### Global Error Handler

```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return 'Invalid request data';
      case 401:
        return 'Unauthorized access';
      case 403:
        return 'Forbidden access';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Internal server error';
      default:
        return data.message || 'An error occurred';
    }
  } else if (error.request) {
    // Network error
    return 'Network error - please check your connection';
  } else {
    // Other error
    return error.message;
  }
};
```

### Error Boundary for API Errors

```jsx
// components/ApiErrorBoundary.jsx
import React from 'react';
import { toast } from 'react-toastify';

class ApiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    toast.error('An error occurred while loading data');
    console.error('API Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Loading States

### Loading Spinner Component

```jsx
// components/LoadingSpinner.jsx
const LoadingSpinner = ({ size = 'md', color = 'gray' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    gray: 'border-gray-500',
    gray: 'border-gray-500',
    gray: 'border-gray-500',
  };

  return (
    <div className={`animate-spin rounded-sm border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`} />
  );
};
```

### API Loading States in Components

```jsx
// components/TaskList.jsx
import { useFetchTasks } from '../hooks/useFetchTasks';
import LoadingSpinner from './LoadingSpinner';

const TaskList = ({ workspaceId }) => {
  const { tasks, loading, error } = useFetchTasks(workspaceId);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Error loading tasks: {error}
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};
```

## Caching and Optimization

### Response Caching

```javascript
// utils/cache.js
const cache = new Map();

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes
    return cached.data;
  }
  return null;
};

export const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};
```

### Request Deduplication

```javascript
// utils/requestDedupe.js
const pendingRequests = new Map();

export const dedupeRequest = async (key, requestFn) => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = requestFn();
  pendingRequests.set(key, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(key);
  }
};
```

## File Upload Handling

### File Upload with Progress

```jsx
// components/FileUploader.jsx
import { useState } from 'react';
import axios from 'axios';

const FileUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });
      return response.data;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleFileUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
```

## Real-time Updates

### WebSocket Integration

```javascript
// hooks/useSocket.js
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocket = (workspaceId) => {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL);

    socketRef.current.emit('join-workspace', workspaceId);

    socketRef.current.on('task-updated', (updatedTask) => {
      // Handle real-time task updates
      dispatch(updateTask(updatedTask));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [workspaceId]);

  return socketRef.current;
};
```

## Environment Configuration

### Environment Variables

```javascript
// config/apiConfig.js
export const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3001/api',
    socketURL: 'http://localhost:3001',
  },
  production: {
    baseURL: 'https://api.studentproductivityhub.com',
    socketURL: 'https://api.studentproductivityhub.com',
  },
};

export const getApiConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG[env];
};
```

## Best Practices

1. **Centralized Configuration**: Keep API configuration in one place
2. **Error Handling**: Implement comprehensive error handling
3. **Loading States**: Always show loading indicators
4. **Caching**: Implement appropriate caching strategies
5. **Request Deduplication**: Prevent duplicate requests
6. **Type Safety**: Use TypeScript for API responses
7. **Security**: Validate and sanitize API inputs
8. **Testing**: Mock API calls in tests