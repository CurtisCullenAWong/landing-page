'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme, alpha } from '@mui/material';

/**
 * A bold, semi-opaque abstract blob that shifts shape.
 * Used for medium-scale background accents.
 */
export const AbstractBlob = ({ color, size = 400, opacity = 0.5, ...props }: any) => {
  const borderRadii = [
    '40% 60% 70% 30% / 40% 50% 60% 50%',
    '55% 45% 65% 35% / 45% 55% 35% 65%',
    '30% 70% 50% 50% / 60% 40% 70% 30%',
    '65% 35% 35% 65% / 35% 65% 65% 35%'
  ];

  const [target, setTarget] = useState({
    borderRadius: borderRadii[0],
    scale: 1,
    rotate: 0,
    x: 0,
    y: 0,
    duration: 10
  });

  const nextAnimation = () => {
    setTarget({
      borderRadius: borderRadii[Math.floor(Math.random() * borderRadii.length)],
      scale: 0.9 + Math.random() * 0.25, // 0.90 to 1.15
      rotate: (Math.random() - 0.5) * 40, // -20 to 20
      x: (Math.random() - 0.5) * 100, // -50 to 50
      y: (Math.random() - 0.5) * 100, // -50 to 50
      duration: 8 + Math.random() * 6 // 8 to 14 seconds (much faster)
    });
  };

  useEffect(() => {
    nextAnimation();
  }, []);

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        backgroundColor: alpha(color, opacity),
        filter: 'blur(60px)',
        position: 'absolute',
        zIndex: -1,
        maskImage: 'radial-gradient(circle, black, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(circle, black, transparent 80%)',
        // Default nudge left to keep sharp edges offscreen; allow explicit overrides
        transform: props.style?.transform ?? 'translateX(-80px)',
        ...props.style
      }}
      animate={{
        borderRadius: target.borderRadius,
        scale: target.scale,
        rotate: target.rotate,
        x: target.x,
        y: target.y
      }}
      transition={{
        duration: target.duration,
        ease: "easeInOut"
      }}
      onAnimationComplete={nextAnimation}
      {...props}
    />
  );
};

/**
 * A complex, filled abstract shape with thick regions.
 * Never "thin" or "linear", always bold and organic.
 */
export const FilledAbstractShape = ({ color, size = 400, delay = 0, opacity = 0.6, ...props }: any) => {
  const paths = [
    "M75,10 C130,10 150,50 150,85 C150,120 120,150 75,150 C30,150 0,120 0,85 C0,50 20,10 75,10 Z",
    "M75,20 C120,20 140,60 140,90 C140,120 110,140 75,140 C40,140 10,120 10,90 C10,60 30,20 75,20 Z",
    "M80,30 C130,30 150,70 150,100 C150,130 120,150 80,150 C40,150 10,130 10,100 C10,70 30,30 80,30 Z"
  ];

  const [target, setTarget] = useState({
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    d: paths[0],
    duration: 10
  });

  const nextAnimation = () => {
    setTarget({
      x: (Math.random() - 0.5) * 120, // -60 to 60
      y: (Math.random() - 0.5) * 120, // -60 to 60
      rotate: (Math.random() - 0.5) * 60, // -30 to 30
      scale: 0.85 + Math.random() * 0.3, // 0.85 to 1.15
      d: paths[Math.floor(Math.random() * paths.length)],
      duration: 7 + Math.random() * 5 // 7 to 12 seconds
    });
  };

  useEffect(() => {
    // Stagger initial launch if delay is provided
    const timer = setTimeout(() => {
      nextAnimation();
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        zIndex: -1,
        display: 'block',
        overflow: 'visible',
        filter: 'blur(50px) drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
        maskImage: 'radial-gradient(circle, black, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(circle, black, transparent 80%)',
        // Nudge left by default so the SVG bulk stays off the viewport edges
        transform: props.style?.transform ?? 'translateX(-120px)',
        ...props.style
      }}
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotate,
        scale: target.scale
      }}
      transition={{
        duration: target.duration,
        ease: "easeInOut"
      }}
      onAnimationComplete={nextAnimation}
      {...props}
    >
      <motion.path
        initial={{ d: paths[0] }}
        animate={{
          d: target.d
        }}
        fill={alpha(color, opacity)}
        transition={{
          duration: target.duration,
          ease: "easeInOut"
        }}
      />
    </motion.svg>
  );
};

/**
 * Massive background shape that spans across components.
 * Very high opacity and blur for a "cloud-like" abstract presence.
 */
export const MassiveAbstractShape = ({ color, delay = 0, opacity = 0.65, ...props }: any) => {
  // Thick waves that never dip below Y=300 (viewBox is 0 0 1000 500)
  // Starts far left (-1000) and ends far right (1500) to ensure horizontal coverage
  const paths = [
    "M-1000,200 C-600,50 200,50 500,150 C800,250 1200,100 1500,200 L1500,600 L-1000,600 Z",
    "M-1000,150 C-500,250 200,150 400,250 C700,300 1100,50 1500,100 L1500,600 L-1000,600 Z",
    "M-1000,250 C-500,100 300,50 600,100 C900,150 1200,300 1500,220 L1500,600 L-1000,600 Z"
  ];

  const [target, setTarget] = useState({
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    d: paths[0],
    duration: 10
  });

  const nextAnimation = () => {
    setTarget({
      x: (Math.random() - 0.5) * 60,       // -30 to 30px translate (keeps edges off-screen)
      y: (Math.random() - 0.5) * 40,       // -20 to 20px translate
      rotate: 0,                           // No rotation to avoid tilting straight edges into view
      scale: 0.98 + Math.random() * 0.08,  // 0.98 to 1.06 scale (keeps organic wave thickness)
      d: paths[Math.floor(Math.random() * paths.length)],
      duration: 8 + Math.random() * 4     // 8 to 12 seconds (continuous, noticeable flow)
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      nextAnimation();
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.svg
      width="180%" 
      height="200%"
      viewBox="0 0 1000 500"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        zIndex: -1,
        // Shift further left by default to hide sharp edges near header/footer
        left: props.style?.left ?? '-100%',
        width: props.style?.width ?? '240%',
        display: 'block',
        overflow: 'visible',
        filter: 'blur(160px)',
        maskImage: 'radial-gradient(circle, black, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(circle, black, transparent 80%)',
        // extra translate to ensure edges remain offscreen unless explicitly overridden
        transform: props.style?.transform ?? 'translateX(-140px)',
        ...props.style
      }}
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotate,
        scale: target.scale
      }}
      transition={{
        duration: target.duration,
        ease: "easeInOut"
      }}
      onAnimationComplete={nextAnimation}
      {...props}
    >
      <motion.path
        initial={{ d: paths[0] }}
        animate={{
          d: target.d
        }}
        fill={alpha(color, opacity)}
        transition={{
          duration: target.duration,
          ease: "easeInOut"
        }}
      />
    </motion.svg>
  );
};
