"use client";

import { Geist } from "next/font/google";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { JobProvider } from "@/contexts/JobContext";
import "./globals.css";
import { Suspense } from 'react';
import { Box, CircularProgress } from "@mui/material";
import { MuiThemeProviderWrapper } from "@/components/mui-theme-provider";
import { Footer } from "@/components/layout";
import { Header } from "@/components/header";

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <NextThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MuiThemeProviderWrapper>
            <JobProvider>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Suspense fallback={
                  <Box 
                    component="header"
                    className="bg-background border-b border-border shadow-md sticky top-0 z-50"
                    sx={{ 
                      height: 64,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                }>
                  <Header />
                </Suspense>
                <Box component="main" sx={{ flexGrow: 1 }}>
                  <Suspense fallback={
                    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress size={48} />
                    </Box>
                  }>
                    {children}
                  </Suspense>
                </Box>
                <Footer />
              </Box>
            </JobProvider>
          </MuiThemeProviderWrapper>
        </NextThemeProvider>
      </body>
    </html>
  );
}
