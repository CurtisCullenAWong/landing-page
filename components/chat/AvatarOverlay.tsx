'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Float, PerspectiveCamera, Stage, Center, useAnimations } from '@react-three/drei';

// Component to load and display the 3D Avatar
// Component to load and display the 3D Avatar with animations
const AvatarModel = ({ sectionIndex }: { sectionIndex: number }) => {
  const { scene, animations } = useGLTF('/models/avatar.glb');
  const { actions, names } = useAnimations(animations, scene);

  const currentActionNameRef = useRef<string | null>(null);

  // Play animation based on section index
  useEffect(() => {
    if (names.length === 0) return;

    // Filter for dance animations if possible, otherwise use all
    const danceAnimations = names.filter(n =>
      n.toLowerCase().includes('dance') ||
      n.toLowerCase().includes('mixamo') ||
      n.toLowerCase().includes('move')
    );

    const pool = danceAnimations.length > 0 ? danceAnimations : names;
    const animationName = pool[sectionIndex % pool.length];

    // If the animation is already playing, don't restart it (prevents flicker)
    if (currentActionNameRef.current === animationName) return;

    const nextAction = actions[animationName];
    const prevActionName = currentActionNameRef.current;
    const prevAction = prevActionName ? actions[prevActionName] : null;

    if (nextAction) {
      // Ensure the next action is enabled and has weight 1
      nextAction.enabled = true;
      nextAction.setEffectiveTimeScale(1);
      nextAction.setEffectiveWeight(1);

      if (prevAction && prevAction !== nextAction) {
        // Crossfade from the previous animation
        nextAction.reset().play();
        prevAction.crossFadeTo(nextAction, 0.5, true);
      } else {
        // Just fade in if there's no previous animation
        nextAction.reset().fadeIn(0.5).play();
      }

      currentActionNameRef.current = animationName;
    }

    return () => {
      // No need to fade out here if we manage it with currentActionNameRef
      // but we should fade out on unmount if needed.
    };
  }, [sectionIndex, actions, names]);

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.3}
      floatingRange={[-0.05, 0.05]}
    >
      <primitive
        object={scene}
      />
    </Float>
  );
};

// Abstract squiggly paths for morphing - more organic and abstract
const SQUIGGLY_PATHS = [
  "M0,-100C27.6,-100,55.2,-91.1,75.9,-75.9C96.6,-60.7,110.3,-39.2,110.3,-17.7C110.3,3.8,96.6,25.3,75.9,40.5C55.2,55.7,27.6,64.6,0,64.6C-27.6,64.6,-55.2,55.7,-75.9,40.5C-96.6,25.3,-110.3,3.8,-110.3,-17.7C-110.3,-39.2,-96.6,-60.7,-75.9,-75.9C-55.2,-91.1,-27.6,-100,0,-100Z",
  "M0,-95C26,-95,48.2,-80.4,66.6,-66.6C85,-52.8,99.6,-39.8,99.6,-26.8C99.6,-13.8,85,0.8,66.6,14.6C48.2,28.4,26,41.4,0,41.4C-26,41.4,-48.2,28.4,-66.6,14.6C-85,0.8,-99.6,-13.8,-99.6,-26.8C-99.6,-39.8,-85,-52.8,-66.6,-66.6C-48.2,-80.4,-26,-95,0,-95Z",
  "M0,-110C30.4,-110,54.8,-88.9,74,-74C93.2,-59.1,107.2,-50.4,107.2,-41.7C107.2,-33,93.2,-24.3,74,-9.4C54.8,5.5,30.4,26.6,0,26.6C-30.4,26.6,-54.8,5.5,-74,-9.4C-93.2,-24.3,-107.2,-33,-107.2,-41.7C-107.2,-50.4,-93.2,-59.1,-74,-74C-54.8,-88.9,-30.4,-110,0,-110Z",
  "M0,-85C23.5,-85,47,-76.3,64.3,-64.3C81.6,-52.3,92.7,-37,92.7,-21.7C92.7,-6.4,81.6,8.9,64.3,20.9C47,32.9,23.5,41.6,0,41.6C-23.5,41.6,-47,32.9,-64.3,20.9C-81.6,8.9,-92.7,-6.4,-92.7,-21.7C-92.7,-37,-81.6,-52.3,-64.3,-64.3C-47,-76.3,-23.5,-85,0,-85Z",
  "M0,-105C29,-105,58,-93.2,77.1,-77.1C96.2,-61,105.4,-40.6,105.4,-20.2C105.4,0.2,96.2,20.6,77.1,36.7C58,52.8,29,64.6,0,64.6C-29,64.6,-58,52.8,-77.1,36.7C-96.2,20.6,-105.4,0.2,-105.4,-20.2C-105.4,-40.6,-96.2,-61,-77.1,-77.1C-58,-93.2,-29,-105,0,-105Z",
  "M0,-90C24.8,-90,49.6,-81.1,68.2,-68.2C86.8,-55.3,99.2,-38.4,99.2,-21.5C99.2,-4.6,86.8,12.3,68.2,25.2C49.6,38.1,24.8,47,0,47C-24.8,47,-49.6,38.1,-68.2,25.2C-86.8,12.3,-99.2,-4.6,-99.2,-21.5C-99.2,-38.4,-86.8,-55.3,-68.2,-68.2C-49.6,-81.1,-24.8,-90,0,-90Z"
];

// POSITIONS normalized to x/y coordinates to ensure smooth Framer Motion transitions
// We use calc with vh/vw to maintain consistency and avoid teleporting when switching between top/bottom/left/right
const POSITIONS = [
  { x: '12px', y: 'calc(100vh - 332px)' },             // Bottom Left (320px height + 12px margin)
  { x: '12px', y: 'calc(50vh - 160px)' },              // Middle Left
  { x: '12px', y: 'calc(30vh - 160px)' },              // Upper Middle Left
  { x: '12px', y: '12px' },                           // Top Left
  { x: 'calc(100vw - 332px)', y: '12px' },             // Top Right (320px width + 12px margin)
  { x: 'calc(100vw - 332px)', y: 'calc(35vh - 160px)' } // Upper Middle Right
];


// Broad selector to capture page sections AND internal slides
const SECTION_SELECTOR = '[id], section, [role="region"], [style*="scroll-snap-align"]';

const THROTTLE_DELAY = 16; // ~60fps for responsive scroll tracking
const SCROLL_END_DEBOUNCE = 120; // ms after which scrolling is considered finished

export const AvatarOverlay = () => {
  const theme = useTheme();

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [positionIndex, setPositionIndex] = useState(0);
  const lastSectionRef = useRef<Element | null>(null);
  const lastScrollTimeRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollEndTimeoutRef = useRef<number | null>(null);

  // Randomize position index when section changes to keep it feeling dynamic
  useEffect(() => {
    setPositionIndex(prev => {
      let next;
      // We want a new random position that isn't the same as the current one
      do {
        next = Math.floor(Math.random() * POSITIONS.length);
      } while (next === prev && POSITIONS.length > 1);
      return next;
    });
  }, [activeSectionIndex]);

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
  const currentPos = POSITIONS[positionIndex];

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
        x: currentPos.x,
        y: currentPos.y,
      }}
      transition={{
        duration: 1.2, // Slightly slower for more grace
        ease: [0.22, 1, 0.36, 1] // Custom quintic ease-out for premium feel
      }}
      style={{
        position: 'fixed',
        top: -40, // Offset to compensate for increased container size (320-240)/2
        left: -40,
        zIndex: 10000,
        height: 320, // Increased from 240
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'opacity',
        overflow: 'visible', // Ensure no clipping
      }}
    >
      <Box sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
      }}>
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

        {/* 3D Avatar Space */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200%', // Significantly expanded
            height: '200%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 5,
            overflow: 'visible',
          }}
        >
          <Canvas shadows dpr={[1, 2]} camera={{ fov: 35, near: 0.1, far: 1000 }}>
            <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={30} />

            <React.Suspense fallback={null}>
              <Stage
                intensity={0.6}
                environment="city"
                adjustCamera={false} // Manual control for precise framing
                shadows="contact"
              >
                <Center>
                  <AvatarModel sectionIndex={activeSectionIndex} />
                </Center>
              </Stage>
            </React.Suspense>
          </Canvas>
        </Box>
      </Box>
    </motion.div>
  );
};
