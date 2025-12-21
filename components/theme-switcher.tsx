"use client";

import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    handleClose();
  };

  const getIcon = () => {
    const currentTheme = resolvedTheme || theme;
    if (currentTheme === "light") {
      return <Sun size={ICON_SIZE} />;
    } else if (currentTheme === "dark") {
      return <Moon size={ICON_SIZE} />;
    } else {
      return <Laptop size={ICON_SIZE} />;
    }
  };

  const getTooltipTitle = () => {
    if (theme === "light") return "Switch to dark mode";
    if (theme === "dark") return "Switch to light mode";
    return "Switch theme";
  };

  return (
    <>
      <Tooltip title={getTooltipTitle()} arrow>
        <IconButton 
          onClick={handleClick} 
          size="small"
          aria-label="Toggle theme"
          sx={{
            // CHANGED: Force color to white to be visible on Primary background
            color: "white", 
            "&:hover": {
              // CHANGED: Subtle white overlay for hover effect
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            },
          }}
        >
          {getIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 150,
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <MenuItem 
          onClick={() => handleThemeChange("light")} 
          selected={theme === "light"}
        >
          <ListItemIcon>
            <Sun size={ICON_SIZE} />
          </ListItemIcon>
          <ListItemText>Light</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleThemeChange("dark")} 
          selected={theme === "dark"}
        >
          <ListItemIcon>
            <Moon size={ICON_SIZE} />
          </ListItemIcon>
          <ListItemText>Dark</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleThemeChange("system")} 
          selected={theme === "system"}
        >
          <ListItemIcon>
            <Laptop size={ICON_SIZE} />
          </ListItemIcon>
          <ListItemText>System</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export { ThemeSwitcher };