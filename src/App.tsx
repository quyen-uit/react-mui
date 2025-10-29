import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import router from '@/routes';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import { useGetCurrentUserQuery } from '@/services/api/auth';
import { setCredentials, setInitialized, setLoading } from '@/app/authSlice';
import '@/locales/i18n';

function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const { data, isLoading, isError, isSuccess } = useGetCurrentUserQuery(undefined, {
    skip: false,
  });

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setCredentials({ user: data.user, token: data.accessToken }));
      dispatch(setInitialized(true));
    }
    if (isError) {
      dispatch(setInitialized(true));
    }
  }, [isSuccess, isError, data, dispatch]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
