# Utility Functions

## Overview

Utility functions provide common functionality used across the application, including date formatting, validation, file handling, and more.

## Date and Time Utilities

### Date Formatting

```javascript
// utils/dateUtils.js
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy hh:mm a');
};
```

### Time Calculations

```javascript
// utils/timeUtils.js
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.abs(end - start);
};

export const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};
```

## Validation Utilities

### Form Validation

```javascript
// utils/validationUtils.js
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

### Data Validation

```javascript
// utils/dataValidation.js
export const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const isValidId = (id) => {
  return id && (typeof id === 'string' || typeof id === 'number') && id.toString().length > 0;
};

export const sanitizeString = (str) => {
  if (!str) return '';
  return str.toString().trim().replace(/[<>]/g, '');
};
```

## File Handling Utilities

### File Conversion

```javascript
// utils/fileConverterClient.js
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

export const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidFileType = (file, allowedTypes) => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  return allowedTypes.some(type => fileType.includes(type) || fileName.endsWith(type));
};
```

### Image Processing

```javascript
// utils/imageUtils.js
export const resizeImage = (file, maxWidth, maxHeight, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(resolve, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

export const compressImage = (file, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(resolve, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
};
```

## String and Text Utilities

### Text Formatting

```javascript
// utils/textUtils.js
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const titleCase = (str) => {
  if (!str) return '';
  return str.split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

export const truncate = (str, length = 100, suffix = '...') => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
```

### Search and Filter

```javascript
// utils/searchUtils.js
export const searchInText = (text, query) => {
  if (!text || !query) return false;
  return text.toLowerCase().includes(query.toLowerCase());
};

export const highlightText = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const filterArray = (array, query, fields = []) => {
  if (!query) return array;
  return array.filter(item => {
    return fields.some(field => {
      const value = item[field];
      return value && searchInText(value.toString(), query);
    });
  });
};
```

## Array and Object Utilities

### Array Operations

```javascript
// utils/arrayUtils.js
export const unique = (array) => {
  return [...new Set(array)];
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
```

### Object Operations

```javascript
// utils/objectUtils.js
export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const isEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};
```

## Notification Utilities

### Browser Notifications

```javascript
// utils/sendBrowserNotification.js
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendBrowserNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }
  return null;
};
```

### Toast Notifications

```javascript
// utils/toastUtils.js
import { toast } from 'react-toastify';

export const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    ...options,
  });
};

export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
    ...options,
  });
};

export const showInfoToast = (message, options = {}) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
    ...options,
  });
};

export const showWarningToast = (message, options = {}) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 4000,
    ...options,
  });
};
```

## Pomodoro Timer Utilities

### Pomodoro Manager

```javascript
// utils/pomodoro-manager.jsx
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePomodoroSession } from '../redux/slices/pomodoroSlice';

export const usePomodoroTimer = () => {
  const dispatch = useDispatch();
  const { currentSession, settings } = useSelector(state => state.pomodoro);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef();

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(currentSession.duration * 60);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(currentSession.duration * 60);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            dispatch(updatePomodoroSession({
              ...currentSession,
              completed: true,
            }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, currentSession, dispatch]);

  return {
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};
```

## Dark Reader Utilities

### Theme Management

```javascript
// utils/darkreader.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import DarkReader from 'darkreader';

export const DarkReaderManager = () => {
  const theme = useSelector(state => state.theme.mode);

  useEffect(() => {
    if (theme === 'dark') {
      DarkReader.enable({
        brightness: 100,
        contrast: 90,
        sepia: 10,
      });
    } else {
      DarkReader.disable();
    }

    return () => {
      DarkReader.disable();
    };
  }, [theme]);

  return null;
};
```

## Socket Handler

### WebSocket Management

```javascript
// utils/socketHandler.jsx
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { updateTask } from '../redux/slices/tasksSlice';

export const SocketHandler = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const socketRef = useRef();

  useEffect(() => {
    if (user) {
      socketRef.current = io(process.env.REACT_APP_SOCKET_URL);

      socketRef.current.on('task-updated', (task) => {
        dispatch(updateTask(task));
      });

      socketRef.current.on('notification', (notification) => {
        // Handle notification
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user, dispatch]);

  return null;
};
```

## Notification Scheduler

### Scheduled Notifications

```javascript
// utils/NotificationScheduler.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { sendBrowserNotification } from './sendBrowserNotification';

export const NotificationScheduler = () => {
  const { tasks } = useSelector(state => state.tasks);

  useEffect(() => {
    const checkDueTasks = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate - now;

          // Notify 1 hour before due
          if (timeDiff > 0 && timeDiff <= 60 * 60 * 1000) {
            sendBrowserNotification(`Task due soon: ${task.title}`, {
              body: `Due at ${dueDate.toLocaleTimeString()}`,
              tag: `task-${task.id}`,
            });
          }
        }
      });
    };

    const interval = setInterval(checkDueTasks, 60 * 1000); // Check every minute
    checkDueTasks(); // Check immediately

    return () => clearInterval(interval);
  }, [tasks]);

  return null;
};
```

## Best Practices

1. **Pure Functions**: Keep utilities pure and testable
2. **Error Handling**: Include error handling in utilities
3. **Performance**: Optimize expensive operations
4. **Type Safety**: Use TypeScript for better type safety
5. **Documentation**: Document function parameters and return types
6. **Testing**: Write unit tests for utility functions
7. **Modularity**: Keep utilities focused and modular
8. **Reusability**: Design utilities to be reusable across components