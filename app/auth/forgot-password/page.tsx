"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { usePageTitle } from "@/lib/usePageTitle";

export default function Page() {
  usePageTitle('Forgot Password');
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {success ? (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Check Your Email
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Password reset instructions sent
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If you registered using your email and password, you will receive
                a password reset email.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Reset Your Password
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Type in your email and we&apos;ll send you a link to reset your
                password
              </Typography>
              <form onSubmit={handleForgotPassword}>
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
                  {error && (
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  )}
                  <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send reset email"}
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
        )}
      </div>
    </div>
  );
}
