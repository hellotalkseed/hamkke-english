"use client";

import { motion } from "framer-motion";

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export default function StaggerItem({
  children,
  className = "",
}: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 25,
        },
        visible: {
          opacity: 1,
          y: 0,
        },
      }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}