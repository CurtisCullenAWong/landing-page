import { ThemeOptions, PaletteColorOptions } from "@mui/material/styles";

// 1. TypeScript Augmentation for custom 'tertiary' color
declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary?: PaletteColorOptions;
  }
}

// Optional: Allow components like Button or Chip to use color="tertiary"
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    tertiary: true;
  }
}

/**
 * Color palette configuration for MUI theme
 */
export const themeColors = {
  light: {
    primary: {
      main: "#00A39D", // PANTONE 3272 C
      light: "#00A796", // PANTONE 3275 U
      dark: "#007A76",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#202945", // PANTONE 533 C
      light: "#434867", // PANTONE 282 U
      dark: "#111626",
      contrastText: "#ffffff",
    },
    tertiary: {
      main: "#FCE200", // PANTONE 102 C
      light: "#FFEB2B", // PANTONE 102 U
      dark: "#C9B400",
      contrastText: "#202945", // Dark text for legibility on yellow
    },
    background: {
      default: "#ffffff",
      paper: "#F8FAFC",
    },
    text: {
      primary: "#202945",
      secondary: "#434867",
    },
    error: {
      main: "#C44E4E",
      light: "#E08A8A",
      dark: "#9F3B3B",
    },
    warning: {
      main: "#ED8B2F", // Restored original warning
      light: "#F6B77A",
      dark: "#C46A1A",
    },
    info: {
      main: "#2C8FA3",
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
      hover: "rgba(32, 41, 69, 0.06)",
      selected: "rgba(0, 163, 157, 0.10)",
      disabled: "rgba(0, 0, 0, 0.30)",
      disabledBackground: "rgba(0, 0, 0, 0.10)",
    },
  },

  dark: {
    primary: {
      main: "#00A796", // PANTONE 3275 U
      light: "#33B8AA",
      dark: "#00A39D", // PANTONE 3272 C
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#434867", // PANTONE 282 U
      light: "#6A7091",
      dark: "#202945", // PANTONE 533 C
      contrastText: "#ffffff",
    },
    tertiary: {
      main: "#FFEB2B", // PANTONE 102 U
      light: "#FFF166",
      dark: "#FCE200", // PANTONE 102 C
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
      main: "#E28B8B",
      light: "#F0B4B4",
      dark: "#C75C5C",
    },
    warning: {
      main: "#F2A65A", // Restored original warning
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
      selected: "rgba(0, 167, 150, 0.12)",
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
    "var(--font-primary)",
    "serif",
  ].join(","),

  h1: { fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em" },
  h2: { fontSize: "2rem", fontWeight: 800, lineHeight: 1.3, letterSpacing: "-0.01em" },
  h3: { fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.4 },
  h4: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.4 },
  h5: { fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.5 },
  h6: { fontSize: "1rem", fontWeight: 700, lineHeight: 1.5 },
  body1: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.6 },
  body2: { 
    fontFamily: "var(--font-secondary), sans-serif",
    fontSize: "0.875rem", 
    fontWeight: 400,
    lineHeight: 1.6 
  },
  button: { fontSize: "0.875rem", fontWeight: 600, textTransform: "none" as const },
  caption: { 
    fontFamily: "var(--font-secondary), sans-serif",
    fontSize: "0.75rem", 
    fontWeight: 400,
    lineHeight: 1.5 
  },
  overline: { 
    fontFamily: "var(--font-secondary), sans-serif",
    fontSize: "0.75rem", 
    fontWeight: 600, 
    textTransform: "uppercase" as const, 
    letterSpacing: "0.1em" 
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
      tertiary: colors.tertiary, // 2. Map tertiary into the generated palette
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
      MuiTooltip: {
        defaultProps: {
          slotProps: {
            popper: {
              sx: {
                zIndex: 12000,
              },
            },
          },
        },
      },
    },
  };
};