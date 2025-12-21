"use client";

import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <IconButton size="small" disabled>
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
            color: "text.primary",
            "&:hover": {
              backgroundColor: "action.hover",
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

