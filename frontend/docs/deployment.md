# Deployment and Build Process

## Overview

The frontend application is built using Vite and deployed to Vercel. The build process includes optimization, asset bundling, and environment-specific configurations.

## Build Configuration

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'react-icons'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
```

### Environment Variables

```javascript
// Environment configuration
const config = {
  development: {
    API_URL: 'http://localhost:3001/api',
    SOCKET_URL: 'http://localhost:3001',
    GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID,
  },
  production: {
    API_URL: 'https://api.studentproductivityhub.com',
    SOCKET_URL: 'https://api.studentproductivityhub.com',
    GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID,
  },
};

export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return config[env];
};
```

## Build Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit"
  }
}
```

### Build Process

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Vercel Deployment

### Vercel Configuration

```javascript
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Environment Variables in Vercel

```bash
# Vercel environment variables
VITE_API_URL=https://api.studentproductivityhub.com
VITE_SOCKET_URL=https://api.studentproductivityhub.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_NODE_ENV=production
```

## Progressive Web App (PWA)

### PWA Configuration

```javascript
// vite.config.js PWA plugin
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    name: 'Benote',
    short_name: 'Benote',
    description: 'A comprehensive productivity tool for students',
    theme_color: '#3b82f6',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.studentproductivityhub\.com\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
        },
      },
    ],
  },
})
```

### Web App Manifest

```json
// public/site.webmanifest
{
  "name": "Benote",
  "short_name": "Benote",
  "description": "A comprehensive productivity tool for students",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Performance Optimization

### Code Splitting

```javascript
// Lazy loading components
const Dashboard = lazy(() => import('../pages/dashboard/index'));
const Workspace = lazy(() => import('../pages/dashboard/contents/Workspace/index'));

// Route-based code splitting
const routes = [
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Dashboard />
      </Suspense>
    ),
  },
];
```

### Asset Optimization

```javascript
// vite.config.js build optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', 'react-icons', 'lucide-react'],
          utils: ['lodash', 'date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### Image Optimization

```javascript
// Dynamic imports for images
const loadImage = (imageName) => {
  return import(`../assets/images/${imageName}.png`);
};

// Lazy loading images
const OptimizedImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setImageSrc(src);
  }, [src]);

  return imageSrc ? <img src={imageSrc} alt={alt} /> : <div>Loading...</div>;
};
```

## CDN and Asset Delivery

### Static Asset Hosting

```javascript
// External CDN for assets
const CDN_URL = 'https://cdn.studentproductivityhub.com';

// Asset URLs
const getAssetUrl = (path) => `${CDN_URL}/${path}`;

// Usage
<img src={getAssetUrl('images/logo.png')} alt="Logo" />
```

## Monitoring and Analytics

### Error Tracking

```javascript
// Sentry integration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Performance Monitoring

```javascript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Security Headers

### Content Security Policy

```javascript
// vercel.json CSP headers
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.studentproductivityhub.com wss://api.studentproductivityhub.com;"
        }
      ]
    }
  ]
}
```

## Deployment Pipeline

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Rollback Strategy

### Versioned Deployments

```javascript
// Version information
const VERSION = process.env.VITE_APP_VERSION || '1.0.0';

// Display version in app
const VersionDisplay = () => {
  return <div className="version">v{VERSION}</div>;
};
```

### Rollback Commands

```bash
# Vercel rollback
vercel rollback

# Revert to specific deployment
vercel rollback <deployment-id>
```

## Best Practices

1. **Environment Separation**: Maintain separate configs for dev/staging/prod
2. **Build Optimization**: Implement code splitting and asset optimization
3. **Security**: Configure proper security headers and CSP
4. **Monitoring**: Set up error tracking and performance monitoring
5. **Testing**: Run comprehensive tests before deployment
6. **Caching**: Implement appropriate caching strategies
7. **CDN**: Use CDN for static assets
8. **Rollback**: Have a clear rollback strategy