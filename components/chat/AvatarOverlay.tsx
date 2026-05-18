'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF, Float, PerspectiveCamera, Stage, Center, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

// ─── Random Blob Generator ───────────────────────────────────────────────────
// Generates a smooth, completely random SVG path every time it is called.
// It maintains a consistent structure (1 Move, 7 Cubics, 1 Close) so Framer Motion 
// can seamlessly morph between the generated shapes.
const generateRandomBlob = () => {
  const numPoints = 7;
  const angleStep = (Math.PI * 2) / numPoints;
  const points = [];

  // 1. Generate random anchor points around a circle
  for (let i = 0; i < numPoints; i++) {
    // Start at -90deg (-PI/2) to keep orientation similar to original shapes
    const angle = i * angleStep - (Math.PI / 2);
    // Randomize the radius between 90 and 150 for an organic, shifting feel
    const radius = 90 + Math.random() * 60;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  // 2. Calculate control points for a smooth closed loop using tension
  const tension = 0.3;
  let path = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  for (let i = 0; i < numPoints; i++) {
    const p0 = points[(i - 1 + numPoints) % numPoints];
    const p1 = points[i];
    const p2 = points[(i + 1) % numPoints];
    const p3 = points[(i + 2) % numPoints];

    // Control point 1
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;

    // Control point 2
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return path + ' Z';
};

// Preload the 3D model in the background
useGLTF.preload('/models/avatar.glb');

// ─── AvatarModel ─────────────────────────────────────────────────────────────
const AvatarModel = ({ manualIndex, gender }: { manualIndex: number, gender: 'male' | 'female' }) => {
  const group = useRef<THREE.Group>(null);
  const { scene: originalScene, animations } = useGLTF('/models/avatar.glb');

  // Refs for audio and state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const oscIntervalRef = useRef<number | null>(null);

  const scene = useMemo(() => SkeletonUtils.clone(originalScene), [originalScene]);
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  useFrame((_state, delta) => mixer.update(delta));

  useEffect(() => {
    if (!animations?.length) return;

    const keywords = ['idle', 'walk', 'wave', 'run', 'sprint', 'dance'];
    const pool = animations.filter(a =>
      keywords.some(k => a.name.toLowerCase().includes(k))
    );

    if (pool.length === 0) return;

    // 1. Determine target clip
    let idx = manualIndex % pool.length;
    if (manualIndex === 0) {
      const idleIdx = pool.findIndex(a => a.name.toLowerCase().includes('idle'));
      if (idleIdx !== -1) idx = idleIdx;
    }

    const clip = pool[idx];
    const nextAction = mixer.clipAction(clip);

    // 2. Smooth Crossfade Transition
    if (currentActionRef.current !== nextAction) {
      const prevAction = currentActionRef.current;

      nextAction.reset();
      nextAction.setEffectiveTimeScale(0.5);
      nextAction.setEffectiveWeight(1);
      nextAction.play();

      if (prevAction) {
        // Crossfade over 0.5 seconds
        nextAction.crossFadeFrom(prevAction, 0.5, true);
      } else {
        nextAction.fadeIn(0.5);
      }

      currentActionRef.current = nextAction;
    }

    // 3. Audio logic with cleanup for rapid clicks
    const audioTimeout = setTimeout(() => {
      const clipName = clip.name.toLowerCase();
      let targetAudioSrc: string | null = null;
      if (clipName.includes('dance')) targetAudioSrc = '/audio/dance.mp3';
      if (clipName.includes('sprint')) targetAudioSrc = '/audio/dance1.mp3';

      // Halt current audio if target changed
      if (!targetAudioSrc || (audioRef.current && !audioRef.current.src.endsWith(targetAudioSrc))) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        if (oscIntervalRef.current) {
          window.clearInterval(oscIntervalRef.current);
          oscIntervalRef.current = null;
        }
      }

      if (targetAudioSrc) {
        if (!audioRef.current || !audioRef.current.src.endsWith(targetAudioSrc)) {
          audioRef.current = new Audio(targetAudioSrc);
          audioRef.current.loop = true;
          audioRef.current.volume = 0.6;
        }
        audioRef.current.play().catch(() => {/* WebAudio Fallback logic here */ });
      }
    }, 100);

    return () => clearTimeout(audioTimeout);
  }, [manualIndex, animations, mixer]);

  return (
    <group ref={group} dispose={null}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <primitive object={scene} />
      </Float>
    </group>
  );
};

// ─── AvatarOverlay ────────────────────────────────────────────────────────────
export const AvatarOverlay = ({ gender, isVisible = true }: { gender: 'male' | 'female', isVisible?: boolean }) => {
  const theme = useTheme();

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Dynamic absolute random path state
  const [blobPath, setBlobPath] = useState(generateRandomBlob);

  const [blobColorIndex1, setBlobColorIndex1] = useState(0);
  const [blobColorIndex2, setBlobColorIndex2] = useState(1);

  const [currentPos, setCurrentPos] = useState<{ x: string; y: string }>({
    x: '30px',
    y: 'calc(50vh - 160px)',
  });

  const constraintsRef = useRef<HTMLDivElement>(null);

  // Initial position only — ensuring it stays within viewport
  useEffect(() => {
    // Randomize vertical position (25vh to 65vh) to stay safely in viewport
    const randomY = Math.floor(Math.random() * 40) + 25;
    // Vary x slightly (30px to 60px) for an organic feel
    const randomX = Math.floor(Math.random() * 30) + 30;

    const newPos = { x: `${randomX}px`, y: `calc(${randomY}vh - 160px)` };
    setCurrentPos(newPos);

    // Set initial random colors on mount (avoids hydration mismatches if colors array length varies)
    setBlobColorIndex1(Math.floor(Math.random() * 5));
    setBlobColorIndex2(Math.floor(Math.random() * 5));
  }, []);

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

  // Interaction handler to randomize the blob and advance the 3D model animation
  const handleInteraction = () => {
    // Advance 3D animation index
    setActiveSectionIndex((prev) => prev + 1);

    // Generate an entirely new, random mathematical blob shape
    setBlobPath(generateRandomBlob());

    // Pick two new random colors for the gradient
    const nextColor1 = Math.floor(Math.random() * colors.length);
    let nextColor2 = Math.floor(Math.random() * colors.length);
    // Ensure the two colors are distinct to keep the gradient visible
    if (nextColor1 === nextColor2) {
      nextColor2 = (nextColor2 + 1) % colors.length;
    }
    setBlobColorIndex1(nextColor1);
    setBlobColorIndex2(nextColor2);
  };

  const currentColor = colors[blobColorIndex1 % colors.length];
  const nextColor = colors[blobColorIndex2 % colors.length];

  return (
    <>
      {/* Invisible constraint boundary for dragging */}
      <Box
        ref={constraintsRef}
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 11999,
          visibility: 'hidden'
        }}
      />

      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        onDragEnd={(e, info) => {
          // Only trigger if they actually moved the avatar slightly
          if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
            handleInteraction();
          }
        }}
        onTap={() => {
          // If it was just a tap (no drag offset), trigger
          handleInteraction();
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.8,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{
          position: 'fixed',
          top: currentPos.y,
          left: currentPos.x,
          zIndex: 12000,
          width: 320,
          height: 320,
          pointerEvents: isVisible ? 'auto' : 'none',
          willChange: 'transform, opacity',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isVisible ? 'grab' : 'default',
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
              d={blobPath}
              animate={{ d: blobPath, fill: 'url(#squiggly-gradient)' }}
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
                  <Center position={[0.4, -0.3, 1]}>
                    <AvatarModel
                      gender={gender}
                      manualIndex={activeSectionIndex} />
                  </Center>
                </Stage>
              </React.Suspense>
            </Canvas>
          </Box>
        </Box>
      </motion.div>
    </>
  );
};