'use client';

import { Suspense } from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { JobProvider } from "@/contexts/JobContext";
import { MuiThemeProviderWrapper } from "@/components/mui-theme-provider";
import { Footer } from "@/components/layout";
import { ConditionalHeader } from "@/components/layout/ConditionalHeader";
import { HeaderSkeleton } from "@/components/loading";
import { SplashScreen } from "@/components/splash-screen";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Handle scroll-lock-active class on html tag
  useEffect(() => {
    const isSequencePage = pathname === '/' || pathname === '/about-us' || pathname === '/why-us' || pathname === '/history' || pathname === '/partnerships' || pathname === '/careers';
    if (isSequencePage) {
      document.documentElement.classList.add('scroll-lock-active');
    } else {
      document.documentElement.classList.remove('scroll-lock-active');
    }
  }, [pathname]);

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
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </Box>

          <ChatWidget />
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
        minHeight: '100vh'
      }}
      data-initial-module="true"
      data-href={pathname}
      suppressHydrationWarning
    >
      {children}
    </Box>
  );
}
