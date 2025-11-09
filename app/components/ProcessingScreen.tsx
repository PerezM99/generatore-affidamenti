"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ProcessingStep {
  id: number;
  text: string;
  duration: number;
}

// Passi per upload e estrazione PDF (veloce, ~2-3 secondi)
const uploadSteps: ProcessingStep[] = [
  { id: 1, text: "Caricamento del preventivo...", duration: 800 },
  { id: 2, text: "Estrazione del testo dal PDF...", duration: 1500 },
  { id: 3, text: "Salvataggio nel database...", duration: 700 },
];

// Passi per parsing con LLM (lento, 10-30 secondi)
const llmSteps: ProcessingStep[] = [
  { id: 1, text: "Connessione al modello AI locale (Ollama)...", duration: 2000 },
  { id: 2, text: "Invio del testo al modello Qwen...", duration: 1500 },
  { id: 3, text: "Analisi del contenuto del preventivo...", duration: 8000 },
  { id: 4, text: "Estrazione importi e aliquote IVA...", duration: 5000 },
  { id: 5, text: "Identificazione dati fornitore...", duration: 4000 },
  { id: 6, text: "Riconoscimento date e scadenze...", duration: 3000 },
  { id: 7, text: "Validazione e salvataggio dati...", duration: 2000 },
];

interface ProcessingScreenProps {
  phase?: "upload" | "llm-parsing"; // Fase corrente
}

export default function ProcessingScreen({ phase = "upload" }: ProcessingScreenProps) {
  const processingSteps = phase === "upload" ? uploadSteps : llmSteps;
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep < processingSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, processingSteps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Aggiorna progressbar
  useEffect(() => {
    const totalSteps = processingSteps.length;
    const newProgress = ((currentStep + 1) / totalSteps) * 100;
    setProgress(newProgress);
  }, [currentStep]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full px-8">
        {/* Logo e titolo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gold/20 rounded-2xl mb-6"
          >
            <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Elaborazione in corso
          </h2>
          <p className="text-foreground/60">
            Stiamo analizzando il tuo preventivo con l'AI
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gold to-gold-dark rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-foreground/60">
              Progresso
            </span>
            <span className="text-sm font-semibold text-gold">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Steps list */}
        <div className="space-y-3">
          {processingSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? "border-gold bg-gold/5 shadow-lg shadow-gold/10"
                    : isCompleted
                    ? "border-gold/30 bg-gold/5"
                    : "border-border bg-card-bg/50"
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-gold text-background"
                      : isCurrent
                      ? "bg-gold/20 text-gold"
                      : "bg-border text-foreground/40"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </motion.div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>

                {/* Text */}
                <span
                  className={`flex-1 text-sm font-medium transition-colors ${
                    isCurrent
                      ? "text-gold"
                      : isCompleted
                      ? "text-foreground"
                      : "text-foreground/40"
                  }`}
                >
                  {step.text}
                </span>

                {/* Duration indicator for current step */}
                {isCurrent && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-gold"
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 p-4 bg-card-bg border border-border rounded-xl"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              {phase === "upload" ? (
                <>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Estrazione testo
                  </p>
                  <p className="text-xs text-foreground/60">
                    Stiamo estraendo il testo dal PDF. Questo processo richiede circa 2-3 secondi.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Analisi con AI locale
                  </p>
                  <p className="text-xs text-foreground/60">
                    Il modello Qwen (Ollama) sta analizzando il documento per estrarre automaticamente
                    importi, dati del fornitore, descrizioni e date. Questo processo può richiedere 20-30 secondi.
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
