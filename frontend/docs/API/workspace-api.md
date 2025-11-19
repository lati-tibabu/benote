# Workspace API Integration

## Overview

The Workspace API manages workspaces, their members, and related operations in the frontend application.

## Workspace Service

```javascript
// services/workspaceService.js
import api from '../utils/api';

export const workspaceService = {
  async getWorkspaces(params = {}) {
    const response = await api.get('/workspaces', { params });
    return response.data;
  },

  async createWorkspace(workspaceData) {
    const response = await api.post('/workspaces', workspaceData);
    return response.data;
  },

  async getWorkspace(workspaceId) {
    const response = await api.get(`/workspaces/${workspaceId}`);
    return response.data;
  },

  async updateWorkspace(workspaceId, workspaceData) {
    const response = await api.put(`/workspaces/${workspaceId}`, workspaceData);
    return response.data;
  },

  async deleteWorkspace(workspaceId) {
    const response = await api.delete(`/workspaces/${workspaceId}`);
    return response.data;
  },

  async getWorkspaceMembers(workspaceId) {
    const response = await api.get(`/workspaces/${workspaceId}/members`);
    return response.data;
  },

  async inviteMember(workspaceId, invitationData) {
    const response = await api.post(`/workspaces/${workspaceId}/members`, invitationData);
    return response.data;
  },

  async updateMemberRole(workspaceId, userId, roleData) {
    const response = await api.put(`/workspaces/${workspaceId}/members/${userId}`, roleData);
    return response.data;
  },

  async removeMember(workspaceId, userId) {
    const response = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    return response.data;
  },
};
```

## Redux Integration

```javascript
// redux/slices/workspaceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { workspaceService } from '../../services/workspaceService';

export const fetchWorkspaces = createAsyncThunk(
  'workspace/fetchWorkspaces',
  async (params, { rejectWithValue }) => {
    try {
      const response = await workspaceService.getWorkspaces(params);
      return response.workspaces;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/createWorkspace',
  async (workspaceData, { rejectWithValue }) => {
    try {
      const response = await workspaceService.createWorkspace(workspaceData);
      return response.workspace;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchWorkspaceDetails = createAsyncThunk(
  'workspace/fetchWorkspaceDetails',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await workspaceService.getWorkspace(workspaceId);
      return response.workspace;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateWorkspace = createAsyncThunk(
  'workspace/updateWorkspace',
  async ({ workspaceId, workspaceData }, { rejectWithValue }) => {
    try {
      const response = await workspaceService.updateWorkspace(workspaceId, workspaceData);
      return response.workspace;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspace/deleteWorkspace',
  async (workspaceId, { rejectWithValue }) => {
    try {
      await workspaceService.deleteWorkspace(workspaceId);
      return workspaceId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    workspaces: [],
    currentWorkspace: null,
    members: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
    },
    clearCurrentWorkspace: (state) => {
      state.currentWorkspace = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = action.payload;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.workspaces.push(action.payload);
      })
      .addCase(fetchWorkspaceDetails.fulfilled, (state, action) => {
        state.currentWorkspace = action.payload;
      })
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        const index = state.workspaces.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.workspaces[index] = action.payload;
        }
        if (state.currentWorkspace?.id === action.payload.id) {
          state.currentWorkspace = action.payload;
        }
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.filter(w => w.id !== action.payload);
        if (state.currentWorkspace?.id === action.payload) {
          state.currentWorkspace = null;
        }
      });
  },
});

export const { setCurrentWorkspace, clearCurrentWorkspace, clearError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
```

## Workspace Components

### Workspace List Component

```jsx
// components/WorkspaceList.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWorkspaces } from '../redux/slices/workspaceSlice';
import WorkspaceCard from './WorkspaceCard';

const WorkspaceList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workspaces, loading, error } = useSelector(state => state.workspace);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const handleWorkspaceClick = (workspaceId) => {
    navigate(`/dashboard/workspace/${workspaceId}`);
  };

  const handleCreateWorkspace = () => {
    navigate('/dashboard/workspace/create');
  };

  if (loading) {
    return <div className="loading">Loading workspaces...</div>;
  }

  if (error) {
    return <div className="error">Error loading workspaces: {error.message}</div>;
  }

  return (
    <div className="workspace-list">
      <div className="workspace-header">
        <h1>My Workspaces</h1>
        <button
          onClick={handleCreateWorkspace}
          className="btn btn-primary"
        >
          Create Workspace
        </button>
      </div>

      <div className="workspace-grid">
        {workspaces.map(workspace => (
          <WorkspaceCard
            key={workspace.id}
            workspace={workspace}
            onClick={() => handleWorkspaceClick(workspace.id)}
          />
        ))}

        {workspaces.length === 0 && (
          <div className="empty-state">
            <h3>No workspaces yet</h3>
            <p>Create your first workspace to get started</p>
            <button
              onClick={handleCreateWorkspace}
              className="btn btn-primary"
            >
              Create Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

### Workspace Card Component

```jsx
// components/WorkspaceCard.jsx
import { formatDistanceToNow } from 'date-fns';

const WorkspaceCard = ({ workspace, onClick }) => {
  const formatLastActivity = (date) => {
    if (!date) return 'No activity';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="workspace-card" onClick={onClick}>
      <div className="workspace-header">
        <div
          className="workspace-color"
          style={{ backgroundColor: workspace.color }}
        />
        <h3 className="workspace-name">{workspace.name}</h3>
      </div>

      <p className="workspace-description">{workspace.description}</p>

      <div className="workspace-meta">
        <span className="member-count">
          {workspace.members?.length || 0} members
        </span>
        <span className="last-activity">
          {formatLastActivity(workspace.updatedAt)}
        </span>
      </div>

      <div className="workspace-actions">
        <button className="btn btn-sm btn-ghost">View Details</button>
      </div>
    </div>
  );
};
```

### Create Workspace Component

```jsx
// components/CreateWorkspace.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createWorkspace } from '../redux/slices/workspaceSlice';

const CreateWorkspace = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
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
      const result = await dispatch(createWorkspace(formData)).unwrap();
      navigate(`/dashboard/workspace/${result.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create workspace');
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
    <div className="create-workspace">
      <h1>Create New Workspace</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Workspace Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter workspace name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe your workspace"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="color">Color</label>
          <input
            type="color"
            id="color"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
          />
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
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </form>
    </div>
  );
};
```

## Workspace Details Component

```jsx
// components/WorkspaceDetails.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWorkspaceDetails, deleteWorkspace } from '../redux/slices/workspaceSlice';
import WorkspaceHeader from './WorkspaceHeader';
import WorkspaceMembers from './WorkspaceMembers';
import WorkspaceSettings from './WorkspaceSettings';

const WorkspaceDetails = () => {
  const { workspaceId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentWorkspace, loading, error } = useSelector(state => state.workspace);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceDetails(workspaceId));
    }
  }, [dispatch, workspaceId]);

  const handleDeleteWorkspace = async () => {
    if (window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      try {
        await dispatch(deleteWorkspace(workspaceId)).unwrap();
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to delete workspace:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading workspace...</div>;
  }

  if (error) {
    return <div className="error">Error loading workspace: {error.message}</div>;
  }

  if (!currentWorkspace) {
    return <div className="error">Workspace not found</div>;
  }

  return (
    <div className="workspace-details">
      <WorkspaceHeader
        workspace={currentWorkspace}
        onDelete={handleDeleteWorkspace}
      />

      <div className="workspace-content">
        <WorkspaceMembers workspace={currentWorkspace} />
        <WorkspaceSettings workspace={currentWorkspace} />
      </div>
    </div>
  );
};
```

## Member Management

### Workspace Members Component

```jsx
// components/WorkspaceMembers.jsx
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchWorkspaceMembers, inviteMember, updateMemberRole, removeMember } from '../redux/slices/workspaceSlice';

const WorkspaceMembers = ({ workspace }) => {
  const dispatch = useDispatch();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [workspace.id]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const result = await dispatch(fetchWorkspaceMembers(workspace.id)).unwrap();
      setMembers(result.members);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await dispatch(inviteMember(workspace.id, { email: inviteEmail })).unwrap();
      setInviteEmail('');
      alert('Invitation sent successfully');
    } catch (error) {
      console.error('Failed to send invitation:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await dispatch(updateMemberRole(workspace.id, userId, { role: newRole })).unwrap();
      // Update local state
      setMembers(prev => prev.map(member =>
        member.id === userId ? { ...member, role: newRole } : member
      ));
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await dispatch(removeMember(workspace.id, userId)).unwrap();
        setMembers(prev => prev.filter(member => member.id !== userId));
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    }
  };

  return (
    <div className="workspace-members">
      <h2>Members</h2>

      <form onSubmit={handleInvite} className="invite-form">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="Enter email to invite"
          required
        />
        <button
          type="submit"
          disabled={inviting}
          className="btn btn-primary"
        >
          {inviting ? 'Sending...' : 'Invite'}
        </button>
      </form>

      <div className="members-list">
        {loading ? (
          <div>Loading members...</div>
        ) : (
          members.map(member => (
            <div key={member.id} className="member-item">
              <div className="member-info">
                <img
                  src={member.avatar || '/default-avatar.png'}
                  alt={member.name}
                  className="member-avatar"
                />
                <div>
                  <h4>{member.name}</h4>
                  <p>{member.email}</p>
                </div>
              </div>

              <div className="member-actions">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="btn btn-sm btn-error"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

## Error Handling

### Workspace Error Handling

```javascript
// utils/workspaceErrors.js
export const handleWorkspaceError = (error) => {
  switch (error.code) {
    case 'WORKSPACE_NOT_FOUND':
      return 'Workspace not found';
    case 'INSUFFICIENT_PERMISSIONS':
      return 'You do not have permission to perform this action';
    case 'MEMBER_LIMIT_EXCEEDED':
      return 'Workspace member limit exceeded';
    case 'INVALID_INVITATION':
      return 'Invalid invitation';
    default:
      return 'Workspace operation failed';
  }
};
```

## Best Practices

1. **Optimistic Updates**: Update UI immediately, rollback on error
2. **Loading States**: Show loading indicators during operations
3. **Error Handling**: Provide clear error messages to users
4. **Member Permissions**: Check permissions before showing actions
5. **Real-time Updates**: Use WebSocket for real-time member updates
6. **Caching**: Cache workspace data to reduce API calls
7. **Validation**: Validate workspace data on client and server
8. **Accessibility**: Ensure member management is accessible