import '@testing-library/jest-dom';
import { server } from '@/mocks/server';

// Mock DOM APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    media: query,
    matches: false,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
window.IntersectionObserver = IO;
// @ts-ignore
window.ResizeObserver = IO;

const store: Record<string, string> = {};
// @ts-ignore
window.localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => (store[k] = v),
  removeItem: (k: string) => delete store[k],
  clear: () => Object.keys(store).forEach((k) => delete store[k]),
} as any;

// Default envs for tests
// @ts-ignore
globalThis.import.meta = { env: { DEV: false, VITE_API_URL: 'http://localhost:5000/api' } };

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

