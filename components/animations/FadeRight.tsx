"use client";

import { motion } from "framer-motion";

interface FadeRightProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function FadeRight({
  children,
  delay = 0,
  className = "",
}: FadeRightProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 30,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}