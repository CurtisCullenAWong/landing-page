"use client";

import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { usePageTitle } from "@/lib/usePageTitle";

export default function Page() {
  usePageTitle('Sign Up Success');
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Thank you for signing up!
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Check your email to confirm
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
