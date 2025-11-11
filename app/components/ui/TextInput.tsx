"use client";

import { motion } from "framer-motion";
import { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "default" | "highlight";
}

export default function TextInput({
  label,
  error,
  variant = "default",
  className = "",
  ...props
}: TextInputProps) {
  const baseClass = `
    w-full
    bg-background/20
    border-2
    ${variant === "highlight" ? "border-gold/40" : "border-gold/20"}
    rounded-2xl
    px-5 py-3.5
    text-foreground font-sans text-base
    placeholder:text-foreground/30
    transition-all duration-300
    focus:outline-none
    focus:bg-background/40
    focus:border-gold
    focus:ring-4 focus:ring-gold/20
    focus:shadow-lg focus:shadow-gold/10
    hover:border-gold/40
    hover:bg-background/30
    disabled:opacity-50 disabled:cursor-not-allowed
  `.replace(/\s+/g, " ").trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
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
      <input
        className={`${baseClass} ${className}`}
        {...props}
      />
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
