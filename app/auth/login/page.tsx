"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined, EmailOutlined } from "@mui/icons-material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { usePageTitle } from "@/lib/usePageTitle";
import { Container, useTheme, Alert, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { INPUT_LIMITS } from "@/lib/input-utils";
import { AccountCircleOutlined } from "@mui/icons-material";


// Shared "Corner Brackets" component for architectural emphasis
const CornerBrackets = ({ color, size = 24, radius = 16 }: { color: string, size?: number, radius?: number }) => (
  <>
    <Box sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: size,
      height: size,
      borderTop: `3px solid ${color}`,
      borderLeft: `3px solid ${color}`,
      borderTopLeftRadius: radius,
      zIndex: 2
    }} />
    <Box sx={{
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: size,
      height: size,
      borderBottom: `3px solid ${color}`,
      borderRight: `3px solid ${color}`,
      borderBottomRightRadius: radius,
      zIndex: 2
    }} />
  </>
);


export default function Page() {
  usePageTitle('Login');
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/admin';

  // Determine if input looks like an email
  const isEmail = identifier.includes('@');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      let loginEmail = identifier.trim();

      // If input has no '@', treat it as a username and look up the email
      if (!loginEmail.includes('@')) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('full_name', loginEmail)
          .maybeSingle();

        if (profileError) throw new Error('Error looking up username.');
        if (!profileData?.email) {
          throw new Error('No account found with that username.');
        }
        loginEmail = profileData.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      if (error) throw error;
      router.push(redirectTo);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryMain = theme.palette.primary.main;
  const tertiaryMain = (theme.palette as any).tertiary?.main || '#FCE200';

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: isDark ? 'background.default' : '#f5f5f5',
      background: isDark 
        ? `radial-gradient(circle at 20% 20%, ${alpha(primaryMain, 0.05)} 0%, transparent 40%), radial-gradient(circle at 80% 80%, ${alpha(primaryMain, 0.05)} 0%, transparent 40%)`
        : `radial-gradient(circle at 20% 20%, ${alpha(primaryMain, 0.03)} 0%, transparent 40%), radial-gradient(circle at 80% 80%, ${alpha(primaryMain, 0.03)} 0%, transparent 40%)`,
      p: 3
    }}>
      <Container maxWidth="sm">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ 
            fontWeight: 900, 
            mb: 1, 
            letterSpacing: -2, 
            textTransform: 'uppercase', 
            color: primaryMain,
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}>
            Boss Cargo
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, letterSpacing: 1, textTransform: 'uppercase' }}>
            Administrative Portal
          </Typography>
        </Box>

        <Card sx={{ 
          position: 'relative', 
          boxShadow: 24, 
          borderRadius: 4, 
          overflow: 'visible',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backdropFilter: 'blur(10px)',
          bgcolor: alpha(theme.palette.background.paper, 0.8)
        }}>
          <CornerBrackets color={tertiaryMain} radius={32} size={40} />
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: -1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
              Please enter your credentials to access the management dashboard.
            </Typography>

            <form onSubmit={handleLogin}>
              <Stack spacing={4}>
                <TextField
                  label={isEmail ? "Email Address" : "Email or Username"}
                  type="text"
                  placeholder="admin@bosscargo.com or your username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  fullWidth
                  variant="outlined"
                  inputProps={{ maxLength: INPUT_LIMITS.EMAIL }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isEmail
                          ? <EmailOutlined sx={{ color: primaryMain }} />
                          : <AccountCircleOutlined sx={{ color: primaryMain }} />}
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 }
                  }}
                />
                
                <Box>
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    variant="outlined"
                    inputProps={{ maxLength: 100 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: primaryMain }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: 'text.secondary' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 3 }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                    <Link
                      href="/auth/forgot-password"
                      style={{ 
                        fontSize: "0.875rem", 
                        color: primaryMain, 
                        textDecoration: "none",
                        fontWeight: 700 
                      }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  fullWidth 
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LockOutlined />}
                  sx={{ 
                    py: 2, 
                    borderRadius: 3, 
                    fontWeight: 800, 
                    fontSize: '1rem',
                    boxShadow: `0 8px 16px ${alpha(primaryMain, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 12px 20px ${alpha(primaryMain, 0.4)}`,
                    }
                  }}
                >
                  {isLoading ? "Authenticating..." : "Authorize Access"}
                </Button>
              </Stack>

              {/* <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Unauthorized access is strictly prohibited.{" "}
                  <Link href="/auth/sign-up" style={{ color: primaryMain, fontWeight: 700, textDecoration: 'none' }}>
                    Request Access
                  </Link>
                </Typography>
              </Box> */}
            </form>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.disabled" sx={{ mt: 4, display: 'block', textAlign: 'center', fontWeight: 600 }}>
          © {new Date().getFullYear()} Boss Cargo Express Business Technology Department. All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  );
}

