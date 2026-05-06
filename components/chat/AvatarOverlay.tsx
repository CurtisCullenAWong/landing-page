'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF, Float, PerspectiveCamera, Stage, Center, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

// Abstract squiggly paths for morphing - more organic and abstract
const SQUIGGLY_PATHS = [
  "M0,-110C35,-115,70,-100,95,-75C120,-50,130,-15,120,20C110,55,80,85,45,100C10,115,-25,125,-55,110C-85,95,-110,55,-120,15C-130,-25,-115,-70,-90,-95C-65,-120,-30,-115,0,-110Z",
  "M0,-105C45,-105,85,-125,110,-100C135,-75,120,-30,115,15C110,60,130,95,95,115C60,135,15,115,-30,115C-75,115,-115,130,-135,95C-155,60,-135,15,-115,-30C-95,-75,-75,-105,0,-105Z",
  "M0,-115C30,-120,60,-140,90,-115C120,-90,135,-45,125,0C115,45,130,90,100,115C70,140,30,120,0,115C-30,120,-70,140,-100,115C-130,90,-115,45,-125,0C-135,-45,-120,-90,-90,-115C-60,-140,-30,-120,0,-115Z",
  "M0,-100C40,-110,80,-120,105,-90C130,-60,115,-15,110,25C105,65,120,105,90,120C60,135,20,110,-20,115C-60,120,-100,135,-120,105C-140,75,-120,30,-115,-20C-110,-70,-80,-110,0,-100Z",
  "M0,-120C50,-120,90,-110,115,-75C140,-40,125,10,110,55C95,100,115,140,75,150C35,160,0,130,-35,140C-70,150,-100,165,-125,140C-150,115,-130,70,-120,25C-110,-20,-90,-70,-50,-120C-10,-130,0,-120,0,-120Z",
  "M0,-110C45,-115,90,-110,115,-75C140,-40,125,10,115,55C105,100,135,140,90,150C45,160,0,130,-45,140C-90,150,-135,160,-150,125C-165,90,-140,45,-125,0C-110,-45,-85,-105,0,-110Z",
];

// Preload the 3D model in the background
useGLTF.preload('/models/avatar.glb');

const SECTION_SELECTOR = '[id], section, [role="region"], [style*="scroll-snap-align"]';
const SECTION_CHANGE_DEBOUNCE = 100; // ms

// ─── AvatarModel ─────────────────────────────────────────────────────────────
const AvatarModel = ({ sectionIndex, gender, manualIndex }: { sectionIndex: number, gender: 'male' | 'female', manualIndex: number }) => {
  const group = useRef<THREE.Group>(null);
  const { scene: originalScene, animations } = useGLTF('/models/avatar.glb');

  // Clone scene to prevent cumulative transform drift across navigation
  const scene = useMemo(() => SkeletonUtils.clone(originalScene), [originalScene]);

  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  // R3F-managed animation loop — delta is already frame-time-corrected
  useFrame((_state, delta) => {
    mixer.update(delta);
  });

  // Cleanup mixer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(scene);
    };
  }, [mixer, scene]);

  const [currentClipIndex, setCurrentClipIndex] = useState(0);

  useEffect(() => {
    if (!animations || animations.length === 0) return;

    const keywords = ['dance', 'walk', 'idle', 'wave', 'nod', 'clap', 'sit', 'stand', 'run'];
    const pool = animations.filter((clip) =>
      keywords.some(k => clip.name.toLowerCase().includes(k))
    ).slice(0, Math.ceil(animations.length / 2)) || animations;

    // Use modulo to stay within pool bounds
    const targetIdx = (sectionIndex + manualIndex) % pool.length;
    setCurrentClipIndex(targetIdx);
  }, [sectionIndex, manualIndex, animations]);

  useEffect(() => {
    if (!animations || animations.length === 0) return;

    const keywords = ['dance', 'walk', 'idle', 'wave', 'nod', 'clap', 'sit', 'stand', 'run'];
    const pool = animations.filter((clip) =>
      keywords.some(k => clip.name.toLowerCase().includes(k))
    ).slice(0, Math.ceil(animations.length / 2)) || animations;

    const clip = pool[currentClipIndex];
    if (!clip) return;

    const nextAction = mixer.clipAction(clip);
    if (currentActionRef.current === nextAction) return;

    console.log(`[AvatarModel] Playing: ${clip.name}`);

    const prevAction = currentActionRef.current;

    // Smooth transition
    nextAction.reset();
    nextAction.setEffectiveTimeScale(0.5); // Reduced speed to half
    nextAction.setEffectiveWeight(1);
    nextAction.fadeIn(0.5);
    nextAction.play();

    if (prevAction) {
      prevAction.fadeOut(0.5);
    }

    currentActionRef.current = nextAction;

    return () => {
      // Optional: keep it playing but handle transition logic carefully
    };
  }, [currentClipIndex, animations, mixer]);


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

// ─── AvatarOverlay ────────────────────────────────────────────────────────────
export const AvatarOverlay = ({ gender, isVisible = true }: { gender: 'male' | 'female', isVisible?: boolean }) => {
  const theme = useTheme();

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [manualIndex, setManualIndex] = useState(0);
  const [currentPos, setCurrentPos] = useState<{ x: string; y: string }>({
    x: '30px',
    y: 'calc(50vh - 160px)',
  });

  const sectionsRef = useRef<Element[]>([]);
  const lastSectionRef = useRef<Element | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reposition on section change — strictly left side to avoid chat overlap
  useEffect(() => {
    // Randomize vertical position (25vh to 65vh) to stay safely in viewport
    const randomY = Math.floor(Math.random() * 40) + 25;
    // Vary x slightly (30px to 60px) for an organic feel
    const randomX = Math.floor(Math.random() * 30) + 30;

    const newPos = { x: `${randomX}px`, y: `calc(${randomY}vh - 160px)` };
    setCurrentPos(newPos);
  }, [activeSectionIndex]);


  // Stable color array derived from theme
  const colors = useMemo(
    () => [
      theme.palette.primary?.main ?? '#00A39D',
      (theme.palette as any).tertiary?.main ?? theme.palette.primary?.light ?? '#FCE200',
      theme.palette.secondary?.main ?? '#1a1a1a',
      theme.palette.info?.main ?? '#0288d1',
      theme.palette.success?.main ?? '#2e7d32',
    ],
    [theme]
  );

  // Section tracking via IntersectionObserver
  useEffect(() => {
    sectionsRef.current = Array.from(document.querySelectorAll(SECTION_SELECTOR));

    const scheduleUpdate = (index: number) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setActiveSectionIndex(index);
      }, SECTION_CHANGE_DEBOUNCE);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          const best = intersecting.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (best && best.target !== lastSectionRef.current) {
            lastSectionRef.current = best.target;
            const idx = sectionsRef.current.indexOf(best.target);
            if (idx !== -1) scheduleUpdate(idx);
          }
        }
      },
      { threshold: [0.1, 0.5, 0.9], rootMargin: '-10% 0px -10% 0px' }
    );

    sectionsRef.current.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const currentPath = SQUIGGLY_PATHS[activeSectionIndex % SQUIGGLY_PATHS.length];
  const currentColor = colors[activeSectionIndex % colors.length];
  const nextColor = colors[(activeSectionIndex + 1) % colors.length];

  return (
    <motion.div
      animate={{
        x: currentPos.x,
        y: currentPos.y,
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 12000,
        width: 320,
        height: 320,
        pointerEvents: isVisible ? 'auto' : 'none',
        willChange: 'transform, opacity',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        whileDrag={{ scale: 1.08 }}
        onTap={() => setManualIndex(prev => prev + 1)}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isVisible ? 'grab' : 'default',
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
            pointerEvents: 'none', // Critical: Let drag events pass to the motion.div
          }}
        >
          {/* Ambient glow — breathing pulse */}
          <motion.div
            animate={{
              opacity: isVisible ? 1 : 0,
            }}
            initial={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              position: 'absolute',
              inset: 10,
              background: `radial-gradient(circle, ${currentColor}66 0%, transparent 70%)`,
              filter: 'blur(30px)',
              zIndex: -1,
              willChange: 'transform, opacity',
            }}
          />

          {/* Morphing blob SVG */}
          <motion.svg
            animate={{ y: [0, -10, 5, -5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            viewBox="-200 -200 400 400"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: '110%',
              height: '110%',
              filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.3))',
              overflow: 'visible',
              willChange: 'transform',
              pointerEvents: 'none',
            }}
          >
            <defs>
              <linearGradient id="squiggly-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <motion.stop
                  offset="0%"
                  animate={{ stopColor: currentColor }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
                <motion.stop
                  offset="100%"
                  animate={{ stopColor: nextColor }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
              </linearGradient>
            </defs>

            <motion.path
              initial={false}
              animate={{ d: currentPath, fill: 'url(#squiggly-gradient)' }}
              transition={{
                d: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                fill: { duration: 0.8, ease: 'easeInOut' },
              }}
              style={{ opacity: 0.95, stroke: 'none', willChange: 'd' }}
            />

            {/* Fallback circle so avatar is never unmasked if blob morphs narrow */}
            <motion.circle
              cx={0}
              cy={0}
              initial={{ r: 54, opacity: 0.95 }}
              animate={{ r: [54, 58, 52, 54], opacity: [0.95, 0.98, 0.95] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              fill="url(#squiggly-gradient)"
              style={{ pointerEvents: 'none' }}
            />
          </motion.svg>

          {/* 3D Avatar canvas */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none', // Critical: Let drag events pass to the motion.div
              zIndex: 5,
              overflow: 'visible',
              clipPath: 'circle(48%)',
            }}
          >
            <Canvas
              shadows={{ type: THREE.PCFShadowMap }}
              dpr={[1, 2]}
              camera={{ fov: 35, near: 0.1, far: 1000 }}
              style={{ pointerEvents: 'none' }} // Critical: Let drag events pass to the motion.div
              gl={{
                antialias: true,
                powerPreference: 'high-performance',
                alpha: true,
                stencil: false,
                depth: true,
              }}
              frameloop="always"
            >
              <AdaptiveDpr pixelated />
              <AdaptiveEvents />
              <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={30} />

              <React.Suspense fallback={null}>
                <Stage
                  intensity={0.6}
                  environment="city"
                  adjustCamera={false}
                  shadows="contact"
                >
                  <Center position={[0.4, -0.3, 0]}>
                    <AvatarModel
                      sectionIndex={activeSectionIndex}
                      gender={gender}
                      manualIndex={manualIndex}
                    />
                  </Center>
                </Stage>
              </React.Suspense>
            </Canvas>
          </Box>
        </Box>
      </motion.div>
    </motion.div>
  );
};