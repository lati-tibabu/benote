# Tasks API Integration

## Overview

The Tasks API manages task creation, assignment, tracking, and completion within workspaces.

## Task Service

```javascript
// services/taskService.js
import api from '../utils/api';

export const taskService = {
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async getTask(taskId) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  async updateTask(taskId, taskData) {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  async assignTask(taskId, assignmentData) {
    const response = await api.post(`/tasks/${taskId}/assign`, assignmentData);
    return response.data;
  },

  async unassignTask(taskId, userId) {
    const response = await api.delete(`/tasks/${taskId}/assign/${userId}`);
    return response.data;
  },

  async addTaskComment(taskId, commentData) {
    const response = await api.post(`/tasks/${taskId}/comments`, commentData);
    return response.data;
  },

  async getTaskComments(taskId) {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  async updateTaskStatus(taskId, statusData) {
    const response = await api.patch(`/tasks/${taskId}/status`, statusData);
    return response.data;
  },

  async addTaskAttachment(taskId, attachmentData) {
    const response = await api.post(`/tasks/${taskId}/attachments`, attachmentData);
    return response.data;
  },

  async getTaskAttachments(taskId) {
    const response = await api.get(`/tasks/${taskId}/attachments`);
    return response.data;
  },

  async deleteTaskAttachment(taskId, attachmentId) {
    const response = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
    return response.data;
  },
};
```

## Redux Integration

```javascript
// redux/slices/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../services/taskService';

export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks(params);
      return response.tasks;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(taskData);
      return response.task;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchTaskDetails = createAsyncThunk(
  'task/fetchTaskDetails',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await taskService.getTask(taskId);
      return response.task;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(taskId, taskData);
      return response.task;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const assignTask = createAsyncThunk(
  'task/assignTask',
  async ({ taskId, assignmentData }, { rejectWithValue }) => {
    try {
      const response = await taskService.assignTask(taskId, assignmentData);
      return { taskId, assignment: response.assignment };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'task/updateTaskStatus',
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTaskStatus(taskId, { status });
      return { taskId, status: response.task.status };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState: {
    tasks: [],
    currentTask: null,
    comments: [],
    attachments: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addTaskComment: (state, action) => {
      state.comments.push(action.payload);
    },
    updateTaskComment: (state, action) => {
      const index = state.comments.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    },
    deleteTaskComment: (state, action) => {
      state.comments = state.comments.filter(c => c.id !== action.payload);
    },
    addTaskAttachment: (state, action) => {
      state.attachments.push(action.payload);
    },
    deleteTaskAttachment: (state, action) => {
      state.attachments = state.attachments.filter(a => a.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(fetchTaskDetails.fulfilled, (state, action) => {
        state.currentTask = action.payload;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(assignTask.fulfilled, (state, action) => {
        const task = state.tasks.find(t => t.id === action.payload.taskId);
        if (task) {
          task.assignments = task.assignments || [];
          task.assignments.push(action.payload.assignment);
        }
        if (state.currentTask?.id === action.payload.taskId) {
          state.currentTask.assignments = state.currentTask.assignments || [];
          state.currentTask.assignments.push(action.payload.assignment);
        }
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const task = state.tasks.find(t => t.id === action.payload.taskId);
        if (task) {
          task.status = action.payload.status;
        }
        if (state.currentTask?.id === action.payload.taskId) {
          state.currentTask.status = action.payload.status;
        }
      });
  },
});

export const {
  setCurrentTask,
  clearCurrentTask,
  clearError,
  addTaskComment,
  updateTaskComment,
  deleteTaskComment,
  addTaskAttachment,
  deleteTaskAttachment,
} = taskSlice.actions;

export default taskSlice.reducer;
```

## Task Components

### Task List Component

```jsx
// components/TaskList.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchTasks } from '../redux/slices/taskSlice';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';

const TaskList = () => {
  const { workspaceId } = useParams();
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector(state => state.task);
  const [filters, setFilters] = useState({
    status: 'all',
    assignee: 'all',
    priority: 'all',
  });

  useEffect(() => {
    dispatch(fetchTasks({ workspaceId, ...filters }));
  }, [dispatch, workspaceId, filters]);

  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.assignee !== 'all' && task.assignee?.id !== filters.assignee) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    return true;
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error">Error loading tasks: {error.message}</div>;
  }

  return (
    <div className="task-list">
      <div className="task-header">
        <h1>Tasks</h1>
        <TaskFilters filters={filters} onChange={handleFilterChange} />
      </div>

      <div className="task-grid">
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}

        {filteredTasks.length === 0 && (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>Create your first task to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

### Task Card Component

```jsx
// components/TaskCard.jsx
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateTaskStatus } from '../redux/slices/taskSlice';
import { formatDistanceToNow } from 'date-fns';

const TaskCard = ({ task }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(updateTaskStatus({ taskId: task.id, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleClick = () => {
    navigate(`/dashboard/task/${task.id}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="task-card" onClick={handleClick}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`task-priority ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <p className="task-description">{task.description}</p>

      <div className="task-meta">
        <div className="task-assignee">
          {task.assignee && (
            <div className="assignee-info">
              <img
                src={task.assignee.avatar || '/default-avatar.png'}
                alt={task.assignee.name}
                className="assignee-avatar"
              />
              <span>{task.assignee.name}</span>
            </div>
          )}
        </div>

        <div className="task-due-date">
          {task.dueDate && (
            <span className="due-date">
              Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>

      <div className="task-footer">
        <span className={`task-status ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>

        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="status-select"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
};
```

### Create Task Component

```jsx
// components/CreateTask.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createTask } from '../redux/slices/taskSlice';

const CreateTask = () => {
  const { workspaceId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assigneeId: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const taskData = {
        ...formData,
        workspaceId,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };

      const result = await dispatch(createTask(taskData)).unwrap();
      navigate(`/dashboard/task/${result.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="create-task">
      <h1>Create New Task</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Task Title</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the task"
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="assigneeId">Assignee</label>
          <select
            id="assigneeId"
            value={formData.assigneeId}
            onChange={(e) => handleChange('assigneeId', e.target.value)}
          >
            <option value="">Unassigned</option>
            {/* Map through workspace members */}
          </select>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};
```

### Task Details Component

```jsx
// components/TaskDetails.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTaskDetails, deleteTask } from '../redux/slices/taskSlice';
import TaskHeader from './TaskHeader';
import TaskComments from './TaskComments';
import TaskAttachments from './TaskAttachments';

const TaskDetails = () => {
  const { taskId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTask, loading, error } = useSelector(state => state.task);

  useEffect(() => {
    if (taskId) {
      dispatch(fetchTaskDetails(taskId));
    }
  }, [dispatch, taskId]);

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading task...</div>;
  }

  if (error) {
    return <div className="error">Error loading task: {error.message}</div>;
  }

  if (!currentTask) {
    return <div className="error">Task not found</div>;
  }

  return (
    <div className="task-details">
      <TaskHeader
        task={currentTask}
        onDelete={handleDeleteTask}
      />

      <div className="task-content">
        <div className="task-main">
          <div className="task-description">
            <h3>Description</h3>
            <p>{currentTask.description || 'No description provided'}</p>
          </div>

          <TaskComments taskId={taskId} />
        </div>

        <div className="task-sidebar">
          <TaskAttachments taskId={taskId} />
        </div>
      </div>
    </div>
  );
};
```

## Comments and Attachments

### Task Comments Component

```jsx
// components/TaskComments.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTaskComment } from '../redux/slices/taskSlice';
import { taskService } from '../services/taskService';

const TaskComments = ({ taskId }) => {
  const dispatch = useDispatch();
  const { comments } = useSelector(state => state.task);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = async () => {
    try {
      const response = await taskService.getTaskComments(taskId);
      // Update Redux state with comments
      response.comments.forEach(comment => {
        dispatch(addTaskComment(comment));
      });
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const result = await dispatch(addTaskComment({
        taskId,
        content: newComment,
      })).unwrap();
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-comments">
      <h3>Comments</h3>

      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <div className="comment-header">
              <img
                src={comment.author.avatar || '/default-avatar.png'}
                alt={comment.author.name}
                className="comment-avatar"
              />
              <div>
                <span className="comment-author">{comment.author.name}</span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="comment-content">{comment.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          required
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="btn btn-primary"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
};
```

### Task Attachments Component

```jsx
// components/TaskAttachments.jsx
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTaskAttachment, deleteTaskAttachment } from '../redux/slices/taskSlice';
import { taskService } from '../services/taskService';

const TaskAttachments = ({ taskId }) => {
  const dispatch = useDispatch();
  const { attachments } = useSelector(state => state.task);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAttachments();
  }, [taskId]);

  const loadAttachments = async () => {
    try {
      const response = await taskService.getTaskAttachments(taskId);
      response.attachments.forEach(attachment => {
        dispatch(addTaskAttachment(attachment));
      });
    } catch (error) {
      console.error('Failed to load attachments:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await dispatch(addTaskAttachment({
        taskId,
        file: formData,
      })).unwrap();
    } catch (error) {
      console.error('Failed to upload attachment:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await dispatch(deleteTaskAttachment({
          taskId,
          attachmentId,
        })).unwrap();
      } catch (error) {
        console.error('Failed to delete attachment:', error);
      }
    }
  };

  return (
    <div className="task-attachments">
      <h3>Attachments</h3>

      <div className="attachments-list">
        {attachments.map(attachment => (
          <div key={attachment.id} className="attachment">
            <div className="attachment-info">
              <i className="attachment-icon">📎</i>
              <div>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-name"
                >
                  {attachment.name}
                </a>
                <span className="attachment-size">
                  {(attachment.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDeleteAttachment(attachment.id)}
              className="btn btn-sm btn-error"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="upload-section">
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          accept="image/*,application/*,text/*"
        />
        {uploading && <span>Uploading...</span>}
      </div>
    </div>
  );
};
```

## Error Handling

### Task Error Handling

```javascript
// utils/taskErrors.js
export const handleTaskError = (error) => {
  switch (error.code) {
    case 'TASK_NOT_FOUND':
      return 'Task not found';
    case 'INSUFFICIENT_PERMISSIONS':
      return 'You do not have permission to perform this action';
    case 'INVALID_ASSIGNMENT':
      return 'Invalid task assignment';
    case 'DUPLICATE_ASSIGNMENT':
      return 'User is already assigned to this task';
    case 'INVALID_STATUS_TRANSITION':
      return 'Invalid status transition';
    default:
      return 'Task operation failed';
  }
};
```

## Best Practices

1. **Optimistic Updates**: Update UI immediately for status changes
2. **Real-time Sync**: Use WebSocket for live task updates
3. **File Upload**: Handle large files with progress indicators
4. **Comment Threads**: Support threaded conversations
5. **Task Templates**: Allow creation from predefined templates
6. **Time Tracking**: Track time spent on tasks
7. **Dependencies**: Support task dependencies and blockers
8. **Notifications**: Send notifications for task updates
9. **Search**: Full-text search across tasks and comments
10. **Bulk Operations**: Support bulk task operations