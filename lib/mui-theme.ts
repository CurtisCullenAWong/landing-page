import { ThemeOptions } from "@mui/material/styles";

/**
 * Color palette configuration for MUI theme
 */
export const themeColors = {
  light: {
    primary: {
      main: "#00A7A7",        // Brand teal
      light: "#1ECAD3",
      dark: "#007C7C",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0F2A3D",        // Dark blue from logo
      light: "#1B3F5A",
      dark: "#091C2B",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#f8fafc",
    },
    text: {
      primary: "#0F2A3D",
      secondary: "#4B6B82",
    },
    error: {
      main: "#D32F2F",
      light: "#EF5350",
      dark: "#B71C1C",
    },
    warning: {
      main: "#ED6C02",
      light: "#FF9800",
      dark: "#E65100",
    },
    info: {
      main: "#0288D1",
      light: "#03A9F4",
      dark: "#01579B",
    },
    success: {
      main: "#2E7D32",
      light: "#4CAF50",
      dark: "#1B5E20",
    },
    divider: "#E0E7EF",
    action: {
      hover: "rgba(15, 42, 61, 0.08)",
      selected: "rgba(0, 167, 167, 0.12)",
      disabled: "rgba(0, 0, 0, 0.26)",
      disabledBackground: "rgba(0, 0, 0, 0.12)",
    },
  },

  dark: {
    primary: {
      main: "#1ECAD3",
      light: "#4FDDE3",
      dark: "#00A7A7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1ECAD3",
      light: "#4FDDE3",
      dark: "#00A7A7",
      contrastText: "#0B0F14",
    },
    background: {
      default: "#0B0F14",
      paper: "#121821",
    },
    text: {
      primary: "#E8EDF2",
      secondary: "#B8C9D9",
    },
    error: {
      main: "#F44336",
      light: "#E57373",
      dark: "#D32F2F",
    },
    warning: {
      main: "#FFA726",
      light: "#FFB74D",
      dark: "#F57C00",
    },
    info: {
      main: "#29B6F6",
      light: "#4FC3F7",
      dark: "#0288D1",
    },
    success: {
      main: "#66BB6A",
      light: "#81C784",
      dark: "#388E3C",
    },
    divider: "#1E2A36",
    action: {
      hover: "rgba(255, 255, 255, 0.08)",
      selected: "rgba(30, 202, 211, 0.16)",
      disabled: "rgba(255, 255, 255, 0.26)",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
    },
  },
};

/**
 * Typography configuration
 */
export const themeTypography = {
  fontFamily: [
    "var(--font-geist-sans)",
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    "sans-serif",
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(","),
  h1: {
    fontSize: "2.5rem",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
  },
  h3: {
    fontSize: "1.75rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: "1rem",
    lineHeight: 1.6,
  },
  body2: {
    fontSize: "0.875rem",
    lineHeight: 1.6,
  },
  button: {
    fontSize: "0.875rem",
    fontWeight: 500,
    textTransform: "none" as const,
  },
  caption: {
    fontSize: "0.75rem",
    lineHeight: 1.5,
  },
  overline: {
    fontSize: "0.75rem",
    fontWeight: 500,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
  },
};

/**
 * Shape configuration (border radius, etc.)
 */
export const themeShape = {
  borderRadius: 8,
};

/**
 * Spacing configuration
 */
export const themeSpacing = 8; // Base spacing unit in pixels

/**
 * Creates MUI theme options based on mode
 */
export const getThemeOptions = (mode: "light" | "dark"): ThemeOptions => {
  const colors = themeColors[mode];

  return {
    palette: {
      mode,
      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
      text: colors.text,
      error: colors.error,
      warning: colors.warning,
      info: colors.info,
      success: colors.success,
      divider: colors.divider,
      action: colors.action,
    },
    typography: themeTypography,
    shape: themeShape,
    spacing: themeSpacing,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: themeShape.borderRadius,
            padding: "8px 16px",
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: themeShape.borderRadius * 1.5,
            boxShadow: mode === "light" 
              ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
              : "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  };
};

