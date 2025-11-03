# Project Improvement Recommendations

Based on comprehensive codebase analysis, here are prioritized recommendations to modernize and scale your React + TypeScript application.

---

## 🔴 CRITICAL PRIORITIES (Weeks 1-2)

### 1. Implement Testing Infrastructure

**Current State:** 0 tests written, but 70% coverage threshold enforced
**Impact:** High - Project is untestable and fragile

**Action Items:**
```bash
# Start with critical paths
npm run test:run -- src/features/auth/LoginPage.test.tsx
npm run test:run -- src/services/api/auth.test.ts
npm run test:run -- src/components/guards/ProtectedRoute.test.tsx
```

**Example Test Structure:**
```typescript
// src/features/auth/LoginPage.test.tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/test-utils';
import LoginPage from './LoginPage';
import { server } from '@/mocks/server';
import { rest } from 'msw';

describe('LoginPage', () => {
  it('should login successfully with valid credentials', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });

  it('should show error message on invalid credentials', async () => {
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

**Testing Targets:**
- [ ] Auth flow: Login, Logout, Register, Refresh
- [ ] Protected routes: Authorization, Role checking
- [ ] API layer: RTK Query endpoints with MSW
- [ ] Components: Forms, Modals, Tables
- [ ] Utils: Permissions, Logger, Storage

---

### 2. Create Custom Hooks for Shared Logic

**Current State:** Logic duplicated across components
**Impact:** Medium-High - Poor maintainability

**Create `src/hooks/` directory:**

```typescript
// src/hooks/useAuth.ts
import { useAppSelector, useAppDispatch } from '@/app/store';
import { logout } from '@/app/authSlice';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const hasRole = (roles: string[]) => {
    return user?.role && roles.includes(user.role);
  };

  return {
    user,
    isAuthenticated,
    token,
    logout: handleLogout,
    hasRole,
  };
};
```

```typescript
// src/hooks/usePagination.ts
import { useState, useMemo } from 'react';

interface PaginationOptions<T> {
  data: T[];
  itemsPerPage?: number;
}

export const usePagination = <T,>({ data, itemsPerPage = 10 }: PaginationOptions<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
  };
};
```

```typescript
// src/hooks/useApiMutation.ts
import { useState } from 'react';
import { toast } from 'react-toastify'; // Add this library

interface UseApiMutationOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useApiMutation = <T extends (...args: any[]) => Promise<any>>(
  mutationFn: T,
  options?: UseApiMutationOptions
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (...args: Parameters<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(...args);

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      options?.onSuccess?.();
      return result;
    } catch (err: any) {
      const errorMsg = err?.data?.message || options?.errorMessage || 'An error occurred';
      setError(errorMsg);
      toast.error(errorMsg);
      options?.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
};
```

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

**Hooks to Create:**
- [x] `useAuth` - Authentication utilities
- [x] `usePagination` - Client-side pagination
- [x] `useApiMutation` - Mutation with loading/error states
- [x] `useDebounce` - Debounced values for search
- [ ] `useLocalStorage` - Persistent state
- [ ] `useMediaQuery` - Responsive breakpoints
- [ ] `useIntersectionObserver` - Lazy loading

---

### 3. Implement Proper Error Handling System

**Current State:** Errors silently swallowed, no user feedback
**Impact:** Critical - Users don't know when things fail

**Step 1: Create Error Types**

```typescript
// src/types/errors.ts
export interface ApiError {
  status: number;
  data: {
    message: string;
    errors?: Record<string, string[]>;
    code?: string;
  };
}

export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTH = 'AUTH_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AppError';
  }

  static fromApiError(error: ApiError): AppError {
    if (error.status >= 500) {
      return new AppError(ErrorType.SERVER, 'Server error occurred', error);
    }
    if (error.status === 401 || error.status === 403) {
      return new AppError(ErrorType.AUTH, 'Authentication failed', error);
    }
    if (error.status === 422) {
      return new AppError(ErrorType.VALIDATION, error.data.message, error);
    }
    return new AppError(ErrorType.UNKNOWN, error.data.message, error);
  }
}
```

**Step 2: Create Error UI Component**

```typescript
// src/components/errors/ErrorAlert.tsx
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { AppError, ErrorType } from '@/types/errors';

interface ErrorAlertProps {
  error: AppError | Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorAlert = ({ error, onRetry, onDismiss }: ErrorAlertProps) => {
  if (!error) return null;

  const isAppError = error instanceof AppError;
  const severity = isAppError && error.type === ErrorType.VALIDATION ? 'warning' : 'error';

  return (
    <Alert
      severity={severity}
      onClose={onDismiss}
      sx={{ mb: 2 }}
    >
      <AlertTitle>
        {isAppError ? error.type.replace('_', ' ') : 'Error'}
      </AlertTitle>
      {error.message}
      {onRetry && (
        <Box sx={{ mt: 1 }}>
          <Button size="small" onClick={onRetry}>
            Try Again
          </Button>
        </Box>
      )}
    </Alert>
  );
};
```

**Step 3: Update RTK Query Error Handling**

```typescript
// src/services/baseApi.ts - Add error transformation
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Products', 'User', 'Health', 'Colors'],
  endpoints: () => ({}),

  // Add this:
  refetchOnMountOrArgChange: 30,
  refetchOnReconnect: true,
  keepUnusedDataFor: 60,
});

// Update baseQueryWithReauth to handle more error cases
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Network error
  if (result.error && !result.error.status) {
    return {
      error: {
        status: 0,
        data: { message: 'Network error. Please check your connection.' },
      } as ApiError,
    };
  }

  // Auth error with refresh
  if (result.error && result.error.status === 401) {
    if (!refreshing) {
      refreshing = (async () => {
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data?.accessToken) {
          api.dispatch(updateTokens({ token: refreshResult.data.accessToken as string }));
          return refreshResult.data.accessToken as string;
        } else {
          api.dispatch(logout());
          return null;
        }
      })();
    }

    const newToken = await refreshing;
    refreshing = null;

    if (newToken) {
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};
```

**Step 4: Use in Components**

```typescript
// src/features/profile/ProfilePage.tsx
import { ErrorAlert } from '@/components/errors/ErrorAlert';
import { AppError } from '@/types/errors';

export default function ProfilePage() {
  const { data, error, isLoading, refetch } = useGetProfileQuery();

  if (error) {
    return (
      <ErrorAlert
        error={AppError.fromApiError(error as any)}
        onRetry={refetch}
      />
    );
  }

  // ... rest of component
}
```

---

### 4. Add API Request/Response Normalization

**Current State:** Inconsistent API response structures
**Impact:** High - Scaling issues

**Create API Response Wrapper:**

```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
```

**Update Products API with Pagination:**

```typescript
// src/services/api/products.ts
import { baseApi } from '@/services/baseApi';
import { PRODUCTS } from '@/constants/api';
import type { Product } from '@/types/product';
import type { ApiResponse, PaginationParams } from '@/types/api';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProducts: builder.query<ApiResponse<Product[]>, PaginationParams>({
      query: (params) => ({
        url: PRODUCTS.LIST,
        params, // Sends ?page=1&perPage=10&sortBy=name
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Products' as const, id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),

    getProduct: builder.query<Product, string | number>({
      query: (id) => ({ url: PRODUCTS.DETAIL(id) }),
      providesTags: (result, error, id) => [{ type: 'Products', id }],
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: PRODUCTS.CREATE, method: 'POST', body }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],

      // Optimistic update
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newProduct } = await queryFulfilled;
          dispatch(
            productsApi.util.updateQueryData('listProducts', {}, (draft) => {
              draft.data.push(newProduct);
            })
          );
        } catch {}
      },
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

    deleteProduct: builder.mutation<{ success: boolean }, string | number>({
      query: (id) => ({ url: PRODUCTS.DELETE(id), method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
```

---

### 5. Improve Redux Store Configuration

**Current State:** Minimal Redux DevTools, no custom middleware
**Impact:** Medium - Poor debugging experience

```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import { baseApi } from '@/services/baseApi';

// Custom middleware for logging
const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(action.type);
    console.info('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in serializable check
        ignoredActions: ['auth/setCredentials'],
        ignoredPaths: ['auth.user'],
      },
    }).concat(baseApi.middleware, loggerMiddleware),
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'React Shop',
    trace: true,
    traceLimit: 25,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 🟡 HIGH PRIORITIES (Weeks 3-4)

### 6. Implement Toast Notifications

**Install:**
```bash
npm install react-toastify
```

**Setup:**
```typescript
// src/main.tsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </Provider>
  </StrictMode>
);
```

**Usage in Components:**
```typescript
import { toast } from 'react-toastify';

const [updateProfile] = useUpdateProfileMutation();

const handleSave = async (data: ProfileData) => {
  try {
    await updateProfile(data).unwrap();
    toast.success('Profile updated successfully!');
  } catch (error) {
    toast.error('Failed to update profile');
  }
};
```

---

### 7. Add Loading States & Skeletons

**Current State:** Inconsistent loading indicators
**Impact:** Medium - Poor UX

```typescript
// src/components/ui/SkeletonTable.tsx
import { Skeleton, Box, Stack } from '@mui/material';

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <Box>
    {/* Header */}
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" height={40} sx={{ flex: 1 }} />
      ))}
    </Stack>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <Stack key={i} direction="row" spacing={2} sx={{ mb: 1 }}>
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} variant="rectangular" height={50} sx={{ flex: 1 }} />
        ))}
      </Stack>
    ))}
  </Box>
);
```

```typescript
// Usage in ProductsPage
export default function ProductsPage() {
  const { data, isLoading } = useListProductsQuery({ page: 1, perPage: 10 });

  if (isLoading) {
    return <SkeletonTable rows={10} columns={5} />;
  }

  return <MaterialReactTable data={data?.data || []} columns={columns} />;
}
```

---

### 8. Implement Form Components with React Hook Form

**Create Reusable Form Components:**

```typescript
// src/components/forms/FormTextField.tsx
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';

interface FormTextFieldProps<TFieldValues extends FieldValues>
  extends Omit<TextFieldProps, 'name'> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
}

export const FormTextField = <TFieldValues extends FieldValues>({
  name,
  control,
  ...props
}: FormTextFieldProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          error={!!error}
          helperText={error?.message}
          fullWidth
        />
      )}
    />
  );
};
```

```typescript
// src/components/forms/FormSelect.tsx
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

interface FormSelectProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  options: Array<{ value: string; label: string }>;
}

export const FormSelect = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
}: FormSelectProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label}>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};
```

---

### 9. Add Security Enhancements

**Step 1: Implement CSRF Protection**

```typescript
// src/services/baseApi.ts
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);

    // Add CSRF token for non-GET requests
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }

    return headers;
  },
});
```

**Step 2: Add Activity Timeout**

```typescript
// src/hooks/useActivityTimeout.ts
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export const useActivityTimeout = (timeoutMs: number = 30 * 60 * 1000) => {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (isAuthenticated) {
        logout();
        alert('Session expired due to inactivity');
      }
    }, timeoutMs);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    events.forEach((event) => {
      document.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated]);
};
```

**Step 3: Use in MainLayout**

```typescript
// src/layouts/MainLayout/index.tsx
import { useActivityTimeout } from '@/hooks/useActivityTimeout';

export default function MainLayout() {
  useActivityTimeout(30 * 60 * 1000); // 30 minutes

  return (
    // ... layout JSX
  );
}
```

---

### 10. Performance Optimizations

**Step 1: Memoize Expensive Components**

```typescript
// src/features/products/ProductsPage.tsx
import { memo, useMemo } from 'react';

const ProductsPage = memo(() => {
  const { data, isLoading } = useListProductsQuery({ page: 1, perPage: 10 });

  const columns = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'price', header: 'Price' },
      // ... more columns
    ],
    []
  );

  // ... rest of component
});

export default ProductsPage;
```

**Step 2: Add Route Prefetching**

```typescript
// src/routes/index.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Prefetch likely next routes
const usePrefetch = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      // Prefetch login page chunks
      import('@/features/auth/LoginPage');
    }
    if (location.pathname === '/dashboard') {
      // Prefetch profile and products
      import('@/features/profile/ProfilePage');
      import('@/features/products/ProductsPage');
    }
  }, [location.pathname]);
};
```

**Step 3: Add Bundle Analysis**

```bash
npm install --save-dev rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... other plugins
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

---

## 🟢 MEDIUM PRIORITIES (Weeks 5-6)

### 11. Implement Feature Flags

```typescript
// src/config/features.ts
export const FEATURES = {
  ENABLE_DARK_MODE: import.meta.env.VITE_FEATURE_DARK_MODE === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
  ENABLE_WEBSOCKETS: import.meta.env.VITE_FEATURE_WEBSOCKETS === 'true',
} as const;

// Usage
import { FEATURES } from '@/config/features';

{FEATURES.ENABLE_DARK_MODE && <DarkModeToggle />}
```

---

### 12. Add Internationalization Improvements

```typescript
// src/locales/i18n.ts - Lazy loading
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {}, // Start empty
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'auth', 'profile', 'products'],
    defaultNS: 'common',
    interpolation: { escapeValue: true }, // ✅ Fixed security issue
  });

// Lazy load language
export const loadLanguage = async (lang: string, namespace: string) => {
  const translations = await import(`./locales/${lang}/${namespace}.json`);
  i18n.addResourceBundle(lang, namespace, translations.default);
};
```

---

### 13. Add Monitoring & Analytics

```typescript
// src/utils/analytics.ts
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (import.meta.env.VITE_FEATURE_ANALYTICS === 'true') {
    // Google Analytics
    window.gtag?.('event', eventName, properties);

    // Custom analytics
    console.log('Analytics:', eventName, properties);
  }
};

// Usage
trackEvent('user_login', { method: 'email' });
trackEvent('product_created', { productId: newProduct.id });
```

---

## 📊 SUMMARY CHECKLIST

### Week 1-2: Critical Foundation
- [ ] Fix TypeScript types in baseApi
- [ ] Implement error handling system
- [ ] Create custom hooks (useAuth, usePagination, useApiMutation)
- [ ] Write tests for auth flow
- [ ] Add toast notifications

### Week 3-4: Core Features
- [ ] Implement API normalization with pagination
- [ ] Add proper loading states
- [ ] Create reusable form components
- [ ] Add security enhancements (CSRF, timeout)
- [ ] Implement Redux DevTools & middleware

### Week 5-6: Polish & Scale
- [ ] Performance optimizations (memoization, prefetching)
- [ ] Bundle analysis and optimization
- [ ] Feature flags system
- [ ] Enhanced i18n with lazy loading
- [ ] Analytics & monitoring

---

## 🎯 LONG-TERM ARCHITECTURE IMPROVEMENTS

### Database Structure (If Backend is Yours)
```sql
-- Add indexes for performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Add soft deletes
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMP NULL;
```

### API Best Practices
1. **Versioning**: `/api/v1/products`
2. **Rate Limiting**: Implement on backend
3. **GraphQL Migration**: Consider for complex data relationships
4. **WebSocket Support**: For real-time features

### Infrastructure
1. **CI/CD Pipeline**: GitHub Actions for automated testing
2. **Staging Environment**: Separate from production
3. **Error Tracking**: Sentry integration (already configured)
4. **Performance Monitoring**: Add Lighthouse CI

---

## 📚 RECOMMENDED LIBRARIES TO ADD

```bash
# Notifications
npm install react-toastify

# Better Date Handling
npm install date-fns

# Form Validation (already have Zod, expand usage)
# Already installed: zod, react-hook-form, @hookform/resolvers

# Advanced Tables (already have Material React Table)
# Already installed: material-react-table

# Charts/Visualization
npm install recharts

# Virtual Scrolling for Large Lists
npm install react-virtual

# Better DevTools
npm install @redux-devtools/extension

# Animation
npm install framer-motion
```

---

This roadmap prioritizes critical issues first (type safety, error handling, testing) before moving to enhancements (performance, features). Each recommendation includes concrete code examples you can implement immediately.

Let me know which area you'd like to tackle first, and I can help you implement it!
