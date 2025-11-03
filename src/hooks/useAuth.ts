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

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) ?? false;
  };

  return {
    user,
    isAuthenticated,
    token,
    logout: handleLogout,
    hasRole,
    hasPermission,
  };
};
