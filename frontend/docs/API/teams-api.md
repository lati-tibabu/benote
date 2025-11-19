# Teams API Integration

## Overview

The Teams API manages team creation, membership, and collaboration features within workspaces.

## Team Service

```javascript
// services/teamService.js
import api from '../utils/api';

export const teamService = {
  async getTeams(params = {}) {
    const response = await api.get('/teams', { params });
    return response.data;
  },

  async createTeam(teamData) {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  async getTeam(teamId) {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  async updateTeam(teamId, teamData) {
    const response = await api.put(`/teams/${teamId}`, teamData);
    return response.data;
  },

  async deleteTeam(teamId) {
    const response = await api.delete(`/teams/${teamId}`);
    return response.data;
  },

  async getTeamMembers(teamId) {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
  },

  async addTeamMember(teamId, memberData) {
    const response = await api.post(`/teams/${teamId}/members`, memberData);
    return response.data;
  },

  async updateTeamMember(teamId, userId, memberData) {
    const response = await api.put(`/teams/${teamId}/members/${userId}`, memberData);
    return response.data;
  },

  async removeTeamMember(teamId, userId) {
    const response = await api.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  },

  async getTeamProjects(teamId) {
    const response = await api.get(`/teams/${teamId}/projects`);
    return response.data;
  },

  async createTeamProject(teamId, projectData) {
    const response = await api.post(`/teams/${teamId}/projects`, projectData);
    return response.data;
  },

  async getTeamDiscussions(teamId) {
    const response = await api.get(`/teams/${teamId}/discussions`);
    return response.data;
  },

  async createTeamDiscussion(teamId, discussionData) {
    const response = await api.post(`/teams/${teamId}/discussions`, discussionData);
    return response.data;
  },
};
```

## Redux Integration

```javascript
// redux/slices/teamSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamService } from '../../services/teamService';

export const fetchTeams = createAsyncThunk(
  'team/fetchTeams',
  async (params, { rejectWithValue }) => {
    try {
      const response = await teamService.getTeams(params);
      return response.teams;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTeam = createAsyncThunk(
  'team/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const response = await teamService.createTeam(teamData);
      return response.team;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchTeamDetails = createAsyncThunk(
  'team/fetchTeamDetails',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await teamService.getTeam(teamId);
      return response.team;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTeam = createAsyncThunk(
  'team/updateTeam',
  async ({ teamId, teamData }, { rejectWithValue }) => {
    try {
      const response = await teamService.updateTeam(teamId, teamData);
      return response.team;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'team/deleteTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      await teamService.deleteTeam(teamId);
      return teamId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchTeamMembers = createAsyncThunk(
  'team/fetchTeamMembers',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await teamService.getTeamMembers(teamId);
      return { teamId, members: response.members };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addTeamMember = createAsyncThunk(
  'team/addTeamMember',
  async ({ teamId, memberData }, { rejectWithValue }) => {
    try {
      const response = await teamService.addTeamMember(teamId, memberData);
      return { teamId, member: response.member };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState: {
    teams: [],
    currentTeam: null,
    teamMembers: {},
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentTeam: (state, action) => {
      state.currentTeam = action.payload;
    },
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateTeamMember: (state, action) => {
      const { teamId, userId, memberData } = action.payload;
      if (state.teamMembers[teamId]) {
        const memberIndex = state.teamMembers[teamId].findIndex(m => m.userId === userId);
        if (memberIndex !== -1) {
          state.teamMembers[teamId][memberIndex] = {
            ...state.teamMembers[teamId][memberIndex],
            ...memberData,
          };
        }
      }
    },
    removeTeamMember: (state, action) => {
      const { teamId, userId } = action.payload;
      if (state.teamMembers[teamId]) {
        state.teamMembers[teamId] = state.teamMembers[teamId].filter(m => m.userId !== userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload);
      })
      .addCase(fetchTeamDetails.fulfilled, (state, action) => {
        state.currentTeam = action.payload;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
        if (state.currentTeam?.id === action.payload.id) {
          state.currentTeam = action.payload;
        }
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter(t => t.id !== action.payload);
        if (state.currentTeam?.id === action.payload) {
          state.currentTeam = null;
        }
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.teamMembers[action.payload.teamId] = action.payload.members;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        if (!state.teamMembers[action.payload.teamId]) {
          state.teamMembers[action.payload.teamId] = [];
        }
        state.teamMembers[action.payload.teamId].push(action.payload.member);
      });
  },
});

export const {
  setCurrentTeam,
  clearCurrentTeam,
  clearError,
  updateTeamMember,
  removeTeamMember,
} = teamSlice.actions;

export default teamSlice.reducer;
```

## Team Components

### Team List Component

```jsx
// components/TeamList.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchTeams } from '../redux/slices/teamSlice';
import TeamCard from './TeamCard';

const TeamList = () => {
  const { workspaceId } = useParams();
  const dispatch = useDispatch();
  const { teams, loading, error } = useSelector(state => state.team);

  useEffect(() => {
    dispatch(fetchTeams({ workspaceId }));
  }, [dispatch, workspaceId]);

  if (loading) {
    return <div className="loading">Loading teams...</div>;
  }

  if (error) {
    return <div className="error">Error loading teams: {error.message}</div>;
  }

  return (
    <div className="team-list">
      <div className="team-header">
        <h1>Teams</h1>
        <button className="btn btn-primary">Create Team</button>
      </div>

      <div className="team-grid">
        {teams.map(team => (
          <TeamCard key={team.id} team={team} />
        ))}

        {teams.length === 0 && (
          <div className="empty-state">
            <h3>No teams yet</h3>
            <p>Create your first team to start collaborating</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

### Team Card Component

```jsx
// components/TeamCard.jsx
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const TeamCard = ({ team }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/team/${team.id}`);
  };

  return (
    <div className="team-card" onClick={handleClick}>
      <div className="team-header">
        <div
          className="team-color"
          style={{ backgroundColor: team.color }}
        />
        <h3 className="team-name">{team.name}</h3>
      </div>

      <p className="team-description">{team.description}</p>

      <div className="team-meta">
        <span className="member-count">
          {team.members?.length || 0} members
        </span>
        <span className="last-activity">
          {formatDistanceToNow(new Date(team.updatedAt), { addSuffix: true })}
        </span>
      </div>

      <div className="team-members-preview">
        {team.members?.slice(0, 3).map(member => (
          <img
            key={member.id}
            src={member.avatar || '/default-avatar.png'}
            alt={member.name}
            className="member-avatar"
            title={member.name}
          />
        ))}
        {team.members?.length > 3 && (
          <span className="more-members">+{team.members.length - 3}</span>
        )}
      </div>

      <div className="team-actions">
        <button className="btn btn-sm btn-ghost">View Details</button>
      </div>
    </div>
  );
};
```

### Create Team Component

```jsx
// components/CreateTeam.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createTeam } from '../redux/slices/teamSlice';

const CreateTeam = () => {
  const { workspaceId } = useParams();
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
      const teamData = {
        ...formData,
        workspaceId,
      };

      const result = await dispatch(createTeam(teamData)).unwrap();
      navigate(`/dashboard/team/${result.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create team');
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
    <div className="create-team">
      <h1>Create New Team</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Team Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter team name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe your team"
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
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
};
```

### Team Details Component

```jsx
// components/TeamDetails.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTeamDetails, deleteTeam } from '../redux/slices/teamSlice';
import TeamHeader from './TeamHeader';
import TeamMembers from './TeamMembers';
import TeamProjects from './TeamProjects';
import TeamDiscussions from './TeamDiscussions';

const TeamDetails = () => {
  const { teamId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTeam, loading, error } = useSelector(state => state.team);

  useEffect(() => {
    if (teamId) {
      dispatch(fetchTeamDetails(teamId));
    }
  }, [dispatch, teamId]);

  const handleDeleteTeam = async () => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await dispatch(deleteTeam(teamId)).unwrap();
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to delete team:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading team...</div>;
  }

  if (error) {
    return <div className="error">Error loading team: {error.message}</div>;
  }

  if (!currentTeam) {
    return <div className="error">Team not found</div>;
  }

  return (
    <div className="team-details">
      <TeamHeader
        team={currentTeam}
        onDelete={handleDeleteTeam}
      />

      <div className="team-content">
        <TeamMembers team={currentTeam} />
        <TeamProjects team={currentTeam} />
        <TeamDiscussions team={currentTeam} />
      </div>
    </div>
  );
};
```

## Team Members Management

### Team Members Component

```jsx
// components/TeamMembers.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeamMembers, addTeamMember, updateTeamMember, removeTeamMember } from '../redux/slices/teamSlice';

const TeamMembers = ({ team }) => {
  const dispatch = useDispatch();
  const { teamMembers } = useSelector(state => state.team);
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [team.id]);

  const loadMembers = async () => {
    try {
      const result = await dispatch(fetchTeamMembers(team.id)).unwrap();
      setMembers(result.members);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await dispatch(addTeamMember({
        teamId: team.id,
        memberData: { email: inviteEmail },
      })).unwrap();
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
      await dispatch(updateTeamMember({
        teamId: team.id,
        userId,
        memberData: { role: newRole },
      })).unwrap();
      // Update local state
      setMembers(prev => prev.map(member =>
        member.userId === userId ? { ...member, role: newRole } : member
      ));
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await dispatch(removeTeamMember({
          teamId: team.id,
          userId,
        })).unwrap();
        setMembers(prev => prev.filter(member => member.userId !== userId));
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    }
  };

  return (
    <div className="team-members">
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
        {members.map(member => (
          <div key={member.userId} className="member-item">
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
                onChange={(e) => handleRoleChange(member.userId, e.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="lead">Lead</option>
              </select>

              <button
                onClick={() => handleRemoveMember(member.userId)}
                className="btn btn-sm btn-error"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Team Projects

### Team Projects Component

```jsx
// components/TeamProjects.jsx
import { useEffect, useState } from 'react';
import { teamService } from '../services/teamService';

const TeamProjects = ({ team }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [team.id]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await teamService.getTeamProjects(team.id);
      setProjects(response.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    // Implementation for creating team project
  };

  return (
    <div className="team-projects">
      <div className="projects-header">
        <h2>Projects</h2>
        <button
          onClick={handleCreateProject}
          className="btn btn-primary"
        >
          Create Project
        </button>
      </div>

      <div className="projects-list">
        {loading ? (
          <div>Loading projects...</div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="project-meta">
                <span>Status: {project.status}</span>
                <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

## Team Discussions

### Team Discussions Component

```jsx
// components/TeamDiscussions.jsx
import { useEffect, useState } from 'react';
import { teamService } from '../services/teamService';

const TeamDiscussions = ({ team }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    loadDiscussions();
  }, [team.id]);

  const loadDiscussions = async () => {
    setLoading(true);
    try {
      const response = await teamService.getTeamDiscussions(team.id);
      setDiscussions(response.discussions);
    } catch (error) {
      console.error('Failed to load discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    try {
      await teamService.createTeamDiscussion(team.id, newDiscussion);
      setNewDiscussion({ title: '', content: '' });
      loadDiscussions(); // Refresh discussions
    } catch (error) {
      console.error('Failed to create discussion:', error);
    }
  };

  return (
    <div className="team-discussions">
      <h2>Discussions</h2>

      <form onSubmit={handleCreateDiscussion} className="discussion-form">
        <input
          type="text"
          value={newDiscussion.title}
          onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Discussion title"
          required
        />
        <textarea
          value={newDiscussion.content}
          onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Start a discussion..."
          rows={4}
          required
        />
        <button type="submit" className="btn btn-primary">
          Start Discussion
        </button>
      </form>

      <div className="discussions-list">
        {loading ? (
          <div>Loading discussions...</div>
        ) : (
          discussions.map(discussion => (
            <div key={discussion.id} className="discussion-item">
              <h3>{discussion.title}</h3>
              <p>{discussion.content}</p>
              <div className="discussion-meta">
                <span>By {discussion.author.name}</span>
                <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                <span>{discussion.repliesCount} replies</span>
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

### Team Error Handling

```javascript
// utils/teamErrors.js
export const handleTeamError = (error) => {
  switch (error.code) {
    case 'TEAM_NOT_FOUND':
      return 'Team not found';
    case 'INSUFFICIENT_PERMISSIONS':
      return 'You do not have permission to perform this action';
    case 'MEMBER_LIMIT_EXCEEDED':
      return 'Team member limit exceeded';
    case 'INVALID_INVITATION':
      return 'Invalid invitation';
    case 'DUPLICATE_MEMBERSHIP':
      return 'User is already a member of this team';
    default:
      return 'Team operation failed';
  }
};
```

## Best Practices

1. **Role-based Access**: Implement granular permissions for team operations
2. **Real-time Collaboration**: Use WebSocket for live team updates
3. **Team Analytics**: Track team performance and productivity metrics
4. **Project Management**: Integrate with project management tools
5. **Communication Tools**: Provide integrated chat and video calling
6. **File Sharing**: Support team file sharing and collaboration
7. **Calendar Integration**: Sync team events and deadlines
8. **Performance Tracking**: Monitor individual and team contributions
9. **Feedback Systems**: Allow peer feedback and performance reviews
10. **Onboarding**: Streamlined team member onboarding process