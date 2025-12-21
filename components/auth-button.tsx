'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return <Button onClick={logout} variant="outlined">Logout</Button>;
}

export function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, justifyContent: "center" }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  return user ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      Hey, {user.email}!
      <LogoutButton />
    </Box>
  ) : (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button component={Link} href="/auth/login" size="small" variant="outlined">
        Sign in
      </Button>
      <Button component={Link} href="/auth/sign-up" size="small" variant="contained">
        Sign up
      </Button>
    </Box>
  );
}

export function AuthButtonWithSuspense() {
  return (
    <Suspense fallback={
      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, justifyContent: "center" }}>
        <CircularProgress size={20} />
      </Box>
    }>
      <AuthButton />
    </Suspense>
  );
}

