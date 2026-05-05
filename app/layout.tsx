"use client";

import { Suspense } from "react";
import { Geist } from "next/font/google";
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
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isSequencePage = pathname === '/' || pathname === '/about-us' || pathname === '/why-us' || pathname === '/history' || pathname === '/partnerships' || pathname === '/careers';

  return (
    <html lang="en" suppressHydrationWarning className={isSequencePage ? 'scroll-lock-active' : ''}>
      <head>
        {/* 1. INSTANT THEME DETECTION: Prevents white flash in dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  document.documentElement.classList.toggle('dark', isDark);
                  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* 2. CRITICAL CSS: Renders the splash screen instantly */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { 
                --splash-bg: #ffffff; 
                --splash-text: #1a1a1a; 
                --brand-color: #008080; 
                --primary-color: #00A7A7;
              }
              .dark { 
                --splash-bg: #0a0c10; 
                --splash-text: #f0f0f0; 
                --brand-color: #00ced1; 
                --primary-color: #1ECAD3;
              }

              #initial-loader {
                position: fixed;
                inset: 0;
                background-color: var(--splash-bg);
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: opacity 0.5s ease-in-out;
                pointer-events: none;
              }

              #initial-loader.fade-out {
                opacity: 0;
                pointer-events: none;
              }

              #initial-loader.hidden {
                display: none;
                pointer-events: none;
              }

              #initial-loader .favicon-loader {
                width: 256px;
                height: 256px;
                animation: spin 1s linear infinite;
                background-color: var(--primary-color);
                border-radius: 50%;
                padding: 16px;
                box-sizing: border-box;
              }

              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `,
          }}
        />
      </head>
      <body className={`${geistSans.className} antialiased`} suppressHydrationWarning>
        {/* 3. Create splash screen immediately - outside React tree to avoid hydration issues */}
        <div
          id="initial-loader"
          suppressHydrationWarning
          style={{ pointerEvents: 'none' }}
        >
          <img
            src="/favicon.ico"
            alt="Loading"
            className="favicon-loader"
          />
        </div>

        <NextThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MuiThemeProviderWrapper>
            <JobProvider>
              {/* 4. THE MANAGER: Handles the exit of the loader above */}
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
      </body>
    </html>
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
