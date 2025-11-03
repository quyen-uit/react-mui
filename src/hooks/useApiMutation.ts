import { useState } from 'react';
import { toast } from 'react-toastify';

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
      const errorMsg =
        err?.data?.message || options?.errorMessage || 'An error occurred';
      setError(errorMsg);
      toast.error(errorMsg);
      options?.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error, setError };
};
