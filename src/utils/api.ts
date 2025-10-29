import type { ApiError } from '@/types/common';

export function extractApiError(err: unknown): string {
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err && 'data' in err) {
    const anyErr = err as any;
    return anyErr.data?.message || anyErr.error || 'Unknown error';
  }
  return 'Unknown error';
}

