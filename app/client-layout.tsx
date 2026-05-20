'use client';

import { Suspense } from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { JobProvider } from "@/contexts/JobContext";
import { MuiThemeProviderWrapper } from "@/components/mui-theme-provider";
import { Footer } from "@/components/layout";
import { ConditionalHeader } from "@/components/layout/ConditionalHeader";
import { HeaderSkeleton } from "@/components/loading";
import { SplashScreen } from "@/components/splash-screen";
import dynamic from "next/dynamic";
import { Box, useMediaQuery, useTheme, Fab, Tooltip } from "@mui/material";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTrackPageView } from "@/hooks/use-track-page-view";
import { cleanupAllClients } from '@/lib/supabase/client';

// Dynamic imports for heavy components
const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget").then(mod => mod.ChatWidget), {
  ssr: false,
});

const AvatarOverlay = dynamic(() => import("@/components/chat/AvatarOverlay").then(mod => mod.AvatarOverlay), {
  ssr: false,
});

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isSequencePage = ['/', '/home', '/about-us', '/why-us', '/history', '/partnerships', '/careers'].includes(pathname);
  const showGlobalFooter = pathname !== '/careers';

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasOpenedChat, setHasOpenedChat] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [mounted, setMounted] = useState(false);

  // Set hasOpenedChat to true once isChatOpen becomes true
  useEffect(() => {
    if (isChatOpen) {
      setHasOpenedChat(true);
    }
  }, [isChatOpen]);

  // Track page views for analytics
  useTrackPageView();

  useEffect(() => {
    const _warn = console.warn.bind(console);
    console.warn = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return;
      _warn(...args);
    };

    return () => {
      console.warn = _warn;
    };
  }, []);

  // Handle scroll-lock-active class on html tag
  useEffect(() => {
    setMounted(true);

    if (isSequencePage) {
      document.documentElement.classList.add('scroll-lock-active');
    } else {
      document.documentElement.classList.remove('scroll-lock-active');
    }

    // Reset scroll position on route change
    // We use a small timeout to ensure the layout has updated and scroll-lock is removed
    const timer = setTimeout(() => {
      // Don't auto-scroll to top if we have a hash on the home page (let HomePage handle it)
      if (!window.location.hash || pathname !== '/') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [isSequencePage, pathname]);

  // When leaving sequence pages, ensure any Supabase realtime channels are cleaned up.
  useEffect(() => {
    if (!isSequencePage) {
      try {
        cleanupAllClients();
      } catch (e) {}
    }
    return () => {
      // Also cleanup on unmount
      try {
        cleanupAllClients();
      } catch (e) {}
    };
  }, [isSequencePage]);

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MuiThemeProviderWrapper>
        <JobProvider>
          {/* THE MANAGER: Handles the exit of the initial loader */}
          <SplashScreen />

          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Suspense fallback={<HeaderSkeleton />}>
              <ConditionalHeader />
            </Suspense>
            <Suspense fallback={<Box sx={{ flexGrow: 1, minHeight: '100vh' }}>{children}</Box>}>
              <MainContainer>
                {children}
              </MainContainer>
            </Suspense>
            {showGlobalFooter && (
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
            )}
          </Box>

          {mounted && isSequencePage && (
            <>
              {hasOpenedChat ? (
                <>
                  <ChatWidget
                    isOpen={isChatOpen}
                    onToggle={setIsChatOpen}
                    gender={gender}
                    onGenderToggle={() => setGender(prev => prev === 'male' ? 'female' : 'male')}
                  />
                  <AvatarOverlay
                    gender={gender}
                    isVisible={isChatOpen && isSequencePage}
                  />
                </>
              ) : (
                <Box
                  sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 11000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 1.5,
                  }}
                >
                  <Tooltip title="Chat with Boss AI" placement="top">
                    <span>
                      <Fab
                        color="primary"
                        aria-label="chat"
                        onClick={() => setIsChatOpen(true)}
                        sx={{
                          width: 56,
                          height: 56,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                          },
                        }}
                      >
                        <MessageCircle />
                      </Fab>
                    </span>
                  </Tooltip>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      opacity: 0.4,
                      zIndex: -1,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': {
                          transform: 'scale(1)',
                          opacity: 0.4,
                        },
                        '70%': {
                          transform: 'scale(1.5)',
                          opacity: 0,
                        },
                        '100%': {
                          transform: 'scale(1.5)',
                          opacity: 0,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}

        </JobProvider>
      </MuiThemeProviderWrapper>
    </NextThemeProvider>
  );
}

function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        scrollSnapAlign: pathname === '/' ? 'start' : 'none',
        minHeight: '100vh',
        pt: pathname === '/' ? 0 : '80px',
        overflowX: 'hidden',
      }}
      data-initial-module="true"
      data-href={pathname}
      suppressHydrationWarning
    >
      {children}
    </Box>
  );
}
