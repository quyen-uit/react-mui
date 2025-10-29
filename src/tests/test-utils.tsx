import { render, type RenderOptions } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { CssBaseline, CssVarsProvider } from '@mui/material';
import { store } from '@/app/store';

const AllProviders = ({ children }: PropsWithChildren) => (
  <Provider store={store}>
    <CssVarsProvider>
      <CssBaseline />
      {children}
    </CssVarsProvider>
  </Provider>
);

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

