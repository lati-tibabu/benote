# Search API Integration

## Overview

The Search API provides comprehensive search functionality across all application data, including tasks, users, workspaces, and documents.

## Search Service

```javascript
// services/searchService.js
import api from '../utils/api';

export const searchService = {
  async globalSearch(query, options = {}) {
    const params = {
      q: query,
      ...options,
    };
    const response = await api.get('/search', { params });
    return response.data;
  },

  async searchTasks(query, filters = {}) {
    const params = {
      q: query,
      type: 'task',
      ...filters,
    };
    const response = await api.get('/search', { params });
    return response.data;
  },

  async searchUsers(query, filters = {}) {
    const params = {
      q: query,
      type: 'user',
      ...filters,
    };
    const response = await api.get('/search', { params });
    return response.data;
  },

  async searchWorkspaces(query, filters = {}) {
    const params = {
      q: query,
      type: 'workspace',
      ...filters,
    };
    const response = await api.get('/search', { params });
    return response.data;
  },

  async searchFiles(query, filters = {}) {
    const params = {
      q: query,
      type: 'file',
      ...filters,
    };
    const response = await api.get('/search', { params });
    return response.data;
  },

  async advancedSearch(searchCriteria) {
    const response = await api.post('/search/advanced', searchCriteria);
    return response.data;
  },

  async getSearchSuggestions(query, context = {}) {
    const params = {
      q: query,
      ...context,
    };
    const response = await api.get('/search/suggestions', { params });
    return response.data;
  },

  async getSearchHistory() {
    const response = await api.get('/search/history');
    return response.data;
  },

  async saveSearchQuery(queryData) {
    const response = await api.post('/search/history', queryData);
    return response.data;
  },

  async deleteSearchHistory(historyId) {
    const response = await api.delete(`/search/history/${historyId}`);
    return response.data;
  },

  async getPopularSearches() {
    const response = await api.get('/search/popular');
    return response.data;
  },

  async getSearchFilters() {
    const response = await api.get('/search/filters');
    return response.data;
  },
};
```

## Redux Integration

```javascript
// redux/slices/searchSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchService } from '../../services/searchService';

export const performGlobalSearch = createAsyncThunk(
  'search/globalSearch',
  async ({ query, options }, { rejectWithValue }) => {
    try {
      const response = await searchService.globalSearch(query, options);
      return {
        query,
        results: response.results,
        total: response.total,
        facets: response.facets,
      };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const performAdvancedSearch = createAsyncThunk(
  'search/advancedSearch',
  async (searchCriteria, { rejectWithValue }) => {
    try {
      const response = await searchService.advancedSearch(searchCriteria);
      return {
        criteria: searchCriteria,
        results: response.results,
        total: response.total,
      };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getSearchSuggestions = createAsyncThunk(
  'search/getSuggestions',
  async ({ query, context }, { rejectWithValue }) => {
    try {
      const response = await searchService.getSearchSuggestions(query, context);
      return response.suggestions;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getSearchHistory = createAsyncThunk(
  'search/getHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchService.getSearchHistory();
      return response.history;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    results: [],
    total: 0,
    facets: {},
    suggestions: [],
    history: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.query = action.payload;
    },
    clearSearchResults: (state) => {
      state.results = [];
      state.total = 0;
      state.facets = {};
      state.query = '';
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performGlobalSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performGlobalSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.query = action.payload.query;
        state.results = action.payload.results;
        state.total = action.payload.total;
        state.facets = action.payload.facets;
      })
      .addCase(performGlobalSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(performAdvancedSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performAdvancedSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.total = action.payload.total;
      })
      .addCase(performAdvancedSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSearchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      .addCase(getSearchHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  clearSearchResults,
  clearSuggestions,
  clearError,
} = searchSlice.actions;

export default searchSlice.reducer;
```

## Search Components

### Global Search Component

```jsx
// components/GlobalSearch.jsx
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  performGlobalSearch,
  getSearchSuggestions,
  setSearchQuery,
  clearSearchResults,
  clearSuggestions,
} from '../redux/slices/searchSlice';
import SearchResults from './SearchResults';
import SearchSuggestions from './SearchSuggestions';

const GlobalSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const { query, results, suggestions, loading, error } = useSelector(state => state.search);

  const [searchInput, setSearchInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (searchInput.trim().length > 2) {
      const debounceTimer = setTimeout(() => {
        dispatch(getSearchSuggestions({ query: searchInput }));
        setShowSuggestions(true);
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      dispatch(clearSuggestions());
      setShowSuggestions(false);
    }
  }, [searchInput, dispatch]);

  const handleSearch = async (searchQuery = searchInput) => {
    if (!searchQuery.trim()) return;

    dispatch(setSearchQuery(searchQuery));
    setShowSuggestions(false);
    setShowResults(true);

    try {
      await dispatch(performGlobalSearch({ query: searchQuery })).unwrap();
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion);
    handleSearch(suggestion);
  };

  const handleClose = () => {
    setShowResults(false);
    setShowSuggestions(false);
    dispatch(clearSearchResults());
  };

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="global-search" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Search tasks, users, workspaces..."
          className="search-input"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="search-button"
        >
          {loading ? '🔄' : '🔍'}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <SearchSuggestions
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      )}

      {showResults && (
        <SearchResults
          results={results}
          query={query}
          loading={loading}
          error={error}
          onClose={handleClose}
        />
      )}
    </div>
  );
};
```

### Search Results Component

```jsx
// components/SearchResults.jsx
import { useNavigate } from 'react-router-dom';

const SearchResults = ({ results, query, loading, error, onClose }) => {
  const navigate = useNavigate();

  const handleResultClick = (result) => {
    switch (result.type) {
      case 'task':
        navigate(`/dashboard/task/${result.id}`);
        break;
      case 'user':
        navigate(`/dashboard/user/${result.id}`);
        break;
      case 'workspace':
        navigate(`/dashboard/workspace/${result.id}`);
        break;
      case 'file':
        // Handle file opening
        window.open(result.url, '_blank');
        break;
      default:
        break;
    }
    onClose();
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'task': return '📋';
      case 'user': return '👤';
      case 'workspace': return '🏢';
      case 'file': return '📄';
      default: return '🔍';
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  if (loading) {
    return (
      <div className="search-results loading">
        <div className="search-loading">Searching...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results error">
        <div className="search-error">Search failed: {error.message}</div>
        <button onClick={onClose} className="btn btn-sm">Close</button>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-header">
        <h3>Search Results for "{query}"</h3>
        <button onClick={onClose} className="btn btn-sm btn-ghost">✕</button>
      </div>

      <div className="search-results-list">
        {results.map(result => (
          <div
            key={`${result.type}-${result.id}`}
            className="search-result-item"
            onClick={() => handleResultClick(result)}
          >
            <div className="result-icon">
              {getResultIcon(result.type)}
            </div>

            <div className="result-content">
              <div
                className="result-title"
                dangerouslySetInnerHTML={{
                  __html: highlightText(result.title, query)
                }}
              />

              <div
                className="result-description"
                dangerouslySetInnerHTML={{
                  __html: highlightText(result.description, query)
                }}
              />

              <div className="result-meta">
                <span className="result-type">{result.type}</span>
                {result.createdAt && (
                  <span className="result-date">
                    {new Date(result.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {results.length === 0 && (
          <div className="no-results">
            <h4>No results found</h4>
            <p>Try different keywords or check your spelling</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

### Search Suggestions Component

```jsx
// components/SearchSuggestions.jsx
const SearchSuggestions = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="search-suggestions">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="suggestion-item"
          onClick={() => onSuggestionClick(suggestion)}
        >
          <span className="suggestion-icon">🔍</span>
          <span className="suggestion-text">{suggestion}</span>
        </div>
      ))}
    </div>
  );
};
```

### Advanced Search Component

```jsx
// components/AdvancedSearch.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { performAdvancedSearch } from '../redux/slices/searchSlice';

const AdvancedSearch = ({ onResults }) => {
  const dispatch = useDispatch();
  const [criteria, setCriteria] = useState({
    query: '',
    types: [],
    dateRange: {
      start: '',
      end: '',
    },
    filters: {
      status: '',
      priority: '',
      assignee: '',
      workspace: '',
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(performAdvancedSearch(criteria)).unwrap();
      if (onResults) {
        onResults(result);
      }
    } catch (error) {
      console.error('Advanced search failed:', error);
    }
  };

  const handleTypeChange = (type, checked) => {
    setCriteria(prev => ({
      ...prev,
      types: checked
        ? [...prev.types, type]
        : prev.types.filter(t => t !== type),
    }));
  };

  const handleFilterChange = (filter, value) => {
    setCriteria(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filter]: value,
      },
    }));
  };

  return (
    <div className="advanced-search">
      <h2>Advanced Search</h2>

      <form onSubmit={handleSubmit}>
        <div className="search-section">
          <label>Search Query</label>
          <input
            type="text"
            value={criteria.query}
            onChange={(e) => setCriteria(prev => ({ ...prev, query: e.target.value }))}
            placeholder="Enter search terms..."
            required
          />
        </div>

        <div className="search-section">
          <label>Search In</label>
          <div className="checkbox-group">
            {['task', 'user', 'workspace', 'file'].map(type => (
              <label key={type}>
                <input
                  type="checkbox"
                  checked={criteria.types.includes(type)}
                  onChange={(e) => handleTypeChange(type, e.target.checked)}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </label>
            ))}
          </div>
        </div>

        <div className="search-section">
          <label>Date Range</label>
          <div className="date-range">
            <input
              type="date"
              value={criteria.dateRange.start}
              onChange={(e) => setCriteria(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
            />
            <span>to</span>
            <input
              type="date"
              value={criteria.dateRange.end}
              onChange={(e) => setCriteria(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
            />
          </div>
        </div>

        <div className="search-section">
          <label>Filters</label>
          <div className="filters-grid">
            <select
              value={criteria.filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Any Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={criteria.filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">Any Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <input
              type="text"
              value={criteria.filters.assignee}
              onChange={(e) => handleFilterChange('assignee', e.target.value)}
              placeholder="Assignee name"
            />

            <input
              type="text"
              value={criteria.filters.workspace}
              onChange={(e) => handleFilterChange('workspace', e.target.value)}
              placeholder="Workspace name"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          <button
            type="button"
            onClick={() => setCriteria({
              query: '',
              types: [],
              dateRange: { start: '', end: '' },
              filters: { status: '', priority: '', assignee: '', workspace: '' },
            })}
            className="btn btn-ghost"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};
```

## Search History Component

```jsx
// components/SearchHistory.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSearchHistory } from '../redux/slices/searchSlice';

const SearchHistory = ({ onHistoryItemClick }) => {
  const dispatch = useDispatch();
  const { history, loading } = useSelector(state => state.search);

  useEffect(() => {
    dispatch(getSearchHistory());
  }, [dispatch]);

  if (loading) {
    return <div className="loading">Loading search history...</div>;
  }

  return (
    <div className="search-history">
      <h3>Recent Searches</h3>

      <div className="history-list">
        {history.map(item => (
          <div
            key={item.id}
            className="history-item"
            onClick={() => onHistoryItemClick(item.query)}
          >
            <span className="history-icon">🕒</span>
            <span className="history-query">{item.query}</span>
            <span className="history-date">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}

        {history.length === 0 && (
          <div className="no-history">
            <p>No search history yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

## Search Filters and Facets

### Search Filters Component

```jsx
// components/SearchFilters.jsx
import { useEffect, useState } from 'react';
import { searchService } from '../services/searchService';

const SearchFilters = ({ facets, onFilterChange }) => {
  const [availableFilters, setAvailableFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const response = await searchService.getSearchFilters();
      setAvailableFilters(response.filters);
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  const handleFilterChange = (filterType, value, checked) => {
    const newFilters = { ...selectedFilters };

    if (!newFilters[filterType]) {
      newFilters[filterType] = [];
    }

    if (checked) {
      newFilters[filterType].push(value);
    } else {
      newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
    }

    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setSelectedFilters({});
    onFilterChange({});
  };

  return (
    <div className="search-filters">
      <div className="filters-header">
        <h4>Filters</h4>
        <button onClick={clearFilters} className="btn btn-sm btn-ghost">
          Clear All
        </button>
      </div>

      {facets && Object.entries(facets).map(([facetType, facetValues]) => (
        <div key={facetType} className="filter-group">
          <h5>{facetType.charAt(0).toUpperCase() + facetType.slice(1)}</h5>
          {facetValues.map(facet => (
            <label key={facet.value} className="filter-option">
              <input
                type="checkbox"
                checked={selectedFilters[facetType]?.includes(facet.value) || false}
                onChange={(e) => handleFilterChange(facetType, facet.value, e.target.checked)}
              />
              <span>{facet.label}</span>
              <span className="facet-count">({facet.count})</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
};
```

## Error Handling

### Search Error Handling

```javascript
// utils/searchErrors.js
export const handleSearchError = (error) => {
  switch (error.code) {
    case 'SEARCH_QUERY_TOO_SHORT':
      return 'Search query must be at least 3 characters long';
    case 'SEARCH_INDEX_UNAVAILABLE':
      return 'Search service is temporarily unavailable';
    case 'INVALID_SEARCH_FILTERS':
      return 'Invalid search filters provided';
    case 'SEARCH_TIMEOUT':
      return 'Search request timed out';
    case 'INSUFFICIENT_PERMISSIONS':
      return 'You do not have permission to search this content';
    default:
      return 'Search operation failed';
  }
};
```

## Best Practices

1. **Debounced Search**: Implement debouncing for real-time suggestions
2. **Caching**: Cache search results and suggestions
3. **Pagination**: Support paginated results for large datasets
4. **Facets**: Provide filtering options based on search facets
5. **History**: Save and display search history
6. **Advanced Search**: Support complex query building
7. **Autocomplete**: Implement intelligent autocomplete suggestions
8. **Indexing**: Ensure proper indexing for fast search
9. **Security**: Implement search result access controls
10. **Analytics**: Track search usage and performance