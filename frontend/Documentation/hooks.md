# Custom React Hooks

## Overview

Custom hooks encapsulate reusable logic for data fetching, state management, and side effects. They follow the naming convention `use*` and can use other hooks internally.

## Data Fetching Hooks

### useFetchTasks

```javascript
// hooks/useFetchTasks.js
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { taskAPI } from '../services/apiService';
import { setTasks, setLoading, setError } from '../redux/slices/tasksSlice';

export const useFetchTasks = (workspaceId, filters = {}) => {
  const dispatch = useDispatch();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchTasks = async () => {
      dispatch(setLoading(true));
      try {
        const params = {
          workspaceId,
          ...filters,
        };
        const response = await taskAPI.getTasks(params);
        dispatch(setTasks(response.data));
        dispatch(setError(null));
      } catch (error) {
        dispatch(setError(error.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchTasks();
  }, [workspaceId, refreshTrigger, filters, dispatch]);

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return { refetch };
};
```

### useFetchArchivedTasks

```javascript
// hooks/useFetchArchivedTasks.js
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { taskAPI } from '../services/apiService';
import { setArchivedTasks, setLoading, setError } from '../redux/slices/tasksSlice';

export const useFetchArchivedTasks = (workspaceId) => {
  const dispatch = useDispatch();
  const [loading, setLoadingState] = useState(false);
  const [error, setErrorState] = useState(null);

  const fetchArchivedTasks = async () => {
    if (!workspaceId) return;

    setLoadingState(true);
    setErrorState(null);
    try {
      const response = await taskAPI.getArchivedTasks(workspaceId);
      dispatch(setArchivedTasks(response.data));
    } catch (err) {
      setErrorState(err.message);
      dispatch(setError(err.message));
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    fetchArchivedTasks();
  }, [workspaceId]);

  return {
    loading,
    error,
    refetch: fetchArchivedTasks,
  };
};
```

## Real-time Communication Hooks

### useSocket

```javascript
// hooks/useSocket.js
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { updateTask } from '../redux/slices/tasksSlice';
import { addNotification } from '../redux/slices/notificationsSlice';

export const useSocket = (workspaceId) => {
  const socketRef = useRef();
  const dispatch = useDispatch();

  const connect = useCallback(() => {
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      if (workspaceId) {
        socketRef.current.emit('join-workspace', workspaceId);
      }
    });

    socketRef.current.on('task-updated', (taskData) => {
      dispatch(updateTask(taskData));
    });

    socketRef.current.on('notification', (notification) => {
      dispatch(addNotification(notification));
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }, [workspaceId, dispatch]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    if (socketRef.current && workspaceId) {
      socketRef.current.emit('join-workspace', workspaceId);
    }
  }, [workspaceId]);

  return {
    socket: socketRef.current,
    emit,
    connected: socketRef.current?.connected || false,
  };
};
```

## Form Management Hooks

### useForm

```javascript
// hooks/useForm.js
import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    if (validate) {
      const validationErrors = validate(values);
      setErrors(prev => ({
        ...prev,
        [name]: validationErrors[name] || '',
      }));
    }
  }, [values, validate]);

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await onSubmit(values);
      setValues(initialValues);
      setTouched({});
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, initialValues]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue,
    setError,
  };
};
```

### useDebounce

```javascript
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

## UI State Hooks

### useLocalStorage

```javascript
// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};
```

### useDarkMode

```javascript
// hooks/useDarkMode.js
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../redux/slices/themeSlice';

export const useDarkMode = () => {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.mode);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };
};
```

## API Hooks

### useApi

```javascript
// hooks/useApi.js
import { useState, useCallback } from 'react';
import api from '../utils/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = useCallback(async (config) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api(config);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, config = {}) => {
    return makeRequest({ ...config, method: 'get', url });
  }, [makeRequest]);

  const post = useCallback((url, data, config = {}) => {
    return makeRequest({ ...config, method: 'post', url, data });
  }, [makeRequest]);

  const put = useCallback((url, data, config = {}) => {
    return makeRequest({ ...config, method: 'put', url, data });
  }, [makeRequest]);

  const del = useCallback((url, config = {}) => {
    return makeRequest({ ...config, method: 'delete', url });
  }, [makeRequest]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
  };
};
```

## Performance Hooks

### useIntersectionObserver

```javascript
// hooks/useIntersectionObserver.js
import { useEffect, useRef, useState } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return [ref, isIntersecting, entry];
};
```

### usePrevious

```javascript
// hooks/usePrevious.js
import { useRef, useEffect } from 'react';

export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
```

## Best Practices

1. **Single Responsibility**: Each hook should have one clear purpose
2. **Naming Convention**: Always prefix with `use`
3. **Dependencies**: Include all dependencies in useEffect/useCallback
4. **Cleanup**: Clean up subscriptions and timers
5. **Error Handling**: Handle errors gracefully
6. **Memoization**: Use useCallback/useMemo for expensive operations
7. **Testing**: Write tests for custom hooks
8. **Documentation**: Document hook parameters and return values