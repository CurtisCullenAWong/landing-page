"use client";

import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { getThemeOptions } from "@/lib/mui-theme";

export function MuiThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, theme } = useNextTheme(); // theme can be 'system', 'light', 'dark'
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine MUI mode based on resolvedTheme
  const muiTheme = useMemo(() => {
    // resolvedTheme is already 'light' or 'dark', even if theme === 'system'
    const mode = resolvedTheme === "dark" ? "dark" : "light";
    return createTheme(getThemeOptions(mode));
  }, [resolvedTheme]);

  // Prevent mismatched theme flash before mounting
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}