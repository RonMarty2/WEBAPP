"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import React from "react";

interface ActionCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  delay?: number;
}

export default function ActionCard({
  href,
  icon,
  title,
  description,
  accentColor,
  delay = 0,
}: ActionCardProps) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay,
          ease: "easeOut",
        }}
        whileHover={{ y: -6, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        className="group cursor-pointer"
      >
        <div className="relative h-full rounded-lg border border-neutral-200 bg-white p-6 transition-all duration-300 hover:border-neutral-300 hover:shadow-lg overflow-hidden">
          {/* Accent line top */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: accentColor, transformOrigin: "left" }}
          />

          {/* Icon container */}
          <motion.div
            className="mb-4 inline-flex p-3 rounded-lg"
            style={{ backgroundColor: `${accentColor}15` }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-2xl">{icon}</span>
          </motion.div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-neutral-950 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-neutral-600 mb-4">
            {description}
          </p>

          {/* CTA Arrow */}
          <motion.div
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: accentColor }}
            whileHover={{ gap: "12px" }}
            transition={{ duration: 0.2 }}
          >
            <span>Explorar</span>
            <motion.span
              className="text-lg"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}
