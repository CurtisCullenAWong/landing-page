'use client';

import { motion } from 'framer-motion';
import { useTheme, alpha } from '@mui/material';

/**
 * A bold, semi-opaque abstract blob that shifts shape.
 * Used for medium-scale background accents.
 */
export const AbstractBlob = ({ color, size = 400, opacity = 0.5, ...props }: any) => (
  <motion.div
    style={{
      width: size,
      height: size,
      borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
      backgroundColor: alpha(color, opacity),
      filter: 'blur(60px)',
      position: 'absolute',
      zIndex: -1,
      ...props.style
    }}
    animate={{
      borderRadius: [
        '40% 60% 70% 30% / 40% 50% 60% 50%',
        '60% 40% 30% 70% / 50% 60% 40% 60%',
        '40% 60% 70% 30% / 40% 50% 60% 50%'
      ],
      scale: [1, 1.1, 0.9, 1],
      rotate: [0, 15, -15, 0]
    }}
    transition={{
      duration: 12,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    {...props}
  />
);

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
        filter: 'blur(50px) drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
        ...props.style
      }}
      animate={{
        y: [0, -40, 0],
        x: [0, 30, 0],
        rotate: [0, 15, -15, 0],
        scale: [1, 1.2, 0.8, 1],
      }}
      transition={{
        duration: 15,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    >
      <motion.path
        d={paths[0]}
        fill={alpha(color, opacity)}
        animate={{
          d: paths,
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
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
  const paths = [
    "M-100,250 C-100,50 300,-50 500,100 C700,250 1100,50 1100,250 L1100,600 L-100,600 Z",
    "M-200,300 C0,0 500,0 700,300 C900,600 1200,300 1400,500 L1400,1000 L-200,1000 Z",
    "M100,100 C400,-100 900,-100 1200,200 C1500,500 1000,900 500,800 C0,700 -200,400 100,100 Z"
  ];

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
        filter: 'blur(160px)',
        ...props.style
      }}
      animate={{
        x: [-80, 80, -80],
        y: [-50, 50, -50],
        rotate: [0, 10, -10, 0],
        scale: [1, 1.2, 0.8, 1]
      }}
      transition={{
        duration: 35 + Math.random() * 20,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    >
      <motion.path
        d={paths[0]}
        fill={alpha(color, opacity)}
        animate={{
          d: paths,
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.svg>
  );
};
