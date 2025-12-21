"use client";

import { useEffect } from 'react';

/**
 * Simple splash screen that shows for 3 seconds minimum,
 * then fades out when render is complete.
 */
export function SplashScreen() {
  useEffect(() => {
    const loader = document.getElementById('initial-loader');
    if (!loader) return;

    // Ensure navigation works immediately
    loader.style.pointerEvents = 'none';

    const minDisplayTime = 1000; // 1 second minimum
    const transitionTime = 500; // CSS transition duration
    const startTime = Date.now();
    let fadeOutTimer: NodeJS.Timeout | null = null;
    let hideTimer: NodeJS.Timeout | null = null;

    // Function to fade out the splash screen
    const fadeOut = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsed);

      fadeOutTimer = setTimeout(() => {
        loader.classList.add('fade-out');

        hideTimer = setTimeout(() => {
          loader.classList.add('hidden');
        }, transitionTime);
      }, remainingTime);
    };

    // Wait for render to complete (window load event)
    if (document.readyState === 'complete') {
      fadeOut();
    } else {
      window.addEventListener('load', fadeOut, { once: true });
    }

    return () => {
      if (fadeOutTimer) clearTimeout(fadeOutTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  return null;
}