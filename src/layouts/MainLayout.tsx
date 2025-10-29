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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useState } from 'react';
import { useColorScheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/locales/i18n';

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const { mode, setMode } = useColorScheme();
  const toggleTheme = () => setMode(mode === 'dark' ? 'light' : 'dark');
  const { i18n } = useTranslation();
  const toggleLang = () => setLanguage(i18n.language === 'en' ? 'vi' : 'en');
  return (
    <Box sx={{ display: 'flex', minHeight: '100%' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
            React Shop
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle theme">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <Button color="inherit" onClick={toggleLang} sx={{ ml: 1 }}>
            {i18n.language.toUpperCase()}
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setOpen(false)}>
          <List>
            {[
              ['Home', '/'],
              ['Dashboard', '/dashboard'],
              ['Products', '/products'],
              ['Users', '/admin/users'],
              ['Examples Table', '/examples/table'],
            ].map(([label, to]) => (
              <ListItem key={to} disablePadding>
                <ListItemButton component={Link} to={to as string}>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 2, pt: 9 }}>
        <Suspense fallback={<div />}> 
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
