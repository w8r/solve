import * as React from 'react';
import { config } from '../../tamagui.config';
import { TamaguiProvider, TamaguiProviderProps } from 'tamagui';

export function ThemeProvider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, 'config'>) {
  return (
    <TamaguiProvider
      config={config}
      disableInjectCSS
      defaultTheme="light"
      {...rest}
    >
      {children}
    </TamaguiProvider>
  );
}
