"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TextareaHTMLAttributes, useState } from "react";

interface TextAreaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  collapsible?: boolean;
  initialValue?: string;
}

export default function TextAreaInput({
  label,
  collapsible = false,
  initialValue = "",
  className = "",
  value,
  onChange,
  ...props
}: TextAreaInputProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible || !!initialValue);

  const baseClass = `
    w-full
    bg-background/20
    border-2 border-gold/20
    rounded-2xl
    px-5 py-4
    text-foreground font-sans text-base
    placeholder:text-foreground/30
    resize-none
    min-h-[120px]
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

  if (collapsible && !isExpanded) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(true)}
        className="w-full text-left bg-background/10 border-2 border-gold/15 border-dashed rounded-2xl px-5 py-4 text-foreground/60 hover:text-foreground hover:border-gold/30 transition-all duration-300 flex items-center justify-between group"
      >
        <span className="text-sm font-medium">{label}</span>
        <svg
          className="w-5 h-5 text-gold/60 group-hover:text-gold transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2.5">
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-foreground/70 text-sm font-medium"
          >
            {label}
          </motion.label>
          {collapsible && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(false)}
              className="text-foreground/40 hover:text-foreground/70 transition-colors"
              title="Rimuovi campo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>
        <textarea
          className={`${baseClass} ${className}`}
          value={value}
          onChange={onChange}
          {...props}
        />
      </motion.div>
    </AnimatePresence>
  );
}
