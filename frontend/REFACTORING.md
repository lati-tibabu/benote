# Frontend Refactoring - Feature-Based Architecture

## 🎯 Overview

The frontend has been successfully refactored from a monolithic structure to a **feature-based architecture**. This improves code organization, maintainability, and scalability.

## 📁 New Directory Structure

```
frontend/src/
├── features/              # Feature-based modules
│   ├── auth/             # Authentication feature
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── index.js
│   ├── workspace/        # Workspace management
│   │   ├── components/   # WorkspaceCard, TodoCard, etc.
│   │   ├── pages/        # Workspace pages
│   │   ├── hooks/
│   │   └── index.js
│   ├── notes/            # Notes feature
│   │   ├── components/   # MarkdownRenderer, CodeHighlighter, etc.
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── index.js
│   ├── tasks/            # Task management
│   │   ├── components/   # TaskCard
│   │   ├── hooks/        # useFetchTasks, useFetchArchivedTasks
│   │   └── index.js
│   ├── team/             # Team collaboration
│   │   ├── components/   # DiscussionThread
│   │   ├── pages/
│   │   └── index.js
│   ├── ai/               # AI features
│   │   ├── components/   # AiOverviewModal, GeminiIcon
│   │   ├── pages/        # AskAI
│   │   └── index.js
│   ├── search/           # Search functionality
│   │   ├── components/   # SearchModal
│   │   ├── pages/
│   │   └── index.js
│   ├── notifications/    # Notification system
│   │   ├── pages/
│   │   └── index.js
│   ├── profile/          # User profile
│   │   ├── pages/
│   │   └── index.js
│   ├── settings/         # App settings
│   │   ├── pages/        # Settings, LlmSettings
│   │   └── index.js
│   ├── classroom/        # Classroom feature
│   │   ├── pages/
│   │   └── index.js
│   ├── news/             # News feed
│   │   ├── pages/
│   │   └── index.js
│   └── home/             # Home dashboard
│       ├── pages/
│       └── index.js
│
├── shared/               # Shared/reusable code
│   ├── components/
│   │   ├── layout/       # Layout components
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── NotificationBanner.jsx
│   │   │   └── index.js
│   │   └── ui/           # Reusable UI components
│   │       └── emoji-selector.jsx
│   ├── hooks/            # Shared custom hooks
│   │   └── useSocket.js
│   └── utils/            # Shared utilities
│
├── core/                 # Core app functionality
│   ├── api/             # API client
│   ├── socket/          # Socket.io client
│   ├── theme/           # Theme management
│   └── file-conversion/ # File conversion utilities
│
├── redux/               # Redux store (existing)
│   ├── slices/
│   ├── store.js
│   └── rootReducer.js
│
├── routes/              # Route configuration (existing)
│   └── ...
│
├── pages/               # Legacy pages (to be migrated)
│   ├── dashboard/
│   │   └── index.jsx    # Now just a wrapper for DashboardLayout
│   └── ...
│
├── components/          # Legacy components (to be migrated)
├── hooks/              # Legacy hooks (to be migrated)
└── utils/              # Legacy utils (to be migrated)
```

## 🔑 Key Changes

### 1. **Monolithic Dashboard Broken Down**
- **Before**: 752-line, 32KB `dashboard/index.jsx` file
- **After**: Split into focused components:
  - `DashboardLayout.jsx` - Main layout orchestrator
  - `Sidebar.jsx` - Navigation sidebar
  - `Header.jsx` - Top header with search, theme, profile
  - `NotificationBanner.jsx` - Notification display

### 2. **Feature-Based Organization**
Each feature now has its own directory with:
- `components/` - Feature-specific components
- `pages/` - Feature pages
- `hooks/` - Feature-specific hooks
- `index.js` - Barrel exports for clean imports

### 3. **Path Aliases**
Added to `vite.config.js` for cleaner imports:
```javascript
import { WorkspaceCard } from '@features/workspace';
import { DashboardLayout } from '@shared/components/layout';
import { useSocket } from '@shared/hooks';
```

Available aliases:
- `@` → `./src`
- `@features` → `./src/features`
- `@shared` → `./src/shared`
- `@core` → `./src/core`
- `@components` → `./src/components`
- `@pages` → `./src/pages`
- `@utils` → `./src/utils`
- `@hooks` → `./src/hooks`
- `@redux` → `./src/redux`

## 📦 Component Migration Map

### Workspace Feature
- ✅ `components/_workspaces/*` → `features/workspace/components/`
- ✅ `pages/dashboard/contents/Workspace/*` → `features/workspace/pages/`

### Notes Feature
- ✅ `components/_notes/*` → `features/notes/components/`
- ✅ `components/FileToNoteUploader.jsx` → `features/notes/components/`
- ✅ `components/markdown-renderer.jsx` → `features/notes/components/`
- ✅ `components/editable-markdown.jsx` → `features/notes/components/`

### Tasks Feature
- ✅ `components/_tasks/*` → `features/tasks/components/`
- ✅ `hooks/useFetchTasks.js` → `features/tasks/hooks/`
- ✅ `hooks/useFetchArchivedTasks.js` → `features/tasks/hooks/`

### Team Feature
- ✅ `components/_discussion/*` → `features/team/components/`
- ✅ `pages/dashboard/contents/Team/*` → `features/team/pages/`

### Auth Feature
- ✅ `pages/auth/*` → `features/auth/pages/`

### AI Feature
- ✅ `components/geminiIcon.jsx` → `features/ai/components/`
- ✅ `pages/dashboard/contents/AiOverviewModal.jsx` → `features/ai/components/`
- ✅ `pages/dashboard/contents/AskAI/*` → `features/ai/pages/`

### Search Feature
- ✅ `pages/dashboard/contents/SearchModal.jsx` → `features/search/components/`
- ✅ `pages/dashboard/contents/Search/*` → `features/search/pages/`

### Other Features
- ✅ `pages/dashboard/contents/Classroom/*` → `features/classroom/pages/`
- ✅ `pages/dashboard/contents/Home/*` → `features/home/pages/`
- ✅ `pages/dashboard/contents/News.jsx` → `features/news/pages/`
- ✅ `pages/dashboard/contents/Profile/*` → `features/profile/pages/`
- ✅ `pages/dashboard/contents/Setting/*` → `features/settings/pages/`
- ✅ `pages/dashboard/contents/LlmSetting/*` → `features/settings/pages/`
- ✅ `pages/dashboard/contents/Notification/*` → `features/notifications/pages/`

### Shared Components
- ✅ `components/emoji-selector.jsx` → `shared/components/ui/`
- ✅ `hooks/useSocket.js` → `shared/hooks/`

## 🚀 Usage Examples

### Importing from Features
```javascript
// Old way
import WorkspaceCard from '../../components/_workspaces/workspace_card';
import { useFetchTasks } from '../../hooks/useFetchTasks';

// New way (with path aliases)
import { WorkspaceCard } from '@features/workspace';
import { useFetchTasks } from '@features/tasks';
```

### Importing Shared Components
```javascript
// Old way
import Sidebar from '../../pages/dashboard/dashboard_components/Sidebar';

// New way
import { Sidebar, Header, DashboardLayout } from '@shared/components/layout';
```

## 📝 Benefits

1. **Better Code Organization**
   - Features are self-contained
   - Easy to find related code
   - Clear boundaries between features

2. **Improved Maintainability**
   - Smaller, focused files
   - Reduced cognitive load
   - Easier to understand dependencies

3. **Enhanced Scalability**
   - New features can be added independently
   - Teams can work on different features without conflicts
   - Easy to remove or refactor features

4. **Better Developer Experience**
   - Cleaner imports with path aliases
   - Barrel exports simplify imports
   - Consistent structure across features

## 🔄 Migration Status

### Completed ✅
- [x] Created feature directories
- [x] Extracted Dashboard layout components
- [x] Moved workspace components
- [x] Moved notes components
- [x] Moved tasks components
- [x] Moved team components
- [x] Moved auth pages
- [x] Moved AI components
- [x] Moved search components
- [x] Moved other feature pages
- [x] Added path aliases to vite.config.js
- [x] Created barrel exports for features

### In Progress 🚧
- [ ] Update all import statements across the codebase
- [ ] Move Redux slices to feature directories
- [ ] Create feature-specific API clients
- [ ] Add feature-level tests

### Pending ⏳
- [ ] Remove old component directories after full migration
- [ ] Update documentation
- [ ] Create feature README files
- [ ] Add Storybook stories for shared components

## 🛠️ Next Steps

1. **Update Imports**: Gradually update import statements to use new paths
2. **Move Redux Slices**: Move slices to their respective feature directories
3. **Create API Clients**: Add `api/` folders to features with backend calls
4. **Add Tests**: Create test files co-located with components
5. **Documentation**: Add README.md to each feature explaining its purpose
6. **Clean Up**: Remove old directories once migration is complete

## 📚 Naming Conventions

- **Files**: PascalCase for components (e.g., `WorkspaceCard.jsx`)
- **Directories**: kebab-case (e.g., `workspace/`, `notifications/`)
- **Exports**: Use barrel exports (`index.js`) for each feature
- **Imports**: Use path aliases for cleaner code

## 🤝 Contributing

When adding new features:
1. Create a new directory in `features/`
2. Add `components/`, `pages/`, `hooks/` subdirectories
3. Create an `index.js` for barrel exports
4. Use path aliases in imports
5. Keep feature-specific code within the feature directory
6. Use `shared/` for truly reusable components

---

**Last Updated**: 2025-11-25
**Refactoring Status**: Phase 1 Complete - Structure Created & Components Migrated
