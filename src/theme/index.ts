import { extendTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';

export const theme = extendTheme({
  colorSchemes: {
    light: {},
    dark: {},
  },
  typography: {
    fontFamily: 'Inter, system-ui, Arial, sans-serif',
  },
});

export function useColorSchemeToggle() {
  const { mode, setMode } = useColorScheme();
  const toggle = () => setMode(mode === 'dark' ? 'light' : 'dark');
  return { mode, toggle } as const;
}

