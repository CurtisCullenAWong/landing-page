'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF, Float, PerspectiveCamera, Stage, Center } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';


// Abstract squiggly paths for morphing - more organic and abstract
const SQUIGGLY_PATHS = [
  "M0,-110C35,-115,70,-100,95,-75C120,-50,130,-15,120,20C110,55,80,85,45,100C10,115,-25,125,-55,110C-85,95,-110,55,-120,15C-130,-25,-115,-70,-90,-95C-65,-120,-30,-115,0,-110Z",
  "M0,-105C45,-105,85,-125,110,-100C135,-75,120,-30,115,15C110,60,130,95,95,115C60,135,15,115,-30,115C-75,115,-115,130,-135,95C-155,60,-135,15,-115,-30C-95,-75,-75,-105,0,-105Z",
  "M0,-115C30,-120,60,-140,90,-115C120,-90,135,-45,125,0C115,45,130,90,100,115C70,140,30,120,0,115C-30,120,-70,140,-100,115C-130,90,-115,45,-125,0C-135,-45,-120,-90,-90,-115C-60,-140,-30,-120,0,-115Z",
  "M0,-100C40,-110,80,-120,105,-90C130,-60,115,-15,110,25C105,65,120,105,90,120C60,135,20,110,-20,115C-60,120,-100,135,-120,105C-140,75,-120,30,-115,-20C-110,-70,-80,-110,0,-100Z",
  "M0,-120C50,-120,90,-110,115,-75C140,-40,125,10,110,55C95,100,115,140,75,150C35,160,0,130,-35,140C-70,150,-100,165,-125,140C-150,115,-130,70,-120,25C-110,-20,-90,-70,-50,-120C-10,-130,0,-120,0,-120Z",
  "M0,-110C45,-115,90,-110,115,-75C140,-40,125,10,115,55C105,100,135,140,90,150C45,160,0,130,-45,140C-90,150,-135,160,-150,125C-165,90,-140,45,-125,0C-110,-45,-85,-105,0,-110Z"
];

// POSITIONS normalized to x/y coordinates
// Using 320px as the base container size with safe margins to avoid screen clipping
const POSITIONS = [
  { x: '24px', y: 'calc(100vh - 344px)' },             // Bottom Left
  { x: '24px', y: 'calc(50vh - 160px)' },              // Middle Left
  { x: '24px', y: 'calc(20vh - 160px)' },              // Upper Left
  { x: '24px', y: '24px' },                           // Top Left
  { x: 'calc(100vw - 344px)', y: '24px' },             // Top Right
  { x: 'calc(100vw - 344px)', y: 'calc(40vh - 160px)' } // Upper Right
];


const SECTION_SELECTOR = '[id], section, [role="region"], [style*="scroll-snap-align"]';
const SECTION_CHANGE_DEBOUNCE = 100; // ms to wait before committing to a section change

// Sub-component for the Avatar with refined animation logic and modern Three.js practices
const AvatarModel = ({ sectionIndex }: { sectionIndex: number }) => {
  const group = useRef<THREE.Group>(null);
  const { scene: originalScene, animations } = useGLTF('/models/avatar.glb');

  // Clone the scene to prevent cumulative offsets when navigating
  const scene = useMemo(() => SkeletonUtils.clone(originalScene), [originalScene]);

  // Manual Mixer and Timer to avoid THREE.Clock deprecation and fix playback
  const [mixer] = useState(() => new THREE.AnimationMixer(scene));
  const timer = useMemo(() => {
    try {
      return new (THREE as any).Timer();
    } catch (e) {
      return null;
    }
  }, []);


  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  // Animation update loop
  useFrame((_state, delta) => {
    if (timer) {
      timer.update();
      mixer.update(timer.getDelta());
    } else {
      mixer.update(delta);
    }
  });

  useEffect(() => {
    if (!animations || animations.length === 0) return;

    // Broad filter to find dance or movement animations
    const danceClips = animations.filter(clip => {
      const low = clip.name.toLowerCase();
      return low.includes('dance');
    });

    const pool = danceClips.length > 0 ? danceClips : animations;
    const clip = pool[sectionIndex % pool.length];

    if (!clip) return;

    const action = mixer.clipAction(clip);

    if (currentActionRef.current !== action) {
      console.log(`[AvatarModel] Transitioning to: ${clip.name}`);

      // Stop all other actions
      mixer.stopAllAction();

      if (currentActionRef.current) {
        currentActionRef.current.fadeOut(0.5);
      }

      action
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.5)
        .play();

      currentActionRef.current = action;
    }
  }, [sectionIndex, animations, mixer]);

  return (
    <group ref={group} dispose={null}>
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.3}
        floatingRange={[-0.05, 0.05]}
      >
        <primitive object={scene} />
      </Float>
    </group>
  );
};





export const AvatarOverlay = () => {
  const theme = useTheme();

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [positionIndex, setPositionIndex] = useState(0);
  const sectionsRef = useRef<Element[]>([]);
  const lastSectionRef = useRef<Element | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update position index only when section actually changes and settles
  useEffect(() => {
    setPositionIndex(prev => {
      let next;
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

  // Optimized Intersection Observer
  useEffect(() => {
    // Cache sections for lookup
    sectionsRef.current = Array.from(document.querySelectorAll(SECTION_SELECTOR));

    const updateSection = (index: number) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setActiveSectionIndex(index);
      }, SECTION_CHANGE_DEBOUNCE);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible entry
        const bestEntry = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (bestEntry && bestEntry.target !== lastSectionRef.current) {
          lastSectionRef.current = bestEntry.target;
          const index = sectionsRef.current.indexOf(bestEntry.target);
          if (index !== -1) {
            updateSection(index);
          }
        }
      },
      { threshold: [0.2, 0.5, 0.8], rootMargin: '-10% 0px -10% 0px' }
    );

    sectionsRef.current.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);


  // Derived deterministic values
  const currentPath = SQUIGGLY_PATHS[activeSectionIndex % SQUIGGLY_PATHS.length];
  const currentColor = colors[activeSectionIndex % colors.length];
  const nextColor = colors[(activeSectionIndex + 1) % colors.length];
  const currentPos = POSITIONS[positionIndex];

  return (
    <motion.div
      animate={{
        x: currentPos.x,
        y: currentPos.y,
        opacity: 1,
      }}
      initial={{ opacity: 0 }}
      transition={{
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1]
      }}

      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10000,
        width: 320,
        height: 320,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'transform, opacity',
        overflow: 'visible',
      }}

    >
      <Box sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        pointerEvents: 'none'
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
            filter: 'blur(30px)',
            zIndex: -1,
            willChange: 'transform, opacity',
          }}
        />

        {/* Squiggly Morphing Shape - with subtle floating */}
        <motion.svg
          animate={{
            y: [0, -10, 5, -5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          viewBox="-200 -200 400 400"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '110%',
            height: '110%',
            filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.3))',
            overflow: 'visible',
            willChange: 'transform',
            pointerEvents: 'none'
          }}
        >


          <defs>
            <linearGradient id="squiggly-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop
                offset="0%"
                animate={{ stopColor: currentColor }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              <motion.stop
                offset="100%"
                animate={{ stopColor: nextColor }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
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
              d: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
              fill: { duration: 0.8, ease: "easeInOut" }
            }}
            style={{
              opacity: 0.95,
              stroke: 'none',
              willChange: 'd'
            }}
          />


          {/* Ensure central avatar area remains filled even if blob morphs away */}
          <motion.circle
            cx={0}
            cy={0}
            r={54}
            animate={{ r: [54, 58, 52, 54], opacity: [0.95, 0.98, 0.95] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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
            pointerEvents: 'none',
            zIndex: 5,
            overflow: 'visible',
          }}

        >
          <Canvas
            shadows={{ type: THREE.PCFShadowMap }}
            dpr={[1, 1.5]} // Capped at 1.5 for mobile performance

            camera={{ fov: 35, near: 0.1, far: 1000 }}
            style={{ pointerEvents: 'none' }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              alpha: true
            }}
          >

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
