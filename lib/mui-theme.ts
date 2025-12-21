import { ThemeOptions } from "@mui/material/styles";

/**
 * Color palette configuration for MUI theme
 */
export const themeColors = {
  light: {
    primary: {
      main: "#00A7A7", // Brand teal
      light: "#1ECAD3",
      dark: "#007C7C",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0F2A3D", // Navy
      light: "#1B3F5A",
      dark: "#091C2B",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#F8FAFC",
    },
    text: {
      primary: "#0F2A3D",
      secondary: "#4B6B82",
    },
    error: {
      main: "#C44E4E",
      light: "#E08A8A",
      dark: "#9F3B3B",
    },
    warning: {
      main: "#ED8B2F",
      light: "#F6B77A",
      dark: "#C46A1A",
    },
    info: {
      main: "#2C8FA3", // Teal-leaning blue
      light: "#6BB9C9",
      dark: "#1E6D7F",
    },
    success: {
      main: "#3E8E5A",
      light: "#7BC59B",
      dark: "#2F6F46",
    },
    divider: "#E6EDF3",
    action: {
      hover: "rgba(15, 42, 61, 0.06)",
      selected: "rgba(0, 167, 167, 0.10)",
      disabled: "rgba(0, 0, 0, 0.30)",
      disabledBackground: "rgba(0, 0, 0, 0.10)",
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
      main: "#162F42",
      light: "#234E6A",
      dark: "#0B1E2B",
      contrastText: "#ffffff",
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
      main: "#E28B8B",
      light: "#F0B4B4",
      dark: "#C75C5C",
    },
    warning: {
      main: "#F2A65A",
      light: "#F6C48C",
      dark: "#D47D1F",
    },
    info: {
      main: "#6FB7C9",
      light: "#9AD0DC",
      dark: "#3F8FA3",
    },
    success: {
      main: "#81C784",
      light: "#A5D6A7",
      dark: "#4F9A65",
    },
    divider: "#253342",
    action: {
      hover: "rgba(255, 255, 255, 0.06)",
      selected: "rgba(30, 202, 211, 0.12)",
      disabled: "rgba(255, 255, 255, 0.30)",
      disabledBackground: "rgba(255, 255, 255, 0.10)",
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
 * Shape configuration
 */
export const themeShape = {
  borderRadius: 8,
};

/**
 * Spacing configuration
 */
export const themeSpacing = 8;

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
            boxShadow:
              mode === "light"
                ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.20)"
                : "0 1px 3px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.45)",
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