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
import { AvatarOverlay } from "@/components/chat/AvatarOverlay";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSequencePage = ['/', '/home', '/about-us', '/why-us', '/history', '/partnerships', '/careers'].includes(pathname);

  const [isChatOpen, setIsChatOpen] = useState(false);

  // Handle scroll-lock-active class on html tag
  useEffect(() => {
    if (isSequencePage) {
      document.documentElement.classList.add('scroll-lock-active');
    } else {
      document.documentElement.classList.remove('scroll-lock-active');
    }
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
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </Box>

          {isSequencePage && (
            <>
              <ChatWidget isOpen={isChatOpen} onToggle={setIsChatOpen} />
              {isChatOpen && <AvatarOverlay />}
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
