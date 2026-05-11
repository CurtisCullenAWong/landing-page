"use client";

import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme as useNextTheme } from "next-themes";
import { useMemo } from "react";
import { getThemeOptions } from "@/lib/mui-theme";

export function MuiThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();

  // Determine MUI mode based on resolvedTheme
  const muiTheme = useMemo(() => {
    // resolvedTheme is already 'light' or 'dark', even if theme === 'system'
    const mode = resolvedTheme === "dark" ? "dark" : "light";
    return createTheme(getThemeOptions(mode));
  }, [resolvedTheme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}