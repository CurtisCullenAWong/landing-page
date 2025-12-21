'use client';

import { useState, useEffect } from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <Button 
      onClick={logout} 
      variant="outlined" 
      size="small"
      sx={{
        color: 'primary.contrastText',
        borderColor: 'primary.contrastText',
        '&:hover': {
          borderColor: 'primary.contrastText',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }
      }}
    >
      Logout
    </Button>
  );
}

export function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120, justifyContent: 'center' }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  return user ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <span style={{ color: 'white' }}>Hey, {user.email}!</span>
      <LogoutButton />
    </Box>
  ) : (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button 
        component={Link} 
        href="/auth/login" 
        size="small" 
        variant="outlined"
        sx={{
          color: 'primary.contrastText',
          borderColor: 'primary.contrastText',
          '&:hover': {
            borderColor: 'primary.contrastText',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        Sign in
      </Button>
    </Box>
  );
}