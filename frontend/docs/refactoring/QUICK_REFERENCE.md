# Frontend Refactoring - Quick Reference Guide

## 🚀 Quick Start

### Using the New Structure

```javascript
// ✅ DO: Use path aliases
import { WorkspaceCard } from '@features/workspace';
import { DashboardLayout } from '@shared/components/layout';
import { useSocket } from '@shared/hooks';

// ❌ DON'T: Use relative paths
import WorkspaceCard from '../../features/workspace/components/workspace_card';
```

## 📁 Where to Find Things

### Features (`@features`)
```javascript
// Authentication
import { LoginPage, SignupPage } from '@features/auth';

// Workspace
import { WorkspaceCard, TodoCard, WorkspacesPage } from '@features/workspace';

// Notes
import { MarkdownRenderer, CodeHighlighter, EditableMarkdown } from '@features/notes';

// Tasks
import { TaskCard, useFetchTasks, useFetchArchivedTasks } from '@features/tasks';

// Team
import { DiscussionThread } from '@features/team';

// AI
import { GeminiIcon, AiOverviewModal } from '@features/ai';

// Search
import { SearchModal } from '@features/search';
```

### Shared Components (`@shared`)
```javascript
// Layout
import { DashboardLayout, Sidebar, Header, NotificationBanner } from '@shared/components/layout';

// UI Components
import { EmojiSelector } from '@shared/components/ui';

// Hooks
import { useSocket } from '@shared/hooks';
```

### Redux (`@redux`)
```javascript
import { store } from '@redux/store';
import { authSlice } from '@redux/slices/authSlice';
```

## 🎯 Common Tasks

### Adding a New Feature

1. **Create feature directory**:
   ```bash
   mkdir src/features/my-feature
   mkdir src/features/my-feature/components
   mkdir src/features/my-feature/pages
   mkdir src/features/my-feature/hooks
   ```

2. **Create index.js**:
   ```javascript
   // src/features/my-feature/index.js
   export { default as MyComponent } from './components/MyComponent';
   export { default as MyPage } from './pages/MyPage';
   export { default as useMyHook } from './hooks/useMyHook';
   ```

3. **Use in your app**:
   ```javascript
   import { MyComponent } from '@features/my-feature';
   ```

### Adding a Shared Component

1. **Create component**:
   ```javascript
   // src/shared/components/ui/MyButton.jsx
   export default function MyButton({ children, ...props }) {
     return <button {...props}>{children}</button>;
   }
   ```

2. **Export from index**:
   ```javascript
   // src/shared/components/ui/index.js
   export { default as MyButton } from './MyButton';
   ```

3. **Use it**:
   ```javascript
   import { MyButton } from '@shared/components/ui';
   ```

## 📝 File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `WorkspaceCard.jsx` |
| Pages | PascalCase + Page suffix | `WorkspacesPage.jsx` |
| Hooks | camelCase + use prefix | `useFetchTasks.js` |
| Utils | camelCase | `formatDate.js` |
| Directories | kebab-case | `workspace/`, `ai/` |
| Index files | lowercase | `index.js` |

## 🗂️ Feature Structure Template

```
features/my-feature/
├── components/          # Feature-specific components
│   ├── MyComponent.jsx
│   └── MyOtherComponent.jsx
├── pages/              # Feature pages
│   ├── MyPage.jsx
│   └── MyDetailPage.jsx
├── hooks/              # Feature-specific hooks
│   └── useMyFeature.js
├── store/              # Redux slice (optional)
│   └── myFeatureSlice.js
├── api/                # API calls (optional)
│   └── myFeatureApi.js
└── index.js            # Barrel exports
```

## 🔍 Finding Components

### Old Location → New Location

| Old Path | New Path |
|----------|----------|
| `components/_workspaces/workspace_card.jsx` | `features/workspace/components/workspace_card.jsx` |
| `components/_notes/code-highlighter.jsx` | `features/notes/components/code-highlighter.jsx` |
| `components/_tasks/task-card.jsx` | `features/tasks/components/task-card.jsx` |
| `components/geminiIcon.jsx` | `features/ai/components/geminiIcon.jsx` |
| `pages/auth/login.jsx` | `features/auth/pages/login.jsx` |
| `pages/dashboard/contents/SearchModal.jsx` | `features/search/components/SearchModal.jsx` |
| `hooks/useFetchTasks.js` | `features/tasks/hooks/useFetchTasks.js` |

## 💡 Import Cheat Sheet

```javascript
// Features
import { ... } from '@features/workspace';
import { ... } from '@features/notes';
import { ... } from '@features/tasks';
import { ... } from '@features/team';
import { ... } from '@features/ai';
import { ... } from '@features/search';
import { ... } from '@features/auth';

// Shared
import { ... } from '@shared/components/layout';
import { ... } from '@shared/components/ui';
import { ... } from '@shared/hooks';
import { ... } from '@shared/utils';

// Core
import { ... } from '@core/api';
import { ... } from '@core/socket';

// Redux
import { ... } from '@redux/slices/authSlice';
import { ... } from '@redux/store';

// Utils (legacy)
import { ... } from '@utils/...';

// Pages (legacy)
import { ... } from '@pages/...';
```

## 🛠️ Development Workflow

### 1. Working on a Feature
```bash
# Navigate to feature directory
cd src/features/workspace

# All related code is here:
# - components/
# - pages/
# - hooks/
# - store/ (if needed)
```

### 2. Creating a Component
```javascript
// 1. Create file: src/features/workspace/components/NewComponent.jsx
export default function NewComponent() {
  return <div>New Component</div>;
}

// 2. Export from index: src/features/workspace/index.js
export { default as NewComponent } from './components/NewComponent';

// 3. Use it anywhere:
import { NewComponent } from '@features/workspace';
```

### 3. Adding a Hook
```javascript
// 1. Create file: src/features/workspace/hooks/useWorkspaceData.js
export default function useWorkspaceData() {
  // Hook logic
  return { data, loading, error };
}

// 2. Export from index: src/features/workspace/index.js
export { default as useWorkspaceData } from './hooks/useWorkspaceData';

// 3. Use it:
import { useWorkspaceData } from '@features/workspace';
```

## 🎨 Component Organization

### Feature-Specific Components
Go in `features/[feature-name]/components/`
- Only used within that feature
- Tightly coupled to feature logic

### Shared Components
Go in `shared/components/`
- Used across multiple features
- Generic and reusable
- No feature-specific logic

### Layout Components
Go in `shared/components/layout/`
- Page layouts
- Navigation
- Headers/Footers

### UI Components
Go in `shared/components/ui/`
- Buttons, inputs, modals
- Pure presentational components
- No business logic

## 📚 Documentation

- **Full Guide**: See `REFACTORING.md`
- **Comparison**: See `ARCHITECTURE_COMPARISON.md`
- **Summary**: See `REFACTORING_SUMMARY.md`
- **Quick Ref**: This file

## ⚡ Tips

1. **Always use path aliases** - They're cleaner and easier to refactor
2. **Keep features isolated** - Don't import from other features directly
3. **Use barrel exports** - Export from `index.js` for clean imports
4. **Follow naming conventions** - Consistency makes code easier to navigate
5. **Co-locate related code** - Keep components, hooks, and pages together

## 🐛 Troubleshooting

### Import not found?
- Check if the component is exported in `index.js`
- Verify the path alias in `vite.config.js`
- Restart dev server after config changes

### Component not rendering?
- Check import path
- Verify component is exported as default or named export
- Check for circular dependencies

### Path alias not working?
- Restart Vite dev server
- Check `vite.config.js` for correct alias configuration
- Ensure using `@` prefix in imports

---

**Quick Links**:
- [Full Refactoring Guide](./REFACTORING.md)
- [Architecture Comparison](./ARCHITECTURE_COMPARISON.md)
- [Refactoring Summary](./REFACTORING_SUMMARY.md)
