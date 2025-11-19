# Styling and UI Framework

## Overview

The application uses Tailwind CSS as the primary styling framework, enhanced with DaisyUI components and custom CSS for specific requirements. The design system supports both light and dark themes.

## Tailwind CSS Configuration

### Base Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        '1/2': '2px',
        '1/4': '1px',
      },
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      'light',
      'dark',
      {
        custom: {
          primary: '#3b82f6',
          secondary: '#f59e0b',
          accent: '#10b981',
          neutral: '#6b7280',
          'base-100': '#ffffff',
          'base-200': '#f9fafb',
          'base-300': '#f3f4f6',
        },
      },
    ],
  },
};
```

### Custom Height Utilities

The configuration extends Tailwind with custom height utilities for thin borders and dividers:

```css
/* Custom utilities */
.h-1\/2 { height: 2px; }  /* 2px height */
.h-1\/4 { height: 1px; }  /* 1px height */
```

## DaisyUI Components

### Button Components

```jsx
// Primary button
<button className="btn btn-primary">Primary Action</button>

// Secondary button
<button className="btn btn-secondary">Secondary Action</button>

// Outline button
<button className="btn btn-outline">Outline Action</button>

// Different sizes
<button className="btn btn-sm">Small</button>
<button className="btn btn-md">Medium</button>
<button className="btn btn-lg">Large</button>
```

### Modal Components

```jsx
// Modal structure
<div className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Modal Title</h3>
    <p className="py-4">Modal content</p>
    <div className="modal-action">
      <button className="btn">Cancel</button>
      <button className="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Form Components

```jsx
// Input field
<input
  type="text"
  placeholder="Enter text"
  className="input input-bordered w-full"
/>

// Select dropdown
<select className="select select-bordered w-full">
  <option disabled selected>Pick one</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>

// Checkbox
<input type="checkbox" className="checkbox" />

// Radio buttons
<input type="radio" name="radio-1" className="radio" />
```

## Theme System

### Theme Provider

```jsx
// redux/slices/themeSlice.js
const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: 'light',
    primaryColor: '#3b82f6',
  },
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
    },
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
    },
  },
});
```

### Theme Application

```jsx
// App.jsx
import { useSelector } from 'react-redux';

const App = () => {
  const theme = useSelector(state => state.theme.mode);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      {/* Application content */}
    </div>
  );
};
```

### Dark Mode Classes

```css
/* Dark mode styles */
.dark {
  @apply bg-gray-900 text-white;
}

.dark .card {
  @apply bg-gray-800 border-gray-700;
}

.dark .btn-primary {
  @apply bg-blue-600 hover:bg-blue-700;
}
```

## Layout Components

### Grid System

```jsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="card">Item 1</div>
  <div className="card">Item 2</div>
  <div className="card">Item 3</div>
</div>
```

### Flexbox Layouts

```jsx
// Flex container
<div className="flex items-center justify-between p-4">
  <h1 className="text-xl font-bold">Title</h1>
  <div className="flex space-x-2">
    <button className="btn btn-sm">Edit</button>
    <button className="btn btn-sm btn-primary">Save</button>
  </div>
</div>
```

## Custom Components

### Card Component

```jsx
// components/Card.jsx
const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`card bg-base-100 shadow-xl ${className}`}>
      {title && (
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          {children}
        </div>
      )}
    </div>
  );
};
```

### Badge Component

```jsx
// components/Badge.jsx
const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const variants = {
    default: 'badge-neutral',
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
  };

  const sizes = {
    xs: 'badge-xs',
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  };

  return (
    <span className={`badge ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
```

## Responsive Design

### Breakpoint Classes

```jsx
// Responsive navigation
<nav className="hidden md:flex space-x-4">
  {/* Desktop navigation */}
</nav>

<nav className="flex md:hidden">
  {/* Mobile navigation */}
</nav>
```

### Mobile-First Approach

```css
/* Mobile first */
.container {
  @apply px-4;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    @apply px-8;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    @apply px-16;
  }
}
```

## Animation and Transitions

### CSS Transitions

```jsx
// Button with hover effect
<button className="btn btn-primary transition-all duration-200 hover:scale-105">
  Hover me
</button>
```

### Loading Animations

```jsx
// Loading spinner
const LoadingSpinner = () => {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  );
};
```

## Custom CSS

### Global Styles

```css
/* index.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }

  body {
    @apply bg-base-100 text-base-content;
  }
}

@layer components {
  .btn-custom {
    @apply btn btn-primary rounded-lg font-medium;
  }

  .card-shadow {
    @apply shadow-lg hover:shadow-xl transition-shadow duration-200;
  }
}
```

### Utility Classes

```css
/* Custom utilities */
.text-gradient {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## Performance Optimization

### CSS Optimization

- **Purge Unused CSS**: Tailwind automatically removes unused styles in production
- **Minification**: CSS is minified during build
- **Critical CSS**: Inline critical styles for above-the-fold content

### Image Optimization

```jsx
// Optimized image component
const OptimizedImage = ({ src, alt, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`lazy ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
};
```

## Accessibility

### Focus States

```css
/* Focus styles */
.btn:focus {
  @apply ring-2 ring-primary ring-offset-2;
}

.input:focus {
  @apply ring-2 ring-primary ring-offset-2;
}
```

### Color Contrast

```css
/* High contrast colors */
.text-high-contrast {
  @apply text-gray-900 dark:text-white;
}

.bg-high-contrast {
  @apply bg-white dark:bg-gray-900;
}
```

### Screen Reader Support

```jsx
// Screen reader only text
<span className="sr-only">Screen reader text</span>

// Aria labels
<button aria-label="Close modal" className="btn btn-ghost">
  <XIcon />
</button>
```

## Build Configuration

### PostCSS Configuration

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
});
```

## Best Practices

1. **Consistent Naming**: Use consistent class naming conventions
2. **Component Libraries**: Leverage DaisyUI for common components
3. **Responsive Design**: Always design mobile-first
4. **Performance**: Optimize CSS delivery and loading
5. **Accessibility**: Ensure proper contrast and focus states
6. **Theme Support**: Implement both light and dark themes
7. **Custom Properties**: Use CSS custom properties for theming
8. **Documentation**: Document custom components and utilities