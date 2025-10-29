React Shop (Vite + React 18 + TS)

- UI: MUI v6 + Tailwind CSS (utilities) + optional CSS Modules
- State: Redux Toolkit + RTK Query (with baseQueryWithReauth)
- Router: react-router-dom v6
- Forms: react-hook-form + zod
- i18n: i18next + react-i18next
- Tables: Material React Table v3
- Testing: Vitest + Testing Library
- Mocks: MSW
- Quality: ESLint (flat) + Prettier + Husky + lint-staged
- Monitoring: Sentry (@sentry/react + @sentry/vite-plugin)

Getting Started

- Copy `.env.example` to `.env` and adjust as needed
- Install: `npm install`
- Dev: `npm run dev` (http://localhost:3000)

Scripts

- `dev` start dev server on port 3000
- `build` build production assets
- `preview` preview production build
- `lint`, `lint:fix`, `format` quality tools
- `test`, `test:run`, `test:ui`, `test:coverage` testing
- `prepare` install Husky hooks

MSW

- Toggle with `VITE_ENABLE_MSW=true` in `.env` (dev only)
- Default handlers: `/auth/me` returns 401, `/health` returns ok

Auth Model

- Access token stored only in Redux state (in-memory)
- Refresh token is httpOnly Secure cookie (server-managed)
- `baseQueryWithReauth` retries request after `/auth/refresh` on 401 and dedupes concurrent refreshes

Routing

- Public: `/`, `/login`, `/register`, `/examples/*`
- Protected: `/dashboard`, `/profile`, `/products`, `/colors`
- Admin (protected): `/admin/*`
- `ProtectedRoute` shows spinner until initialized, redirects to `/login` if unauthenticated, and shows MUI-based unauthorized UI if role mismatch

Styling Strategy

- Prefer MUI `sx` and theme tokens
- Tailwind utilities for layout/spacing helpers
- CSS Modules for component-specific complex styles (`src/components/ui/Card.module.css`)

Tests

- Vitest JSDOM with MSW server; coverage threshold at 70%

Docker

- Build: `docker build -t react-shop .`
- Run: `docker run -p 8080:80 react-shop`

Troubleshooting

- Node 20+ recommended. If Husky hooks aren’t installed, run `npm run prepare`.
- If tables don’t render, ensure `material-react-table` and MUI peer deps match.

