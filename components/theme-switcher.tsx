"use client";

import { IconButton, Tooltip } from "@mui/material";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <IconButton size="small" disabled sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
        <Sun size={16} />
      </IconButton>
    );
  }

  const ICON_SIZE = 18;

  // Use actual `theme` (light | dark | system) to determine icon
  const getIcon = () => {
    if (theme === "light") return <Sun size={ICON_SIZE} />;
    if (theme === "dark") return <Moon size={ICON_SIZE} />;
    return <Laptop size={ICON_SIZE} />; // system
  };

  // Tooltip shows the next theme in the cycle
  const getTooltipTitle = () => {
    if (theme === "light") return "Switch to dark mode";
    if (theme === "dark") return "Switch to system mode";
    return "Switch to light mode"; // system
  };

  // Cycle themes: light → dark → system → light
  const handleCycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light"); // system
  };

  return (
    <Tooltip title={getTooltipTitle()} arrow>
      <IconButton
        onClick={handleCycleTheme}
        size="small"
        aria-label="Toggle theme"
        sx={{
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          },
        }}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;