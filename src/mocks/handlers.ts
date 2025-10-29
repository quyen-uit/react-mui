import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const handlers = [
  http.get(`${API}/auth/me`, async () => {
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),
  http.get(`${API}/health`, async () => {
    return HttpResponse.json({ status: 'ok' }, { status: 200 });
  }),
];

