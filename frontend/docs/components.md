# Component Architecture

## Overview

The frontend follows a component-based architecture using React functional components with hooks. Components are organized hierarchically with reusable UI components at the base and page-level components at the top.

## Component Organization

### Directory Structure

```
src/components/
├── _discussion/         # Discussion-related components
├── _footers/           # Footer components
├── _notes/             # Note-specific components
├── _tasks/             # Task components
├── _workspaces/        # Workspace components
├── editable-markdown.jsx
├── emoji-selector.jsx
├── FileToNoteUploader.jsx
├── geminiIcon.jsx
├── markdown-renderer.jsx
```

### Page Components

```
src/pages/
├── app/                # Main app pages
├── auth/               # Authentication pages
├── dashboard/          # Dashboard sections
├── ErrorPages/         # Error handling pages
├── InfoPages/          # Information pages
```

## Component Patterns

### Functional Components

All components are written as functional components using ES6 arrow functions:

```jsx
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Props and PropTypes

Components accept props for configuration and data passing. Complex prop validation is handled through TypeScript interfaces or PropTypes where necessary.

### Custom Hooks

Shared logic is extracted into custom hooks located in `src/hooks/`:

- `useFetchTasks.js`
- `useFetchArchivedTasks.js`
- `useSocket.js`

### Component Composition

Components are composed hierarchically:

1. **Atomic Components**: Basic UI elements (buttons, inputs)
2. **Molecular Components**: Combinations of atomic components
3. **Organism Components**: Complex UI sections
4. **Page Components**: Full page layouts

## State Management in Components

### Local State

Component-specific state uses `useState`:

```jsx
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState(null);
```

### Global State

Redux state is accessed via `useSelector` and updated with `useDispatch`:

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUser } from '../redux/slices/authSlice';

const MyComponent = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const handleUpdate = () => {
    dispatch(updateUser(newData));
  };
};
```

## Lifecycle and Effects

Side effects are managed with `useEffect`:

```jsx
useEffect(() => {
  // Component mount logic
  fetchData();

  return () => {
    // Cleanup logic
  };
}, [dependencies]);
```

## Performance Optimization

### Memoization

Expensive computations are memoized:

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### Component Memoization

Components are memoized to prevent unnecessary re-renders:

```jsx
const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

## Styling

Components use Tailwind CSS classes for styling:

```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-sm shadow-sm">
  <h2 className="text-xl font-semibold">Title</h2>
  <button className="btn btn-primary">Action</button>
</div>
```

## Error Boundaries

Error boundaries wrap components to handle runtime errors gracefully:

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

## Testing

Components are tested using React Testing Library:

```jsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```