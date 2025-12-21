"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePageTitle } from "@/lib/usePageTitle";

// Toggle this to enable/disable the Sign Up page
const SIGN_UP_ENABLED = false;

export default function Page() {
  if (!SIGN_UP_ENABLED) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Typography variant="h5" color="text.secondary">
          Sign Up is currently disabled.
        </Typography>
      </div>
    );
  }

  usePageTitle('Sign Up');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Sign up
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Create a new account
            </Typography>
            <form onSubmit={handleSignUp}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                <TextField
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  id="repeat-password"
                  label="Repeat Password"
                  type={showRepeatPassword ? "text" : "password"}
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                          edge="end"
                        >
                          {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {error && (
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                )}
                <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
                  {isLoading ? "Creating an account..." : "Sign up"}
                </Button>
              </Box>
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body2">
                  Already have an account?{" "}
                  <Link href="/auth/login" style={{ textDecoration: "underline" }}>
                    Login
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
