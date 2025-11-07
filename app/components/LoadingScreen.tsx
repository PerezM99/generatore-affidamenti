"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingStep {
  id: number;
  text: string;
  duration: number;
}

const loadingSteps: LoadingStep[] = [
  { id: 1, text: "Caricamento del preventivo...", duration: 800 },
  { id: 2, text: "Analisi del contenuto del documento...", duration: 1200 },
  { id: 3, text: "Estrazione dei dati principali...", duration: 1000 },
  { id: 4, text: "Identificazione importi e fornitori...", duration: 1100 },
  { id: 5, text: "Verifica conformità normativa...", duration: 900 },
  { id: 6, text: "Preparazione template documenti...", duration: 800 },
  { id: 7, text: "Generazione documenti in corso...", duration: 1500 },
];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep < loadingSteps.length) {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
      }, loadingSteps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-2xl w-full px-6 relative z-10">
        {/* Main loading spinner */}
        <div className="flex justify-center mb-12">
          <motion.div
            className="relative w-24 h-24"
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 border-4 border-gold/20 rounded-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            {/* Animated arc */}
            <motion.div
              className="absolute inset-0 border-4 border-transparent border-t-gold rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            {/* Inner pulsing circle */}
            <motion.div
              className="absolute inset-3 bg-gold/30 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>

        {/* Title */}
        <motion.h2
          className="text-2xl font-bold text-center text-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Analisi del preventivo in corso
        </motion.h2>

        {/* Progress steps */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loadingSteps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = completedSteps.includes(index);
              const shouldShow = index <= currentStep;

              if (!shouldShow) return null;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    height: "auto"
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-4 bg-card-bg/50 border border-border/50 rounded-lg p-4">
                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-gold rounded-full flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      ) : isActive ? (
                        <motion.div className="w-6 h-6 relative">
                          <motion.div
                            className="absolute inset-0 border-2 border-gold/30 rounded-full"
                          />
                          <motion.div
                            className="absolute inset-0 border-2 border-transparent border-t-gold rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        </motion.div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-border rounded-full" />
                      )}
                    </div>

                    {/* Step text */}
                    <motion.p
                      className={`flex-1 ${
                        isActive
                          ? "text-foreground font-medium"
                          : isCompleted
                          ? "text-foreground/60"
                          : "text-foreground/40"
                      }`}
                      animate={
                        isActive
                          ? {
                              opacity: [0.7, 1, 0.7],
                            }
                          : {}
                      }
                      transition={
                        isActive
                          ? {
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                          : {}
                      }
                    >
                      {step.text}
                    </motion.p>

                    {/* Thinking dots animation for active step */}
                    {isActive && (
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-gold rounded-full"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <motion.div
          className="mt-8 bg-card-bg/50 border border-border/50 rounded-full h-2 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-gold to-gold-light"
            initial={{ width: "0%" }}
            animate={{
              width: `${(currentStep / loadingSteps.length) * 100}%`
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>

        {/* Percentage */}
        <motion.p
          className="text-center text-foreground/60 text-sm mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {Math.round((currentStep / loadingSteps.length) * 100)}% completato
        </motion.p>
      </div>
    </div>
  );
}
