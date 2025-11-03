# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready React application with TypeScript, featuring authentication, role-based access control, admin dashboard, internationalization, and comprehensive state management using Redux Toolkit with RTK Query. Built with Material-UI (MUI) v6, Tailwind CSS, and includes MSW for API mocking during development.

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

### Docker
```bash
docker build -t react-shop .     # Build Docker image
docker run -p 8080:80 react-shop  # Run container on port 8080
```

## Architecture

### MSW (Mock Service Worker)
- Enable/disable with `VITE_ENABLE_MSW=true` in `.env` (development only)
- Default handlers: `/auth/me` returns 401, `/health` returns ok
- Handlers defined in `src/mocks/` directory
- MSW runs in browser via service worker when enabled

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
- **Admin Layout** (`/admin`): Nested under ProtectedRoute with `roles={['admin']}`
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

### Custom Hooks (`src/hooks/`)
Reusable business logic extracted into custom hooks:

- **`useAuth`** - Authentication utilities (user, logout, hasRole, hasPermission)
- **`usePagination`** - Client-side pagination with next/prev/goToPage
- **`useApiMutation`** - Mutation wrapper with loading states and toast notifications
- **`useDebounce`** - Debounced values for search/filtering (500ms default)
- **`useLocalStorage`** - Persistent state with localStorage sync
- **`useActivityTimeout`** - Auto-logout after inactivity (default 30 minutes)

Example usage:
```typescript
import { useAuth, usePagination, useDebounce } from '@/hooks';

const { user, logout, hasRole } = useAuth();
const { paginatedData, nextPage, prevPage } = usePagination({ data, itemsPerPage: 10 });
const debouncedSearch = useDebounce(searchTerm, 500);
```

### API Service Pattern
Each API domain is a file in `src/services/api/`:
- `[domain].ts`: Defines endpoints using `baseApi.injectEndpoints()`
- Exports API slice and auto-generated hooks directly
- **Pagination support** via `PaginationParams` (page, perPage, sortBy, sortOrder, search)
- **Optimistic updates** for instant UI feedback
- **Smart cache invalidation** with individual item tags

Example from `src/services/api/products.ts`:
```typescript
import type { ApiListResponse, PaginationParams } from '@/types/api';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProducts: builder.query<ApiListResponse<Product>, PaginationParams | void>({
      query: (params) => ({
        url: PRODUCTS.LIST,
        params: params || { page: 1, perPage: 10 },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Products' as const, id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<Product, Partial<Product> & { id: string | number }>({
      query: ({ id, ...body }) => ({ url: PRODUCTS.UPDATE(id), method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],
      // Optimistic update
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productsApi.util.updateQueryData('getProduct', id, (draft) => {
            Object.assign(draft, patch);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useListProductsQuery, useUpdateProductMutation } = productsApi;
```

### HTTP Client
- **RTK Query**: Single client for CRUD and auth flows
- **Type-safe baseQuery**: No `any` types, proper `ApiError` interface
- **Auto token refresh** on 401 with request queuing (concurrent 401s deduplicated)
- **Network error handling**: Detects and reports connection issues
- **CSRF protection**: Automatically includes X-CSRF-Token header from meta tag

### Token Storage Strategy
- Access token: kept only in memory (Redux). Never written to localStorage.
- Refresh token: httpOnly, Secure cookie managed by the backend.
- CSRF: Token read from `<meta name="csrf-token">` and sent with non-GET requests

### Error Handling System
**Centralized error types** (`src/types/errors.ts`):
```typescript
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTH = 'AUTH_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  SERVER = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
  static fromApiError(error: ApiError): AppError {
    // Categorizes API errors into user-friendly types
  }
}
```

**Error UI Components**:
- **`<ErrorAlert />`** (`src/components/errors/ErrorAlert.tsx`) - Displays errors with retry button
- **`<ErrorBoundary />`** - Enhanced with stack traces in development mode
- **Toast notifications** - Automatic error toasts via react-toastify

**Usage in components**:
```typescript
import { ErrorAlert } from '@/components/errors';
import { AppError } from '@/types/errors';

const { data, error, refetch } = useListProductsQuery();

if (error) {
  return <ErrorAlert error={AppError.fromApiError(error)} onRetry={refetch} />;
}
```

### Internationalization
- **i18next**: Configured in `src/locales/i18n.ts`
- Languages: `en`, `vi` with translations in `src/locales/[lang]/translation.json`
- Usage: `useTranslation()` hook from `react-i18next`
- **Security**: `escapeValue: true` to prevent XSS attacks via translations

### Toast Notifications
- **react-toastify** integrated in `src/main.tsx`
- Auto-dismiss after 3 seconds
- Position: top-right
- Themed with MUI colors

**Usage**:
```typescript
import { toast } from 'react-toastify';

toast.success('Product created successfully!');
toast.error('Failed to save changes');
toast.warning('Session expiring soon');
```

### Component Organization
Components organized by purpose:

**`src/components/ui/`** - Reusable UI components:
- `LoadingSpinner` - Generic loading indicator
- `Skeletons` - Content placeholders
- `SkeletonTable` - Table loading state (rows, columns configurable)
- `SkeletonCard` - Card loading state (with/without image)
- `Card` - Example with CSS Module

**`src/components/forms/`** - Form components with react-hook-form:
- `FormTextField` - Text input with automatic error display
- `FormSelect` - Dropdown with options support

**`src/components/guards/`**:
- `ProtectedRoute` - Route protection with role checking

**`src/components/errors/`**:
- `ErrorBoundary` - Catches React errors, shows stack trace in dev
- `ErrorAlert` - Displays API errors with retry button

### Feature Flags (`src/config/features.ts`)
Environment-based feature toggles:
```typescript
export const FEATURES = {
  ENABLE_DARK_MODE: import.meta.env.VITE_FEATURE_DARK_MODE === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
  ENABLE_WEBSOCKETS: import.meta.env.VITE_FEATURE_WEBSOCKETS === 'true',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_FEATURE_NOTIFICATIONS !== 'false',
  ENABLE_BETA_FEATURES: import.meta.env.VITE_FEATURE_BETA === 'true',
};

// Usage
{FEATURES.ENABLE_DARK_MODE && <DarkModeToggle />}
```

### Analytics (`src/utils/analytics.ts`)
Event tracking system with pre-built trackers:
```typescript
import { analytics } from '@/utils/analytics';

// Auth events
analytics.login('email');
analytics.logout();

// Product events
analytics.productView(productId);
analytics.productCreate(productId);

// Custom events
analytics.custom('button_click', { button: 'submit', page: 'checkout' });
```

### Styling Strategy
This project uses **Material-UI (MUI) v6** with **Tailwind CSS** utilities and **CSS Modules** for custom styles.

#### Styling Priority (Use in this order):
1. **MUI `sx` Prop & Theme** (First Choice) - For standard MUI styling
2. **Tailwind Utilities** (Second Choice) - For quick layout/spacing helpers
3. **CSS Modules** (Third Choice) - For complex custom component styles
4. **Inline Styles** (Last Resort) - For dynamic/conditional values only

#### 1. MUI `sx` Prop & Theme - Use FIRST ⭐
**When to use:**
- Standard spacing, colors, typography
- Responsive design with MUI breakpoints
- Theme-based styling

**Examples:**
```tsx
// ✅ Good - Use MUI sx prop
import { Paper, Typography, Button } from '@mui/material';

<Paper sx={{ p: 2, mb: 2, boxShadow: 1 }}>
  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
    Title
  </Typography>
  <Button variant="contained" sx={{ mt: 2 }}>Submit</Button>
</Paper>

// Responsive with breakpoints
<Box sx={{
  width: { xs: '100%', sm: '50%', md: '33%' },
  p: { xs: 1, sm: 2, md: 3 }
}}>

// Common sx properties
sx={{ p: 2 }}           // padding: theme.spacing(2)
sx={{ mt: 3 }}          // margin-top: theme.spacing(3)
sx={{ color: 'primary.main' }}  // theme color
sx={{ fontWeight: 600 }}
sx={{ textAlign: 'center' }}
```

#### 2. Tailwind Utilities - Use for LAYOUT HELPERS 🎯
**When to use:**
- Quick flex/grid layouts
- Spacing adjustments
- Common utility classes

**Examples:**
```tsx
// ✅ Good - Tailwind for layout
<div className="flex justify-between items-center gap-4">
  <div className="flex-1">Content</div>
  <div className="w-32">Sidebar</div>
</div>

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

#### 3. CSS Modules - Use for CUSTOM STYLES 🎨
**When to use:**
- Complex hover effects and animations
- Pseudo-elements (::before, ::after)
- Component-specific custom styling
- Styles that don't fit MUI or Tailwind patterns

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
// Card.tsx
import { Card as MuiCard, CardContent, Typography } from '@mui/material';
import styles from './Card.module.css';

export const Card = ({ title, children }) => {
  return (
    <MuiCard className={styles.card} sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        {children}
      </CardContent>
    </MuiCard>
  );
};
```

```css
/* Card.module.css */
.card {
  transition: box-shadow 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fadeIn {
  animation: fadeIn 0.3s ease;
}
```

**Combining all three approaches:**
```tsx
// ✅ Best practice - Combine MUI sx, Tailwind, and CSS Modules
<Paper className={`${styles.card} flex justify-between`} sx={{ p: 2, mb: 2 }}>
  <Typography variant="h6" sx={{ fontWeight: 600 }}>
    Title
  </Typography>
</Paper>
```

#### 4. Inline Styles - Use SPARINGLY ⚠️
**When to use:**
- Dynamic values from props/state
- One-off exceptions

**Examples:**
```tsx
// ✅ Good - Dynamic value
<div style={{ width: `${progress}%` }}>

// ✅ Good - One-off override
<Avatar style={{ cursor: 'pointer' }} />

// ❌ Avoid - Should use sx prop or CSS Module
<div style={{
  display: 'flex',
  padding: '20px',
  borderRadius: '8px',
}}>
```

#### Styling Decision Matrix

| Scenario | Use |
|----------|-----|
| Spacing (padding, margin) | **MUI sx** (`sx={{ p: 2, mt: 3 }}`) |
| Colors from theme | **MUI sx** (`sx={{ color: 'primary.main' }}`) |
| Typography | **MUI Typography** component with variant |
| Quick flex/grid layouts | **Tailwind** (`flex justify-between`) |
| Responsive design | **MUI sx breakpoints** (`sx={{ width: { xs: '100%', md: '50%' } }}`) |
| Complex animations | **CSS Modules** |
| Hover effects | **CSS Modules** |
| Pseudo-elements | **CSS Modules** |
| Dynamic colors/sizes from state | **Inline styles** |

#### Setup
- TypeScript types for CSS Modules: `src/types/css-modules.d.ts`
- Example component: `src/components/ui/Card.tsx` (demonstrates MUI + CSS Modules)
- Tailwind configured in `tailwind.config.js`
- Vite handles CSS Modules automatically

### Layouts
**MainLayout** (`src/layouts/MainLayout.tsx`):
- Header with auth controls (logout button, user display)
- Role-based navigation filtering
- Dynamic sidebar with user info and role badge
- Activity timeout integration (30-minute auto-logout)
- Theme toggle (dark/light mode)
- Language switcher (EN/VI)
- Proper loading fallback with `CircularProgress`

**AdminLayout** (`src/layouts/AdminLayout.tsx`):
- Admin-specific shell with different navigation
- Protected by ProtectedRoute with `roles={['admin']}`

### Security Features
**CSRF Protection**:
- `baseApi` reads CSRF token from `<meta name="csrf-token">`
- Token automatically sent with non-GET requests via `X-CSRF-Token` header

**XSS Protection**:
- i18n configured with `escapeValue: true`
- All user input properly escaped in translations

**Session Security**:
- **Activity timeout**: Auto-logout after 30 minutes of inactivity
- Tracks mouse, keyboard, scroll, touch events
- Toast warning before logout
- Access tokens stored only in memory (Redux), never in localStorage
- Refresh tokens in httpOnly Secure cookies

**Token Management**:
- Automatic token refresh with request queuing
- Concurrent 401s deduplicated (single refresh request)
- Failed refresh triggers immediate logout

**Headers**:
- Security headers in `vite.config.ts` (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- Cookies sent via `credentials: 'include'` in all API requests

### Performance Optimizations
- **Code splitting**: vendor, redux, mui chunks (`vite.config.ts` manualChunks)
- **RTK Query caching**:
  - `keepUnusedDataFor: 60` seconds
  - `refetchOnMountOrArgChange: 30` seconds
  - Smart tag-based invalidation (individual item tags + list tags)
- **Optimistic updates**: Instant UI feedback for mutations with automatic rollback on error
- **Lazy loading**: React Router with Suspense for all routes
- **Loading skeletons**: Content-aware placeholders instead of spinners

## Common Development Tasks

### Adding a New API Endpoint
1. Create/update API slice in `src/services/api/[domain].ts`
2. Define types in `src/types/[domain].ts`
3. Add URL constants in `src/constants/api.ts`
4. Export auto-generated hooks from the API file
5. Use hooks in components (e.g., `useListProductsQuery`, `useCreateProductMutation`)

### Adding a New Protected Route
```typescript
// In src/routes/index.tsx
<Route
  path="/new-page"
  element={
    <ProtectedRoute roles={['admin']}> {/* roles prop is optional */}
      <NewPage />
    </ProtectedRoute>
  }
/>
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

### Core Configuration
- `src/app/store.ts` - Redux store with DevTools, logging middleware
- `src/app/authSlice.ts` - Authentication state management
- `src/services/baseApi.ts` - Type-safe RTK Query base API with CSRF, error handling
- `src/routes/index.tsx` - Application routing structure
- `vite.config.ts` - Build config, path aliases, security headers, code splitting

### Type Definitions
- `src/types/errors.ts` - Error handling types (ErrorType, AppError, ApiError)
- `src/types/api.ts` - API response types (ApiListResponse, PaginationParams)
- `src/types/` - Other TypeScript type definitions

### Utilities & Config
- `src/hooks/` - Custom hooks (useAuth, usePagination, useApiMutation, etc.)
- `src/config/features.ts` - Feature flags configuration
- `src/utils/analytics.ts` - Event tracking system
- `src/locales/i18n.ts` - i18next configuration (XSS-safe)

### Components
- `src/components/errors/ErrorAlert.tsx` - Error display with retry
- `src/components/forms/` - Reusable form components (FormTextField, FormSelect)
- `src/components/ui/` - UI components (SkeletonTable, SkeletonCard, etc.)

### Documentation
- `CLAUDE.md` - This file (project guidance)
- `RECOMMENDATIONS.md` - 6-week implementation roadmap
- `IMPROVEMENTS_SUMMARY.md` - Complete improvements documentation
- `BEFORE_AFTER.md` - Side-by-side comparison of improvements

## Environment Variables

Copy `.env.example` to `.env` and configure:
```
# Backend API
VITE_API_URL=http://localhost:5000/api  # Backend API base URL
VITE_APP_NAME=React Claude App          # Application name

# Error Tracking
VITE_SENTRY_DSN=                        # Sentry DSN (optional)
VITE_SENTRY_ENABLED=false               # Enable/disable Sentry
VITE_ENV=development                    # Environment

# Development Tools
VITE_ENABLE_MSW=false                   # Enable Mock Service Worker

# Feature Flags (optional)
VITE_FEATURE_DARK_MODE=true             # Dark mode toggle
VITE_FEATURE_ANALYTICS=true             # Event tracking
VITE_FEATURE_WEBSOCKETS=false           # WebSocket support
VITE_FEATURE_NOTIFICATIONS=true         # Push notifications
VITE_FEATURE_BETA=false                 # Beta features

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX     # Google Analytics ID
```

## Recent Architectural Improvements (2025)

This project has been enhanced with modern, production-ready patterns:

### ✅ Type Safety
- Removed all `any` types from baseApi
- Added proper error type hierarchy (ErrorType, AppError, ApiError)
- Created API response type wrappers (ApiListResponse, PaginationParams)

### ✅ Error Handling
- Centralized error types with user-friendly categorization
- `<ErrorAlert />` component with retry functionality
- Enhanced `<ErrorBoundary />` with stack traces in dev mode
- Toast notifications for all user actions

### ✅ Custom Hooks
- `useAuth` - Authentication utilities
- `usePagination` - Client-side pagination
- `useApiMutation` - Mutation with loading/error/toast
- `useDebounce` - Debounced values for search
- `useLocalStorage` - Persistent state
- `useActivityTimeout` - Auto-logout after inactivity

### ✅ API Enhancements
- Pagination support (page, perPage, sortBy, sortOrder, search)
- Optimistic updates for instant UI feedback
- Smart cache invalidation (individual + list tags)
- CSRF token support
- Network error detection

### ✅ UI/UX Improvements
- Loading skeletons (SkeletonTable, SkeletonCard)
- Toast notifications (success, error, warning)
- Form components (FormTextField, FormSelect)
- Enhanced MainLayout (logout, user display, activity timeout)

### ✅ Security
- XSS protection in i18n (`escapeValue: true`)
- CSRF token support in baseApi
- 30-minute activity timeout with auto-logout
- Access tokens in memory only

### ✅ Developer Experience
- Redux DevTools with trace
- Custom logging middleware (dev only)
- Feature flags system
- Analytics tracking utilities
- Comprehensive documentation (3 markdown files)

**For detailed explanations, see:**
- `RECOMMENDATIONS.md` - Implementation roadmap
- `IMPROVEMENTS_SUMMARY.md` - Complete documentation
- `BEFORE_AFTER.md` - Side-by-side comparisons

## Testing Philosophy

- 70% coverage threshold enforced
- Co-located tests with features
- Use `src/tests/test-utils.tsx` for Redux/Router-wrapped renders
- Vitest + React Testing Library + jsdom
