"use client";

import { motion } from "framer-motion";

interface SovraLoaderProps {
  /** Size of the loader */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes */
  className?: string;
  /** Whether to animate the loader */
  animate?: boolean;
}

// Sovra logo paths - representing the 4 products in the chain
const logoPaths = [
  "M801.88,842.78c-8.1,47.41-30.86,89.85-63.42,122.39-41.2,41.2-98.19,66.73-161.09,66.73-125.41,0-227.2-101.41-227.74-226.71v-271.76h146.2v277.65c0,45.09,36.52,81.62,81.54,81.62,22.56,0,42.97-9.12,57.73-23.89,7.41-7.41,13.38-16.22,17.52-26.01h149.27Z",
  "M805.17,349.63v271.82h-146.18v-277.65c0-45.09-36.52-81.62-81.62-81.62-22.54,0-42.89,9.12-57.67,23.89-7.39,7.39-13.35,16.18-17.46,25.96h-149.32c8.08-47.39,30.83-89.77,63.44-122.39,41.18-41.2,98.12-66.73,161.01-66.73,125.49,0,227.2,101.41,227.8,226.71Z",
  "M1031.89,577.44c0,125.41-101.35,227.12-226.73,227.74h-271.75v-146.15h277.65c45.02,0,81.62-36.52,81.62-81.6,0-22.56-9.12-42.97-23.95-57.73-7.41-7.41-16.2-13.38-25.98-17.5v-149.3c47.44,8.1,89.83,30.86,122.4,63.44,41.26,41.26,66.73,98.19,66.73,161.09Z",
  "M621.39,349.63v146.2h-277.67c-45.02,0-81.6,36.52-81.6,81.62,0,22.54,9.17,42.95,23.95,57.73,7.39,7.39,16.18,13.37,25.96,17.48v149.25c-47.41-8.08-89.85-30.83-122.4-63.44-41.2-41.2-66.71-98.14-66.71-161.01,0-125.43,101.41-227.27,226.71-227.82h271.76Z",
];

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

/**
 * SovraLoader - Animated loading spinner using the Sovra logo
 */
export function SovraLoader({
  size = "md",
  className = "",
  animate = true
}: SovraLoaderProps) {
  const sizeClass = sizeClasses[size];
  const cycleDuration = 1.2;
  const pathDelay = cycleDuration / 4;

  if (!animate) {
    return (
      <svg
        className={`${sizeClass} ${className}`}
        viewBox="0 0 1154.81 1154.81"
        fill="none"
      >
        {logoPaths.map((d, index) => (
          <path key={index} d={d} fill="currentColor" />
        ))}
      </svg>
    );
  }

  return (
    <motion.svg
      className={`${sizeClass} ${className}`}
      viewBox="0 0 1154.81 1154.81"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {logoPaths.map((d, index) => (
        <motion.path
          key={index}
          d={d}
          fill="currentColor"
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: cycleDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * pathDelay,
          }}
        />
      ))}
    </motion.svg>
  );
}

export default SovraLoader;
