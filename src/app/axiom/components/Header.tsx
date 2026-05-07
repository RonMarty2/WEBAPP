"use client";

import { motion } from "framer-motion";

interface HeaderProps {
  user?: { name: string; id: string } | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="border-b border-neutral-200 bg-white"
    >
      <div className="flex items-center justify-between px-6 py-5">
        {/* Logo + Subtitle */}
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl font-bold tracking-tight text-neutral-900"
          >
            AXIOM
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-neutral-500 mt-1"
          >
            Prepárate como si ya estuvieras
          </motion.p>
        </div>

        {/* User + Logout */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-4"
        >
          {user && (
            <span className="text-sm text-neutral-600 font-medium">
              {user.name}
            </span>
          )}
          <a
            href="/login"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Salir
          </a>
        </motion.div>
      </div>
    </motion.header>
  );
}
