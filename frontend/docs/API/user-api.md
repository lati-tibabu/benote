# User API Integration

## Overview

The User API handles user profile management, preferences, and user-related operations in the frontend application.

## User Profile Management

### Profile Service

```javascript
// services/userService.js
import api from '../utils/api';

export const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  async updateAvatar(avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await api.post('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteAvatar() {
    const response = await api.delete('/users/profile/avatar');
    return response.data;
  },

  async updatePreferences(preferences) {
    const response = await api.put('/users/profile/preferences', preferences);
    return response.data;
  },
};
```

### Redux Integration

```javascript
// redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile();
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await userService.updatePreferences(preferences);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en',
      timezone: 'UTC',
    },
    loading: false,
    error: null,
  },
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.preferences = action.payload.preferences || state.preferences;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload.preferences;
      });
  },
});

export const { setProfile, updatePreferences, clearError } = userSlice.actions;
export default userSlice.reducer;
```

## Profile Components

### Profile Page Component

```jsx
// pages/dashboard/Profile/index.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from '../../../redux/slices/userSlice';
import ProfileForm from './ProfileForm';
import PreferencesForm from './PreferencesForm';

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, preferences, loading, error } = useSelector(state => state.user);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, profile]);

  const handleProfileUpdate = async (profileData) => {
    try {
      await dispatch(updateUserProfile(profileData)).unwrap();
      // Show success message
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handlePreferencesUpdate = async (preferencesData) => {
    try {
      await dispatch(updateUserPreferences(preferencesData)).unwrap();
      // Show success message
    } catch (error) {
      console.error('Preferences update failed:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">Error loading profile: {error.message}</div>;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-sections">
        <ProfileForm
          profile={profile}
          onSubmit={handleProfileUpdate}
        />

        <PreferencesForm
          preferences={preferences}
          onSubmit={handlePreferencesUpdate}
        />
      </div>
    </div>
  );
};
```

### Profile Form Component

```jsx
// pages/dashboard/Profile/ProfileForm.jsx
import { useState, useEffect } from 'react';
import { useForm } from '../../../hooks/useForm';

const ProfileForm = ({ profile, onSubmit }) => {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(
    {
      name: profile?.name || '',
      email: profile?.email || '',
      bio: profile?.bio || '',
    },
    (values) => {
      const errors = {};
      if (!values.name.trim()) {
        errors.name = 'Name is required';
      }
      if (!values.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email is invalid';
      }
      return errors;
    }
  );

  const onFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(onSubmit)(e);
  };

  return (
    <div className="profile-form">
      <h2>Personal Information</h2>

      <form onSubmit={onFormSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.name && errors.name ? 'error' : ''}
          />
          {touched.name && errors.name && (
            <span className="error-message">{errors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.email && errors.email ? 'error' : ''}
          />
          {touched.email && errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={values.bio}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={4}
            placeholder="Tell us about yourself..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};
```

### Preferences Form Component

```jsx
// pages/dashboard/Profile/PreferencesForm.jsx
import { useState } from 'react';

const PreferencesForm = ({ preferences, onSubmit }) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const handleChange = (key, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(localPreferences);
  };

  return (
    <div className="preferences-form">
      <h2>Preferences</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={localPreferences.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={localPreferences.language}
            onChange={(e) => handleChange('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            value={localPreferences.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localPreferences.notifications}
              onChange={(e) => handleChange('notifications', e.target.checked)}
            />
            Enable notifications
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Save Preferences
        </button>
      </form>
    </div>
  );
};
```

## Avatar Upload

### Avatar Upload Component

```jsx
// components/AvatarUpload.jsx
import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../redux/slices/userSlice';

const AvatarUpload = ({ currentAvatar, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();
  const dispatch = useDispatch();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);

      // Upload file
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const result = await dispatch(updateUserProfile({ avatar: file })).unwrap();
      onUpload?.(result.avatar);
      setPreview(null);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await dispatch(updateUserProfile({ avatar: null })).unwrap();
      onUpload?.(null);
    } catch (error) {
      console.error('Avatar removal failed:', error);
      alert('Failed to remove avatar');
    }
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        <img
          src={preview || currentAvatar || '/default-avatar.png'}
          alt="Avatar"
          className="avatar-image"
        />
      </div>

      <div className="avatar-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn btn-sm"
        >
          {uploading ? 'Uploading...' : 'Change Avatar'}
        </button>

        {currentAvatar && (
          <button
            type="button"
            onClick={handleRemove}
            className="btn btn-sm btn-outline btn-error"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};
```

## User Settings

### Settings Page Component

```jsx
// pages/dashboard/Settings/index.jsx
import { useSelector, useDispatch } from 'react-redux';
import { updateUserPreferences } from '../../../redux/slices/userSlice';
import ThemeSelector from './ThemeSelector';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';

const Settings = () => {
  const dispatch = useDispatch();
  const { preferences } = useSelector(state => state.user);

  const handlePreferenceUpdate = async (key, value) => {
    try {
      await dispatch(updateUserPreferences({ [key]: value })).unwrap();
    } catch (error) {
      console.error('Settings update failed:', error);
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-sections">
        <ThemeSelector
          currentTheme={preferences.theme}
          onThemeChange={(theme) => handlePreferenceUpdate('theme', theme)}
        />

        <NotificationSettings
          settings={preferences.notifications}
          onSettingsChange={(settings) => handlePreferenceUpdate('notifications', settings)}
        />

        <PrivacySettings
          settings={preferences.privacy}
          onSettingsChange={(settings) => handlePreferenceUpdate('privacy', settings)}
        />
      </div>
    </div>
  );
};
```

## User List (Admin)

### User Management Component

```jsx
// pages/admin/Users.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUserRole, deactivateUser } from '../../../redux/slices/adminSlice';

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
    } catch (error) {
      console.error('Role update failed:', error);
    }
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await dispatch(deactivateUser(userId)).unwrap();
      } catch (error) {
        console.error('User deactivation failed:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return <div className="error">Error loading users: {error.message}</div>;
  }

  return (
    <div className="users-management">
      <h1>User Management</h1>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {user.active && (
                    <button
                      onClick={() => handleDeactivate(user.id)}
                      className="btn btn-sm btn-error"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

## Error Handling

### Profile Error Handling

```javascript
// utils/profileErrors.js
export const handleProfileError = (error) => {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again';
    case 'EMAIL_EXISTS':
      return 'This email is already in use';
    case 'INVALID_FILE_TYPE':
      return 'Please upload a valid image file';
    case 'FILE_TOO_LARGE':
      return 'File size must be less than 5MB';
    default:
      return 'Profile update failed';
  }
};
```

## Best Practices

1. **Form Validation**: Validate user input on both client and server
2. **File Upload**: Validate file type and size before upload
3. **Optimistic Updates**: Update UI immediately, rollback on error
4. **Loading States**: Show loading indicators during operations
5. **Error Handling**: Provide clear error messages to users
6. **Data Persistence**: Save preferences to local storage
7. **Accessibility**: Ensure forms are accessible
8. **Security**: Never expose sensitive user data