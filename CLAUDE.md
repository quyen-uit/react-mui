# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready React application with TypeScript, featuring authentication, role-based access control, admin dashboard, internationalization, and comprehensive state management using Redux Toolkit with RTK Query.

## Essential Commands

### Development
```bash
npm run dev              # Start dev server on port 3000
npm run build            # TypeScript compile + Vite build
npm run preview          # Preview production build
```

### Testing
```bash
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once (CI mode)
npm run test:run -- <path>  # Run specific test file (e.g., src/features/profile)
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report (70% threshold enforced)
```

### Code Quality
```bash
npm run lint             # Check for linting issues
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
```

### Git Hooks
Pre-commit hooks via Husky automatically run ESLint and Prettier on staged files.

## Architecture

### State Management Strategy
- **Redux Store** (`src/app/store.ts`): Combines `authSlice` reducer and RTK Query `baseApi` reducer
- **Auth State** (`src/app/authSlice.ts`): Manages user authentication state (user, tokens, isAuthenticated)
- **API Layer** (`src/services/baseApi.ts`): Centralized RTK Query base API with automatic token injection and cache tags
- **API Services**: Individual API slices in `src/services/api/` extend baseApi using `injectEndpoints()`

### Authentication Flow
1. User logs in via `authApi.login` mutation (backend sets httpOnly refresh cookie; response returns `token`)
2. Access token is stored in Redux state (memory only). No tokens in localStorage.
3. `authSlice.setCredentials({ user, token })` updates Redux state
4. Request auth:
   - RTK Query: `baseApi` `prepareHeaders` reads `state.auth.token` and sets `Authorization: Bearer <token>`; `credentials: 'include'` sends cookies
5. Refresh flow (RTK Query):
   - On 401, a custom `baseQueryWithReauth` posts `/auth/refresh` with credentials (uses refresh cookie)
   - On success, updates Redux token and transparently retries the failed request
   - Concurrent 401s are queued behind a single refresh
   - On failure, error propagates (UI redirects to `/login`)

### Routing Architecture
- **Main Layout** (`/`): Public pages + protected user routes
- **Admin Layout** (`/admin`): Nested under ProtectedRoute with `allowedRoles={['admin']}`
- **ProtectedRoute Component**: Checks `auth.isAuthenticated` from Redux, redirects to `/login` if not authenticated, optionally validates roles

### Path Aliases
All imports use `@/` prefix (e.g., `@/components`, `@/features`, `@/services`). Configured in:
- `tsconfig.json` (TypeScript)
- `vite.config.ts` (Vite)
- `vitest.config.ts` (Vitest)

### Feature Organization
Features are self-contained in `src/features/[feature-name]/`:
- Main page component (e.g., `ProfilePage.tsx`)
- Sub-components in `components/` subfolder
- Exported via `index.ts` barrel file
- Co-located tests (e.g., `ProfilePage.test.tsx`)

### API Service Pattern
Each API domain lives in `src/services/api/[domain]/`:
- `[domain]Api.ts`: Defines endpoints using `baseApi.injectEndpoints()`
- `index.ts`: Re-exports API slice and auto-generated hooks
- Tag-based cache invalidation (e.g., `['Products']`, `['Auth']`, `['User']`)

Example:
```typescript
export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({ providesTags: ['Products'] }),
    createProduct: builder.mutation({ invalidatesTags: ['Products'] }),
  }),
});
```

### HTTP Client
- **RTK Query**: Single client for CRUD and auth flows. Uses a `baseQueryWithReauth` wrapper for refresh and `retry` for transient failures.

### Token Storage Strategy
- Access token: kept only in memory (Redux). Never written to localStorage.
- Refresh token: httpOnly, Secure cookie managed by the backend.
- CSRF: currently not enforced by backend; no `X-CSRF-Token` header is sent. If enabled later, add the header for non-GET requests.

### Error Handling
- **ErrorBoundary**: Wraps app in `src/main.tsx`, integrates with Sentry
- **RTK Query Wrapper**: Centralized error handling and refresh in `src/services/baseApi.ts`
- **RTK Query**: Errors accessible in hook results (e.g., `{ error, isError }`)

### Internationalization
- **i18next**: Configured in `src/locales/i18n.ts`
- Languages: `en`, `vi` with translations in `src/locales/[lang]/translation.json`
- Usage: `useTranslation()` hook from `react-i18next`

### Component Organization
Components moved to categorized subdirectories:
- `src/components/ui/`: LoadingSpinner, Skeletons, Card (CSS Module example)
- `src/components/guards/`: ProtectedRoute
- `src/components/errors/`: ErrorBoundary
Each component has its own folder with component file, tests, and index.ts

### Styling Strategy
This project uses **Mantine UI v7** with **CSS Modules** as the recommended styling approach.

#### Styling Priority (Use in this order):
1. **Mantine Props** (First Choice) - For standard Mantine features
2. **CSS Modules** (Second Choice) - For custom component styles
3. **Inline Styles** (Last Resort) - For dynamic/conditional values only

#### 1. Mantine Props - Use FIRST ⭐
**When to use:**
- Standard spacing, colors, typography
- Responsive design
- Mantine's built-in design tokens

**Examples:**
```tsx
// ✅ Good - Use Mantine props
<Paper p="md" shadow="sm" radius="md" withBorder>
  <Text size="lg" fw={600} c="blue">Title</Text>
  <Button mt="md" variant="filled">Submit</Button>
</Paper>

// Responsive
<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>

// Common props
p="md"          // padding
mt="xl"         // margin-top
c="blue"        // color
fw={600}        // font-weight
ta="center"     // text-align
```

#### 2. CSS Modules - Use for CUSTOM STYLES 🎨
**When to use:**
- Custom layouts and positioning
- Complex hover effects and animations
- Pseudo-elements (::before, ::after)
- Component-specific styling
- Media queries beyond Mantine's breakpoints

**File naming:** `ComponentName.module.css`

**Structure:**
```
src/features/profile/
├── ProfilePage.tsx
├── ProfilePage.module.css
└── components/
    ├── UserCard/
    │   ├── UserCard.tsx
    │   └── UserCard.module.css
```

**Usage pattern:**
```tsx
// ProfileCard.tsx
import { Paper, Text } from '@mantine/core';
import classes from './ProfileCard.module.css';

export const ProfileCard = () => {
  return (
    <Paper className={classes.card} p="md">
      <div className={classes.header}>
        <Text className={classes.title}>Profile</Text>
      </div>
    </Paper>
  );
};
```

```css
/* ProfileCard.module.css */
.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
}

.header {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid var(--mantine-color-gray-3);
}

.title {
  background: linear-gradient(45deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-6));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.card {
  animation: fadeIn 0.3s ease;
}
```

**Combining CSS Modules with Mantine:**
```tsx
// ✅ Best practice - Combine both
<Paper className={classes.card} p="md" shadow="sm">
  <Text className={classes.title} size="lg" fw={600}>
    Title
  </Text>
</Paper>
```

**Using Mantine's classNames prop:**
```tsx
// For more control over Mantine component internals
<Button
  classNames={{
    root: classes.buttonRoot,
    label: classes.buttonLabel,
    section: classes.buttonIcon,
  }}
>
  Click me
</Button>
```

**Access Mantine CSS Variables:**
```css
.myClass {
  color: var(--mantine-color-blue-6);
  background: var(--mantine-color-gray-0);
  border-radius: var(--mantine-radius-md);
  padding: var(--mantine-spacing-md);
  font-family: var(--mantine-font-family);
}

/* Responsive breakpoints */
@media (min-width: $mantine-breakpoint-sm) {
  .myClass {
    padding: var(--mantine-spacing-xl);
  }
}
```

#### 3. Inline Styles - Use SPARINGLY ⚠️
**When to use:**
- Dynamic values from props/state
- One-off exceptions

**Examples:**
```tsx
// ✅ Good - Dynamic value
<div style={{ width: `${progress}%` }}>

// ✅ Good - One-off override
<Avatar style={{ cursor: 'pointer' }} />

// ❌ Avoid - Should use CSS Module
<div style={{
  display: 'flex',
  padding: '20px',
  borderRadius: '8px',
}}>
```

#### Styling Decision Matrix

| Scenario | Use |
|----------|-----|
| Spacing (padding, margin) | **Mantine props** (`p="md"`, `mt="xl"`) |
| Colors from theme | **Mantine props** (`c="blue"`) |
| Typography | **Mantine props** (`size="lg"`, `fw={600}`) |
| Custom layouts (grid, flex) | **CSS Modules** |
| Animations | **CSS Modules** |
| Hover effects | **CSS Modules** |
| Pseudo-elements | **CSS Modules** |
| Dynamic colors/sizes from state | **Inline styles** |
| One-off overrides | **Inline styles** |

#### Setup
- TypeScript types for CSS Modules: `src/types/css-modules.d.ts`
- Example component: `src/components/ui/Card/` (demonstrates all patterns)
- Vite handles CSS Modules automatically (no additional config needed)
- PostCSS configured with `postcss-preset-mantine` for Mantine-specific transformations

### Layouts
- **MainLayout** (`src/layouts/MainLayout/`): Header with auth controls, Sidebar for navigation, uses `<Outlet />` for nested routes
- **AdminLayout** (`src/layouts/AdminLayout.tsx`): Admin-specific shell with different navigation

### Security Features
- Security headers in `vite.config.ts` (CSP, X-Frame-Options, etc.)
- Automatic token refresh with request queuing
- Request timeout/retry behavior handled via RTK Query `retry` with `API_CONFIG.RETRY_ATTEMPTS`
- Cookies are sent via `credentials: 'include'`; prefer strict CSP in production

### Performance Optimizations
- Code splitting: vendor, redux, mantine chunks (`vite.config.ts` manualChunks)
- RTK Query caching: 60s keepUnusedDataFor, 30s refetchOnMountOrArgChange
- Lazy loading via React Router

## Common Development Tasks

### Adding a New API Endpoint
1. Create/update API slice in `src/services/api/[domain]/[domain]Api.ts`
2. Define types in `src/types/[domain].ts`
3. Use auto-generated hooks (e.g., `useGetProductsQuery`) in components

### Adding a New Protected Route
```typescript
// In src/routes/index.tsx
{
  path: 'new-page',
  element: (
    <ProtectedRoute allowedRoles={['user', 'admin']}> // optional
      <NewPage />
    </ProtectedRoute>
  ),
}
```

### Adding Translations
1. Add keys to `src/locales/en/translation.json` and `src/locales/vi/translation.json`
2. Use in components: `const { t } = useTranslation(); t('your.key')`

### Running Specific Tests
```bash
npm run test:run -- src/features/profile  # Run all profile tests
npm run test:run -- src/features/profile/ChangePasswordModal.test.tsx  # Single file
```

## Important Files

- `src/app/store.ts` - Redux store configuration
- `src/app/authSlice.ts` - Authentication state management
- `src/services/baseApi.ts` - RTK Query base API with global config
- `src/routes/index.tsx` - Application routing structure
- `src/types/` - TypeScript type definitions
- `vite.config.ts` - Build config, path aliases, security headers, code splitting

## Environment Variables

Required in `.env`:
```
VITE_API_URL=http://localhost:5000/api  # Backend API base URL
VITE_APP_NAME=React Shop
```

## Testing Philosophy

- 70% coverage threshold enforced
- Co-located tests with features
- Use `src/tests/test-utils.tsx` for Redux/Router-wrapped renders
- Vitest + React Testing Library + jsdom
