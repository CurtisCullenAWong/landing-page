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
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTrackPageView } from "@/hooks/use-track-page-view";

// Dynamic imports for heavy components
const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget").then(mod => mod.ChatWidget), {
  ssr: false,
});

const AvatarOverlay = dynamic(() => import("@/components/chat/AvatarOverlay").then(mod => mod.AvatarOverlay), {
  ssr: false,
});

// Pre-loading triggers for background loading
const preloadChatComponents = () => {
  import("@/components/chat/ChatWidget");
  import("@/components/chat/AvatarOverlay");
};

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isSequencePage = ['/', '/home', '/about-us', '/why-us', '/history', '/partnerships', '/careers'].includes(pathname);
  const showGlobalFooter = pathname !== '/careers';

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [mounted, setMounted] = useState(false);

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

    // Background pre-load chat components after initial mount
    // This fetches the chunks in the background without blocking the main render
    if (typeof window !== 'undefined') {
      const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1000));
      idleCallback(() => {
        preloadChatComponents();
      });
    }

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

          {mounted && isSequencePage && isDesktop && (
            <>
              <ChatWidget
                isOpen={isChatOpen}
                onToggle={setIsChatOpen}
                gender={gender}
                onGenderToggle={() => setGender(prev => prev === 'female' ? 'male' : 'female')}
              />
              <AvatarOverlay
                gender={gender}
                isVisible={isChatOpen && isSequencePage}
              />
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
        pt: pathname === '/' ? 0 : '80px'
      }}
      data-initial-module="true"
      data-href={pathname}
      suppressHydrationWarning
    >
      {children}
    </Box>
  );
}
