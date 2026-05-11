import localFont from "next/font/local";
import { ClientLayout } from "./client-layout";
import "./globals.css";
import { SITE_CONTENT } from "../constants/site-content";

const secondaryFont = localFont({
  src: [
    {
      path: "../assets/fonts/secondary/Roboto-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/secondary/Roboto-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/secondary/Roboto-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/secondary/Roboto-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-secondary",
  display: "swap",
});

const primaryFont = localFont({
  src: [
    {
      path: "../assets/fonts/primary/Montserrat-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/primary/Montserrat-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/primary/Montserrat-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/primary/Montserrat-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../assets/fonts/primary/Montserrat-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-primary",
  display: "swap",
});

export const metadata = {
  title: SITE_CONTENT.company.name,
  description: SITE_CONTENT.company.slogan,
  icons: {
    icon: '/favicon.ico',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 1. INSTANT THEME DETECTION: Prevents white flash in dark mode */}
        <script
          id="theme-detection"
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
      <body className={`${secondaryFont.variable} ${primaryFont.variable} ${primaryFont.className} antialiased`} suppressHydrationWarning>
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

        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
