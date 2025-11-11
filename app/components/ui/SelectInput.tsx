"use client";

import { motion } from "framer-motion";
import { SelectHTMLAttributes } from "react";

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export default function SelectInput({
  label,
  error,
  className = "",
  children,
  ...props
}: SelectInputProps) {
  const baseClass = `
    w-full
    bg-background/20
    border-2 border-gold/20
    rounded-2xl
    px-5 py-3.5
    pr-12
    text-foreground font-sans text-base
    cursor-pointer
    appearance-none
    transition-all duration-300
    focus:outline-none
    focus:bg-background/40
    focus:border-gold
    focus:ring-4 focus:ring-gold/20
    focus:shadow-lg focus:shadow-gold/10
    hover:border-gold/40
    hover:bg-background/30
    disabled:opacity-50 disabled:cursor-not-allowed
    [&>option]:bg-background
    [&>option]:text-foreground
    [&>option]:py-3
  `.replace(/\s+/g, " ").trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full relative"
    >
      {label && (
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="block text-foreground/70 text-sm font-medium mb-2.5"
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        <select
          className={`${baseClass} ${className}`}
          {...props}
        >
          {children}
        </select>
        {/* Freccia custom */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gold/60 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
