# File Upload API Integration

## Overview

The File Upload API handles file uploads, storage, and management for the application, supporting various file types and providing secure access controls.

## File Upload Service

```javascript
// services/fileUploadService.js
import api from '../utils/api';

export const fileUploadService = {
  async uploadFile(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    if (options.metadata) {
      Object.keys(options.metadata).forEach(key => {
        formData.append(key, options.metadata[key]);
      });
    }

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: options.onProgress,
    });

    return response.data;
  },

  async uploadMultipleFiles(files, options = {}) {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    // Add metadata for all files
    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: options.onProgress,
    });

    return response.data;
  },

  async getUploadedFiles(params = {}) {
    const response = await api.get('/files', { params });
    return response.data;
  },

  async getFileDetails(fileId) {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  },

  async downloadFile(fileId) {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteFile(fileId) {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },

  async updateFileMetadata(fileId, metadata) {
    const response = await api.put(`/files/${fileId}/metadata`, metadata);
    return response.data;
  },

  async getFilePreview(fileId, options = {}) {
    const response = await api.get(`/files/${fileId}/preview`, {
      params: options,
      responseType: 'blob',
    });
    return response.data;
  },

  async shareFile(fileId, shareOptions) {
    const response = await api.post(`/files/${fileId}/share`, shareOptions);
    return response.data;
  },

  async getSharedFiles() {
    const response = await api.get('/files/shared');
    return response.data;
  },

  async revokeFileShare(fileId, shareId) {
    const response = await api.delete(`/files/${fileId}/share/${shareId}`);
    return response.data;
  },
};
```

## Redux Integration

```javascript
// redux/slices/fileUploadSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fileUploadService } from '../../services/fileUploadService';

export const uploadFile = createAsyncThunk(
  'fileUpload/uploadFile',
  async ({ file, options }, { rejectWithValue }) => {
    try {
      const response = await fileUploadService.uploadFile(file, options);
      return response.file;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const uploadMultipleFiles = createAsyncThunk(
  'fileUpload/uploadMultipleFiles',
  async ({ files, options }, { rejectWithValue }) => {
    try {
      const response = await fileUploadService.uploadMultipleFiles(files, options);
      return response.files;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUploadedFiles = createAsyncThunk(
  'fileUpload/fetchUploadedFiles',
  async (params, { rejectWithValue }) => {
    try {
      const response = await fileUploadService.getUploadedFiles(params);
      return response.files;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteFile = createAsyncThunk(
  'fileUpload/deleteFile',
  async (fileId, { rejectWithValue }) => {
    try {
      await fileUploadService.deleteFile(fileId);
      return fileId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateFileMetadata = createAsyncThunk(
  'fileUpload/updateFileMetadata',
  async ({ fileId, metadata }, { rejectWithValue }) => {
    try {
      const response = await fileUploadService.updateFileMetadata(fileId, metadata);
      return response.file;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const fileUploadSlice = createSlice({
  name: 'fileUpload',
  initialState: {
    files: [],
    currentFile: null,
    uploadProgress: {},
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentFile: (state, action) => {
      state.currentFile = action.payload;
    },
    clearCurrentFile: (state) => {
      state.currentFile = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUploadProgress: (state, action) => {
      const { fileId, progress } = action.payload;
      state.uploadProgress[fileId] = progress;
    },
    clearUploadProgress: (state, action) => {
      delete state.uploadProgress[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.files.push(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadMultipleFiles.fulfilled, (state, action) => {
        state.files.push(...action.payload);
      })
      .addCase(fetchUploadedFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUploadedFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
      })
      .addCase(fetchUploadedFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(f => f.id !== action.payload);
        if (state.currentFile?.id === action.payload) {
          state.currentFile = null;
        }
      })
      .addCase(updateFileMetadata.fulfilled, (state, action) => {
        const index = state.files.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.files[index] = action.payload;
        }
        if (state.currentFile?.id === action.payload.id) {
          state.currentFile = action.payload;
        }
      });
  },
});

export const {
  setCurrentFile,
  clearCurrentFile,
  clearError,
  updateUploadProgress,
  clearUploadProgress,
} = fileUploadSlice.actions;

export default fileUploadSlice.reducer;
```

## File Upload Components

### File Upload Component

```jsx
// components/FileUpload.jsx
import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { uploadFile, updateUploadProgress } from '../redux/slices/fileUploadSlice';

const FileUpload = ({ onUploadComplete, accept, maxSize, multiple = false }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    const filesArray = Array.from(files);

    // Validate files
    for (const file of filesArray) {
      if (maxSize && file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return;
      }

      if (accept && !accept.split(',').some(type => file.type.match(type.trim()))) {
        alert(`File ${file.name} has an invalid type. Allowed types: ${accept}`);
        return;
      }
    }

    setUploading(true);

    try {
      for (const file of filesArray) {
        const result = await dispatch(uploadFile({
          file,
          options: {
            onProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              dispatch(updateUploadProgress({ fileId: file.name, progress }));
            },
          },
        })).unwrap();

        if (onUploadComplete) {
          onUploadComplete(result);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <form
        className={`upload-form ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        <div className="upload-area">
          <div className="upload-icon">📁</div>
          <p>Drag and drop files here, or click to select files</p>
          <button
            type="button"
            onClick={onButtonClick}
            disabled={uploading}
            className="btn btn-primary"
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </button>
        </div>

        {accept && (
          <p className="upload-hint">
            Accepted file types: {accept}
          </p>
        )}

        {maxSize && (
          <p className="upload-hint">
            Maximum file size: {(maxSize / 1024 / 1024).toFixed(1)}MB
          </p>
        )}
      </form>
    </div>
  );
};
```

### File List Component

```jsx
// components/FileList.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUploadedFiles, deleteFile } from '../redux/slices/fileUploadSlice';
import FileItem from './FileItem';

const FileList = ({ filters = {} }) => {
  const dispatch = useDispatch();
  const { files, loading, error } = useSelector(state => state.fileUpload);

  useEffect(() => {
    dispatch(fetchUploadedFiles(filters));
  }, [dispatch, filters]);

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await dispatch(deleteFile(fileId)).unwrap();
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading files...</div>;
  }

  if (error) {
    return <div className="error">Error loading files: {error.message}</div>;
  }

  return (
    <div className="file-list">
      <div className="file-list-header">
        <h2>Your Files</h2>
        <div className="file-filters">
          {/* Add filter controls here */}
        </div>
      </div>

      <div className="files-grid">
        {files.map(file => (
          <FileItem
            key={file.id}
            file={file}
            onDelete={() => handleDeleteFile(file.id)}
          />
        ))}

        {files.length === 0 && (
          <div className="empty-state">
            <h3>No files uploaded yet</h3>
            <p>Upload your first file to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

### File Item Component

```jsx
// components/FileItem.jsx
import { useState } from 'react';
import { fileUploadService } from '../services/fileUploadService';
import { formatDistanceToNow } from 'date-fns';

const FileItem = ({ file, onDelete }) => {
  const [downloading, setDownloading] = useState(false);

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('document') || fileType.includes('word')) return '📝';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await fileUploadService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="file-item">
      <div className="file-icon">
        {getFileIcon(file.type)}
      </div>

      <div className="file-info">
        <h4 className="file-name">{file.name}</h4>
        <div className="file-meta">
          <span className="file-size">{formatFileSize(file.size)}</span>
          <span className="file-date">
            {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      <div className="file-actions">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn btn-sm btn-primary"
        >
          {downloading ? 'Downloading...' : 'Download'}
        </button>

        <button
          onClick={onDelete}
          className="btn btn-sm btn-error"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
```

### File Preview Component

```jsx
// components/FilePreview.jsx
import { useEffect, useState } from 'react';
import { fileUploadService } from '../services/fileUploadService';

const FilePreview = ({ fileId, fileType }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPreview();
  }, [fileId]);

  const loadPreview = async () => {
    if (!fileType.startsWith('image/')) return;

    setLoading(true);
    setError(null);

    try {
      const blob = await fileUploadService.getFilePreview(fileId);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      setError('Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (loading) {
    return <div className="preview-loading">Loading preview...</div>;
  }

  if (error) {
    return <div className="preview-error">{error}</div>;
  }

  if (!previewUrl) {
    return <div className="preview-placeholder">No preview available</div>;
  }

  return (
    <div className="file-preview">
      <img
        src={previewUrl}
        alt="File preview"
        className="preview-image"
        onError={() => setError('Failed to load preview')}
      />
    </div>
  );
};
```

## File Sharing Components

### File Share Component

```jsx
// components/FileShare.jsx
import { useState } from 'react';
import { fileUploadService } from '../services/fileUploadService';

const FileShare = ({ fileId }) => {
  const [shareOptions, setShareOptions] = useState({
    email: '',
    permissions: 'read',
    expiresAt: '',
  });
  const [sharing, setSharing] = useState(false);
  const [sharedLinks, setSharedLinks] = useState([]);

  const handleShare = async (e) => {
    e.preventDefault();
    setSharing(true);

    try {
      const result = await fileUploadService.shareFile(fileId, shareOptions);
      setSharedLinks(prev => [...prev, result.share]);
      setShareOptions({ email: '', permissions: 'read', expiresAt: '' });
    } catch (error) {
      console.error('Failed to share file:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleRevokeShare = async (shareId) => {
    try {
      await fileUploadService.revokeFileShare(fileId, shareId);
      setSharedLinks(prev => prev.filter(share => share.id !== shareId));
    } catch (error) {
      console.error('Failed to revoke share:', error);
    }
  };

  return (
    <div className="file-share">
      <h3>Share File</h3>

      <form onSubmit={handleShare}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={shareOptions.email}
            onChange={(e) => setShareOptions(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="permissions">Permissions</label>
          <select
            id="permissions"
            value={shareOptions.permissions}
            onChange={(e) => setShareOptions(prev => ({ ...prev, permissions: e.target.value }))}
          >
            <option value="read">Read only</option>
            <option value="write">Read and write</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="expiresAt">Expires At (optional)</label>
          <input
            type="datetime-local"
            id="expiresAt"
            value={shareOptions.expiresAt}
            onChange={(e) => setShareOptions(prev => ({ ...prev, expiresAt: e.target.value }))}
          />
        </div>

        <button
          type="submit"
          disabled={sharing}
          className="btn btn-primary"
        >
          {sharing ? 'Sharing...' : 'Share File'}
        </button>
      </form>

      <div className="shared-links">
        <h4>Shared Links</h4>
        {sharedLinks.map(share => (
          <div key={share.id} className="shared-link">
            <span>{share.email}</span>
            <span>{share.permissions}</span>
            <button
              onClick={() => handleRevokeShare(share.id)}
              className="btn btn-sm btn-error"
            >
              Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Error Handling

### File Upload Error Handling

```javascript
// utils/fileUploadErrors.js
export const handleFileUploadError = (error) => {
  switch (error.code) {
    case 'FILE_TOO_LARGE':
      return 'File is too large. Please choose a smaller file.';
    case 'INVALID_FILE_TYPE':
      return 'File type not allowed. Please choose a different file.';
    case 'UPLOAD_FAILED':
      return 'Upload failed. Please try again.';
    case 'STORAGE_QUOTA_EXCEEDED':
      return 'Storage quota exceeded. Please delete some files or upgrade your plan.';
    case 'FILE_NOT_FOUND':
      return 'File not found.';
    case 'ACCESS_DENIED':
      return 'You do not have permission to access this file.';
    default:
      return 'File operation failed.';
  }
};
```

## Best Practices

1. **File Validation**: Always validate file type and size before upload
2. **Progress Tracking**: Show upload progress for better user experience
3. **Error Handling**: Provide clear error messages for upload failures
4. **Security**: Implement proper access controls and file scanning
5. **Optimization**: Compress images and optimize large files
6. **Caching**: Cache file metadata to reduce API calls
7. **Offline Support**: Allow offline file access when possible
8. **Backup**: Implement automatic backup for important files
9. **Versioning**: Support file versioning for collaborative editing
10. **Search**: Enable full-text search across file contents