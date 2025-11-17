# Notifications API Integration

## Overview

The Notifications API manages real-time notifications, alerts, and communication features within the application.

## Notification Service

```javascript
// services/notificationService.js
import api from '../utils/api';

export const notificationService = {
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  async getNotification(notificationId) {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  },

  async markAsRead(notificationId) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  async createNotification(notificationData) {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  async getNotificationSettings() {
    const response = await api.get('/notifications/settings');
    return response.data;
  },

  async updateNotificationSettings(settings) {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },

  async sendPushNotification(userId, notificationData) {
    const response = await api.post(`/notifications/push/${userId}`, notificationData);
    return response.data;
  },

  async getNotificationTemplates() {
    const response = await api.get('/notifications/templates');
    return response.data;
  },

  async createNotificationTemplate(templateData) {
    const response = await api.post('/notifications/templates', templateData);
    return response.data;
  },

  async sendBulkNotifications(notificationsData) {
    const response = await api.post('/notifications/bulk', notificationsData);
    return response.data;
  },
};
```

## Redux Integration

```javascript
// redux/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(params);
      return response.notifications;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      return response.notification;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchNotificationSettings = createAsyncThunk(
  'notification/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotificationSettings();
      return response.settings;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'notification/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await notificationService.updateNotificationSettings(settings);
      return response.settings;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    unreadCount: 0,
    settings: null,
    loading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload.id);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        const deletedNotification = state.notifications.find(n => n.id === action.payload);
        if (deletedNotification && !deletedNotification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export const { addNotification, clearError, setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
```

## Notification Components

### Notification List Component

```jsx
// components/NotificationList.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead
} from '../redux/slices/notificationSlice';
import NotificationItem from './NotificationItem';

const NotificationList = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error, unreadCount } = useSelector(state => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="error">Error loading notifications: {error.message}</div>;
  }

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h2>Notifications</h2>
        <div className="notification-actions">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn btn-sm btn-primary"
            >
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      <div className="notifications-container">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={() => handleMarkAsRead(notification.id)}
            onDelete={() => handleDelete(notification.id)}
          />
        ))}

        {notifications.length === 0 && (
          <div className="empty-state">
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

### Notification Item Component

```jsx
// components/NotificationItem.jsx
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned': return '📋';
      case 'task_completed': return '✅';
      case 'mention': return '👤';
      case 'comment': return '💬';
      case 'deadline': return '⏰';
      case 'invitation': return '📨';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead();
    }
    setExpanded(!expanded);
  };

  return (
    <div
      className={`notification-item ${!notification.read ? 'unread' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-content">
        <div className="notification-icon">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="notification-body">
          <div className="notification-title">
            {notification.title}
          </div>

          <div className="notification-message">
            {expanded ? notification.message : notification.message.substring(0, 100)}
            {notification.message.length > 100 && !expanded && '...'}
          </div>

          <div className="notification-meta">
            <span className="notification-time">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className="notification-action"
                onClick={(e) => e.stopPropagation()}
              >
                {notification.actionText || 'View'}
              </a>
            )}
          </div>
        </div>

        <div className="notification-actions">
          {!notification.read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead();
              }}
              className="btn btn-sm btn-ghost"
            >
              Mark as Read
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="btn btn-sm btn-error"
          >
            Delete
          </button>
        </div>
      </div>

      {expanded && notification.details && (
        <div className="notification-details">
          <pre>{JSON.stringify(notification.details, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

### Notification Settings Component

```jsx
// components/NotificationSettings.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotificationSettings, updateNotificationSettings } from '../redux/slices/notificationSlice';

const NotificationSettings = () => {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector(state => state.notification);
  const [formData, setFormData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskAssigned: true,
    taskCompleted: true,
    mentions: true,
    comments: true,
    deadlines: true,
    systemUpdates: false,
  });

  useEffect(() => {
    dispatch(fetchNotificationSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateNotificationSettings(formData)).unwrap();
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="notification-settings">
      <h2>Notification Settings</h2>

      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <h3>General Settings</h3>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              />
              Email Notifications
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={formData.pushNotifications}
                onChange={(e) => handleChange('pushNotifications', e.target.checked)}
              />
              Push Notifications
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Task Notifications</h3>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={formData.taskAssigned}
                onChange={(e) => handleChange('taskAssigned', e.target.checked)}
              />
              Task Assigned
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={formData.taskCompleted}
                onChange={(e) => handleChange('taskCompleted', e.target.checked)}
              />
              Task Completed
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={formData.deadlines}
                onChange={(e) => handleChange('deadlines', e.target.checked)}
              />
              Task Deadlines
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Social Notifications</h3>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={formData.mentions}
                onChange={(e) => handleChange('mentions', e.target.checked)}
              />
              Mentions
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={formData.comments}
                onChange={(e) => handleChange('comments', e.target.checked)}
              />
              Comments
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>System Notifications</h3>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={formData.systemUpdates}
                onChange={(e) => handleChange('systemUpdates', e.target.checked)}
              />
              System Updates
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
```

## Real-time Notifications

### WebSocket Integration

```jsx
// hooks/useNotifications.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../redux/slices/notificationSlice';
import { useSocket } from './useSocket';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/notification-icon.png',
        });
      }
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket, dispatch]);
};
```

### Push Notifications

```jsx
// utils/pushNotifications.js
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const subscribeToPushNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY),
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

## Notification Templates

### Template Management Component

```jsx
// components/NotificationTemplates.jsx
import { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: '',
    title: '',
    message: '',
    actionText: '',
    actionUrl: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotificationTemplates();
      setTemplates(response.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      await notificationService.createNotificationTemplate(newTemplate);
      setNewTemplate({
        name: '',
        type: '',
        title: '',
        message: '',
        actionText: '',
        actionUrl: '',
      });
      loadTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  return (
    <div className="notification-templates">
      <h2>Notification Templates</h2>

      <form onSubmit={handleCreateTemplate} className="template-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Template Name"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <select
            value={newTemplate.type}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value }))}
            required
          >
            <option value="">Select Type</option>
            <option value="task_assigned">Task Assigned</option>
            <option value="task_completed">Task Completed</option>
            <option value="mention">Mention</option>
            <option value="comment">Comment</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Notification Title"
          value={newTemplate.title}
          onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
          required
        />

        <textarea
          placeholder="Notification Message"
          value={newTemplate.message}
          onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
          rows={3}
          required
        />

        <div className="form-row">
          <input
            type="text"
            placeholder="Action Text (optional)"
            value={newTemplate.actionText}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, actionText: e.target.value }))}
          />
          <input
            type="url"
            placeholder="Action URL (optional)"
            value={newTemplate.actionUrl}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, actionUrl: e.target.value }))}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create Template
        </button>
      </form>

      <div className="templates-list">
        {loading ? (
          <div>Loading templates...</div>
        ) : (
          templates.map(template => (
            <div key={template.id} className="template-item">
              <h3>{template.name}</h3>
              <p><strong>Type:</strong> {template.type}</p>
              <p><strong>Title:</strong> {template.title}</p>
              <p><strong>Message:</strong> {template.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

## Error Handling

### Notification Error Handling

```javascript
// utils/notificationErrors.js
export const handleNotificationError = (error) => {
  switch (error.code) {
    case 'NOTIFICATION_NOT_FOUND':
      return 'Notification not found';
    case 'PERMISSION_DENIED':
      return 'You do not have permission to perform this action';
    case 'INVALID_NOTIFICATION_DATA':
      return 'Invalid notification data';
    case 'NOTIFICATION_SEND_FAILED':
      return 'Failed to send notification';
    case 'TEMPLATE_NOT_FOUND':
      return 'Notification template not found';
    default:
      return 'Notification operation failed';
  }
};
```

## Best Practices

1. **Real-time Updates**: Use WebSocket for instant notifications
2. **Push Notifications**: Implement browser push notifications
3. **Categorization**: Group notifications by type and priority
4. **Settings Control**: Allow users to customize notification preferences
5. **Templates**: Use templates for consistent messaging
6. **Bulk Operations**: Support bulk notification sending
7. **Analytics**: Track notification engagement and delivery
8. **Accessibility**: Ensure notifications are accessible
9. **Performance**: Implement notification batching and queuing
10. **Privacy**: Respect user notification preferences and privacy