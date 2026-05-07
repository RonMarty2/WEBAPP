"use client";

import { motion } from "framer-motion";
import React from "react";

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function Section({
  title,
  subtitle,
  children,
  delay = 0,
  className = "",
}: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`mb-12 ${className}`}
    >
      {/* Section header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-neutral-600 text-sm">{subtitle}</p>
        )}
      </div>

      {/* Section content */}
      {children}
    </motion.section>
  );
}
