"use client";

import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme as useNextTheme } from "next-themes";
import { useMemo, useEffect, useState } from "react";
import { getThemeOptions } from "@/lib/mui-theme";

export function MuiThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine MUI mode based on resolvedTheme
  const muiTheme = useMemo(() => {
    // During SSR and hydration, forced to 'light' to match server-rendered output.
    // Once mounted, it switches to the user's preferred theme.
    const mode = (mounted && resolvedTheme === "dark") ? "dark" : "light";
    return createTheme(getThemeOptions(mode));
  }, [resolvedTheme, mounted]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}