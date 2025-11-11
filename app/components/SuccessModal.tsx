"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  title: string;
  message: string;
  onClose: () => void;
  autoCloseDuration?: number;
}

export default function SuccessModal({
  title,
  message,
  onClose,
  autoCloseDuration = 2000,
}: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, autoCloseDuration);
    return () => clearTimeout(timer);
  }, [autoCloseDuration, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="bg-card-bg border-2 border-gold rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          {/* Icona check animata */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", duration: 0.6, bounce: 0.4 }}
              className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center"
            >
              <motion.svg
                className="w-12 h-12 text-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.5, ease: "easeInOut" }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>
          </div>

          {/* Testo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold text-gold mb-3">{title}</h3>
            <p className="text-foreground/80 text-base leading-relaxed">{message}</p>
          </motion.div>

          {/* Barra di progresso */}
          <div className="mt-6 w-full h-1 bg-background rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: autoCloseDuration / 1000, ease: "linear" }}
              className="h-full bg-gold rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
