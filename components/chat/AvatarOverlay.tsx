'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

// Abstract squiggly paths for morphing - more organic and abstract
const SQUIGGLY_PATHS = [
  "M47.5,-63.2C61.4,-52.9,72.5,-37.7,76.1,-21.1C79.7,-4.5,75.8,13.5,67.3,29.4C58.8,45.3,45.7,59.1,30,66.4C14.3,73.7,-4.1,74.5,-21.4,69.5C-38.7,64.5,-55,53.7,-64.1,38.8C-73.2,23.9,-75.1,4.9,-70.6,-12.6C-66.1,-30.1,-55.2,-46.1,-41.1,-56.4C-27,-66.7,-9.6,-71.3,4.4,-77.3C18.4,-83.4,33.6,-73.5,47.5,-63.2Z",
  "M40.3,-58.5C52.4,-51.2,62.5,-40,68.8,-26.8C75.1,-13.6,77.6,1.6,74.1,15.1C70.6,28.6,61.1,40.4,49.2,49.1C37.3,57.8,23,63.4,8.5,64.2C-6,65,-20.7,61.1,-33.5,53.4C-46.3,45.7,-57.2,34.2,-63.1,20.5C-69,6.8,-69.9,-9.1,-65,-23.4C-60.1,-37.7,-49.4,-50.4,-36.8,-57.5C-24.2,-64.6,-9.7,-66.1,2.8,-69.9C15.3,-73.7,28.2,-65.8,40.3,-58.5Z",
  "M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-46.5C87.4,-33.8,90,-18.4,89.1,-3.5C88.2,11.4,83.7,25.9,76,38.5C68.3,51.1,57.3,61.8,44.2,69.5C31.1,77.2,15.5,81.9,0.4,81.2C-14.7,80.5,-29.4,74.3,-42.1,65.8C-54.8,57.3,-65.5,46.5,-73.2,33.8C-80.9,21.1,-85.7,6.5,-84.9,-7.7C-84.1,-21.9,-77.7,-35.7,-68.8,-47.4C-59.9,-59.1,-48.5,-68.7,-35.9,-76.7C-23.3,-84.7,-9.4,-91.1,3.4,-97C16.2,-102.9,30.5,-103.6,44.7,-76.4Z",
  "M38.1,-65.2C49.1,-58.4,57.6,-47.6,63.1,-35.6C68.6,-23.6,71.1,-10.4,70.6,2.6C70.1,15.6,66.6,28.4,59,38.7C51.4,49,39.7,56.8,27.1,61.6C14.5,66.4,1,68.2,-12.3,66.4C-25.6,64.6,-38.7,59.2,-49.4,50.1C-60.1,41,-68.4,28.2,-72.1,14.1C-75.8,0,-74.9,-15.4,-68.6,-28.6C-62.3,-41.8,-50.6,-52.8,-37.8,-58.9C-25,-65,-11.1,-66.2,1.8,-68.8C14.7,-71.4,27.1,-72,38.1,-65.2Z",
  "M43.2,-72.1C55.6,-65.4,65.1,-53.1,71.2,-39.4C77.3,-25.7,80,-10.6,78.7,4C77.4,18.6,72.1,32.7,63.4,44.2C54.7,55.7,42.6,64.6,29,69.5C15.4,74.4,0.3,75.3,-14.8,72.3C-29.9,69.3,-45,62.3,-56.8,51.6C-68.6,40.9,-77.1,26.5,-80.4,11.2C-83.7,-4.1,-81.8,-20.3,-74.5,-34.5C-67.2,-48.7,-54.5,-60.9,-40.5,-67.2C-26.5,-73.5,-11.2,-73.9,2,-77.2C15.2,-80.5,29.8,-83.4,43.2,-72.1Z",
  "M40.8,-68.1C52.6,-61.1,61.7,-48.7,67.6,-35.1C73.5,-21.5,76.2,-6.7,74.9,7.6C73.6,21.9,68.3,35.7,59.5,46.8C50.7,57.9,38.4,66.3,24.8,70.5C11.2,74.7,-3.7,74.7,-18.2,71.1C-32.7,67.5,-46.8,60.3,-57.8,49.8C-68.8,39.3,-76.7,25.5,-79.8,10.6C-82.9,-4.3,-81.2,-20.3,-74,-34.2C-66.8,-48.1,-54.1,-59.9,-39.9,-66.4C-25.7,-72.9,-10,-74.1,3.4,-79.6C16.8,-85.1,31.6,-83.9,40.8,-68.1Z"
];

// POSITIONS optimized to bias left side and top/middle right - reduce teleporting
// Using bottom/right prevents edge clipping on fixed positioning
const POSITIONS = [
  { bottom: '12px', left: '12px', top: 'auto', right: 'auto' },    // Bottom Left
  { top: '50%', left: '12px', bottom: 'auto', right: 'auto', transform: 'translateY(-50%)' },  // Middle Left
  { top: '30%', left: '12px', bottom: 'auto', right: 'auto' },     // Upper Middle Left
  { top: '12px', left: '12px', bottom: 'auto', right: 'auto' },    // Top Left
  { top: '12px', right: '12px', bottom: 'auto', left: 'auto' },    // Top Right
  { top: '35%', right: '12px', bottom: 'auto', left: 'auto' }      // Upper Middle Right
];

// Broad selector to capture page sections AND internal slides
const SECTION_SELECTOR = '[id], section, [role="region"], [style*="scroll-snap-align"]';

const THROTTLE_DELAY = 16; // ~60fps for responsive scroll tracking
const SCROLL_END_DEBOUNCE = 120; // ms after which scrolling is considered finished

export const AvatarOverlay = () => {
  const theme = useTheme();
  
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const lastSectionRef = useRef<Element | null>(null);
  const lastScrollTimeRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollEndTimeoutRef = useRef<number | null>(null);

  // Defensive theme extraction
  const colors = useMemo(() => [
    theme.palette.primary.main,
    (theme.palette as any).tertiary?.main || theme.palette.primary.light,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.success.main,
  ], [theme]);

  // Derived deterministic values
  const currentPath = SQUIGGLY_PATHS[activeSectionIndex % SQUIGGLY_PATHS.length];
  const currentColor = colors[activeSectionIndex % colors.length];
  const nextColor = colors[(activeSectionIndex + 1) % colors.length];
  const currentPos = POSITIONS[activeSectionIndex % POSITIONS.length];
  
  // Throttled scroll handler - smoother position mapping
  const handleScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastScrollTimeRef.current < THROTTLE_DELAY) return;
    lastScrollTimeRef.current = now;
    isScrollingRef.current = true;

    // Clear existing debounce and schedule scroll-end detection
    if (scrollEndTimeoutRef.current) window.clearTimeout(scrollEndTimeoutRef.current);
    scrollEndTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      scrollEndTimeoutRef.current = null;
    }, SCROLL_END_DEBOUNCE);

    // Determine which section is nearest to viewport center for consistent per-section triggering
    const allCandidateSections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
    if (allCandidateSections.length === 0) return;

    const viewportCenter = window.scrollY + window.innerHeight / 2;
    let bestIndex = 0;
    let bestDist = Infinity;
    allCandidateSections.forEach((el, idx) => {
      const rect = (el as Element).getBoundingClientRect();
      const elCenter = window.scrollY + rect.top + rect.height / 2;
      const dist = Math.abs(elCenter - viewportCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = idx;
      }
    });

    setActiveSectionIndex(bestIndex);
  }, []);

  // Intersection Observer for scroll detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Only update from intersection if not actively scrolling
        if (isScrollingRef.current) return;

        // Find all intersecting elements and pick the most visible one
        const intersecting = entries.filter(e => e.isIntersecting);

        if (intersecting.length > 0) {
          const topEntry = intersecting.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          const target = topEntry.target;

          if (target !== lastSectionRef.current) {
            lastSectionRef.current = target;

            const allCandidateSections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
            const index = allCandidateSections.indexOf(target);

            if (index !== -1) {
              setActiveSectionIndex(index);
            }
          }
        }
      },
      { threshold: [0.35, 0.5, 0.75], rootMargin: '0px 0px -40% 0px' }
    );

    const sections = document.querySelectorAll(SECTION_SELECTOR);
    sections.forEach((section) => observer.observe(section));

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <motion.div
      animate={{
        top: currentPos.top,
        left: currentPos.left,
        bottom: currentPos.bottom,
        right: currentPos.right,
      }}
      transition={{
        duration: 1.0,
        ease: [0.22, 1, 0.36, 1] // Custom quintic ease-out for premium feel
      }}
      style={{
        position: 'fixed',
        zIndex: 10000,
        width: 240,
        height: 240,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'opacity',
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Glow effect background - breathing pulse */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1.15, 1.05, 1],
            opacity: [0.15, 0.4, 0.6, 0.35, 0.15],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            inset: 10,
            background: `radial-gradient(circle, ${currentColor}66 0%, transparent 70%)`,
            filter: 'blur(20px)',
            zIndex: -1,
            willChange: 'transform, opacity',
          }}
        />

        {/* Squiggly Morphing Shape - with subtle floating */}
        <motion.svg
          animate={{
            y: [0, -4, 2, -2, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          viewBox="0 0 300 300"
          xmlns="http://www.w3.org/2000/svg"
          style={{ 
            width: '120%', 
            height: '120%', 
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))',
            transform: 'scale(1.2)',
            willChange: 'transform'
          }}
        >
          <defs>
            <linearGradient id="squiggly-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop
                offset="0%"
                animate={{ stopColor: currentColor }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.stop
                offset="100%"
                animate={{ stopColor: nextColor }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </linearGradient>
          </defs>
          <motion.path
            initial={false}
            animate={{
              d: currentPath,
              fill: `url(#squiggly-gradient)`,
            }}
            transition={{
              d: { duration: 1.5, ease: [0.22, 1, 0.36, 1] },
              fill: { duration: 1.5, ease: "easeInOut" }
            }}
            transform="translate(150 150)"
            style={{ 
              opacity: 0.95,
              stroke: 'none',
            }}
          />
          {/* Ensure central avatar area remains filled even if blob morphs away */}
          <motion.circle
            cx={150}
            cy={150}
            r={54}
            animate={{ r: [54, 58, 52, 54], opacity: [0.95, 0.98, 0.95] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            fill="url(#squiggly-gradient)"
            style={{ pointerEvents: 'none' }}
          />
        </motion.svg>

        {/* Future Avatar Space Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '58%',
            height: '58%',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <motion.div
            animate={{
              scale: [0.96, 1.04, 1.02, 0.98, 0.96],
              rotate: [0, 8, -6, 4, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: '90%',
              height: '90%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: 'inset 0 0 15px rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              willChange: 'transform'
            }}
          >
            <motion.div 
               animate={{ 
                 opacity: [0.1, 0.5, 0.3, 0.6, 0.1],
                 scale: [0.9, 1.05, 1.0, 1.1, 0.9]
               }}
               transition={{ 
                 duration: 3.5, 
                 repeat: Infinity,
                 ease: "easeInOut"
               }}
               style={{
                 width: '35%',
                 height: '35%',
                 borderRadius: '50%',
                 border: '1px solid rgba(255,255,255,0.2)',
                 boxShadow: '0 0 8px rgba(255,255,255,0.3)',
                 willChange: 'transform, opacity'
               }}
            />
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
};
