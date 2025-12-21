"use client";

import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { getThemeOptions } from "@/lib/mui-theme";

export function MuiThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const muiTheme = useMemo(() => {
    const mode = resolvedTheme === "dark" ? "dark" : "light";
    return createTheme(getThemeOptions(mode));
  }, [resolvedTheme]);

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

