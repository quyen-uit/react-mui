import { Suspense } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { useColorScheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/locales/i18n';
import { useAuth, useActivityTimeout } from '@/hooks';

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const { mode, setMode } = useColorScheme();
  const toggleTheme = () => setMode(mode === 'dark' ? 'light' : 'dark');
  const { i18n } = useTranslation();
  const toggleLang = () => setLanguage(i18n.language === 'en' ? 'vi' : 'en');

  // Auth hook for user info and logout
  const { user, isAuthenticated, logout } = useAuth();

  // Activity timeout - 30 minutes
  useActivityTimeout(30 * 60 * 1000);

  const navigationItems = [
    { label: 'Home', to: '/' },
    { label: 'Dashboard', to: '/dashboard', protected: true },
    { label: 'Products', to: '/products', protected: true },
    { label: 'Profile', to: '/profile', protected: true },
    { label: 'Colors', to: '/colors', protected: true },
    { label: 'Admin', to: '/admin', protected: true, roles: ['admin'] },
    { label: 'Examples Table', to: '/examples/table' },
  ];

  const filteredNav = navigationItems.filter((item) => {
    if (!item.protected) return true;
    if (!isAuthenticated) return false;
    if (item.roles && user) {
      return item.roles.includes(user.role);
    }
    return true;
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" onClick={() => setOpen(true)} edge="start">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            {import.meta.env.VITE_APP_NAME || 'React Shop'}
          </Typography>

          {/* Theme Toggle */}
          <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle theme">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Language Toggle */}
          <Button color="inherit" onClick={toggleLang} sx={{ ml: 1 }}>
            {i18n.language.toUpperCase()}
          </Button>

          {/* User Info & Logout */}
          {isAuthenticated ? (
            <>
              <IconButton color="inherit" component={Link} to="/profile" sx={{ ml: 1 }}>
                <PersonIcon />
              </IconButton>
              <Typography variant="body2" sx={{ ml: 1, mr: 2 }}>
                {user?.name || user?.email}
              </Typography>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={logout}
                size="small"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login" sx={{ ml: 1 }}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setOpen(false)}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Navigation</Typography>
            {isAuthenticated && user && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {user.name || user.email}
                <br />
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    textTransform: 'capitalize',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  {user.role}
                </Typography>
              </Typography>
            )}
          </Box>
          <Divider />
          <List>
            {filteredNav.map(({ label, to }) => (
              <ListItem key={to} disablePadding>
                <ListItemButton component={Link} to={to}>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}>
        <Suspense
          fallback={
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
              }}
            >
              <CircularProgress />
            </Box>
          }
        >
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
