"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import DocumentForm from "@/app/components/DocumentForm";
import FornitoreConflictResolver from "@/app/components/FornitoreConflictResolver";
import SuccessModal from "@/app/components/SuccessModal";

// Tipi
interface ExtractedData {
  fornitore?: {
    ragioneSociale?: string;
    codiceFiscale?: string;
    partitaIva?: string;
    indirizzo?: string;
    cap?: string;
    comune?: string;
    provincia?: string;
    email?: string;
    pec?: string;
    telefono?: string;
  };
  oggetto?: string;
  tipoAffidamento?: "fornitura" | "servizi" | "lavori";
  numeroPreventivo?: string;
  numeroProtocollo?: string;
  dataProtocollo?: string;
  dataPreventivo?: string;
  vociPreventivo?: Array<{
    descrizione: string;
    quantita?: number;
    prezzoUnitario?: number;
    iva?: number;
  }>;
  importoImponibile?: number;
  importoIva?: number;
  importoTotale?: number;
  aliquotaIva?: number;
  tempiConsegna?: string;
  validitaOfferta?: string;
  condizioniPagamento?: string;
  note?: string;
}

interface Preventivo {
  id: string;
  fileName: string;
  status: string;
  extractedData: ExtractedData | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    telefono: string | null;
  };
  fornitore: any | null;
  affidamenti: any[];
  createdAt: string;
}

export default function PreventivoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [preventivo, setPreventivo] = useState<Preventivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<"AFFIDAMENTO" | "PROPOSTA" | "DETERMINA">("AFFIDAMENTO");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [showConflictResolver, setShowConflictResolver] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });

  // Redirect se non autenticato
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  // Carica i dati del preventivo
  useEffect(() => {
    if (!params.id || sessionStatus !== "authenticated") return;

    const fetchPreventivo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/preventivi/${params.id}`);

        if (!response.ok) {
          throw new Error("Errore nel caricamento del preventivo");
        }

        const data = await response.json();
        setPreventivo(data.preventivo);

        // Verifica se ci sono conflitti da risolvere
        const extractedData = data.preventivo.extractedData;
        if (extractedData?._fornitoreMatch?.needsUserInput) {
          setShowConflictResolver(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore sconosciuto");
      } finally {
        setLoading(false);
      }
    };

    fetchPreventivo();
  }, [params.id, sessionStatus]);

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card-bg border border-border rounded-xl p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-4">Errore</h2>
          <p className="text-foreground mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gold text-background px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors"
          >
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleConflictResolve = async (resolvedData: Record<string, string>) => {
    try {
      const matchData = preventivo?.extractedData?._fornitoreMatch;
      if (!matchData?.fornitoreId) {
        alert("Errore: ID fornitore non trovato");
        return;
      }

      // Aggiorna il fornitore nel database con i dati risolti
      const updateRes = await fetch(`/api/fornitori/${matchData.fornitoreId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedData: resolvedData }),
      });

      if (!updateRes.ok) {
        throw new Error("Errore durante l'aggiornamento del fornitore");
      }

      // Ricarica il preventivo per avere i dati aggiornati
      const response = await fetch(`/api/preventivi/${params.id}`);
      const data = await response.json();

      // Rimuovi il flag needsUserInput
      if (data.preventivo.extractedData?._fornitoreMatch) {
        data.preventivo.extractedData._fornitoreMatch.needsUserInput = false;
      }

      setPreventivo(data.preventivo);
      setShowConflictResolver(false);

      // Mostra modal di successo
      setSuccessMessage({
        title: "Dati aggiornati!",
        message: "Il fornitore è stato aggiornato nel database con i dati selezionati.",
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Errore risoluzione conflitti:", error);
      alert(error instanceof Error ? error.message : "Errore durante la risoluzione dei conflitti");
    }
  };

  const handleConflictCancel = () => {
    // L'utente può procedere senza risolvere i conflitti
    // In questo caso useremo i dati merged (che usano DB come default)
    setShowConflictResolver(false);
  };

  const handleDocumentSubmit = async (documentData: any) => {
    try {
      setIsGenerating(true);
      setGenerationStep("Preparazione dati...");

      // Fase 1 e 2: Genera testo con LLM e documento Word
      setGenerationStep("Generazione testo del documento...");
      const generateRes = await fetch("/api/affidamenti/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoDocumento,
          datiCompilati: documentData,
        }),
      });

      if (!generateRes.ok) {
        const errorData = await generateRes.json();
        throw new Error(errorData.error || "Errore nella generazione del documento");
      }

      setGenerationStep("Download documento Word...");

      // Scarica il file Word
      const blob = await generateRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Estrai il nome file dall'header Content-Disposition (se presente)
      const contentDisposition = generateRes.headers.get("Content-Disposition");
      let fileName = `Affidamento_${documentData.F_Ragione?.replace(/[^a-zA-Z0-9]/g, "_") || "Fornitore"}_${new Date().toISOString().split("T")[0]}.docx`;

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setIsGenerating(false);

      // Mostra modal di successo
      setSuccessMessage({
        title: "Documento generato!",
        message: "Il documento Word è stato generato e scaricato con successo.",
      });
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Errore generazione documento:", error);
      setIsGenerating(false);
      alert(error instanceof Error ? error.message : "Errore nella generazione del documento");
    }
  };

  if (!preventivo) {
    return null;
  }

  const data = preventivo.extractedData;
  const matchData = data?._fornitoreMatch;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          title={successMessage.title}
          message={successMessage.message}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Risoluzione conflitti fornitore */}
      {showConflictResolver && matchData?.needsUserInput && (
        <FornitoreConflictResolver
          matchData={matchData}
          ragioneSociale={data?.fornitore?.ragioneSociale || "Fornitore sconosciuto"}
          onResolve={handleConflictResolve}
          onCancel={handleConflictCancel}
        />
      )}

      {/* Schermata di caricamento durante generazione */}
      {isGenerating && (
        <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center">
          <div className="bg-card-bg border border-border rounded-xl p-12 max-w-md text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gold mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gold mb-2">Generazione in corso...</h2>
            <p className="text-foreground/80 text-lg">{generationStep}</p>
            <p className="text-foreground/60 text-sm mt-4">
              Attendere prego, il sistema sta elaborando il documento.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-card-bg border-b border-border/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="text-foreground/70 hover:text-gold transition-colors flex items-center gap-2 text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Indietro
            </motion.button>
            <div className="border-l border-border/50 pl-6">
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">{preventivo.fileName}</h1>
              <p className="text-sm text-foreground/50 mt-1">
                Caricato il {new Date(preventivo.createdAt).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              preventivo.status === "PARSED"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
            }`}>
              {preventivo.status}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-8 py-12"
      >
        {!data ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card-bg border border-border/50 rounded-2xl p-12 text-center"
          >
            <p className="text-foreground/60 text-lg">
              Nessun dato estratto disponibile. Il preventivo è ancora in elaborazione.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Tab per selezionare tipo documento */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3 border-b border-border/30"
            >
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTipoDocumento("AFFIDAMENTO")}
                className={`px-8 py-4 font-medium transition-all text-base relative ${
                  tipoDocumento === "AFFIDAMENTO"
                    ? "text-gold"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                Affidamento
                {tipoDocumento === "AFFIDAMENTO" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
              <button
                disabled
                className="px-8 py-4 font-medium text-foreground/20 cursor-not-allowed text-base"
                title="Disponibile prossimamente"
              >
                Proposta Affidamento
              </button>
              <button
                disabled
                className="px-8 py-4 font-medium text-foreground/20 cursor-not-allowed text-base"
                title="Disponibile prossimamente"
              >
                Determina
              </button>
            </motion.div>

            {/* Form compilazione documento */}
            {tipoDocumento === "AFFIDAMENTO" && (
              <motion.div
                key="affidamento-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <DocumentForm
                  extractedData={data}
                  userName={preventivo.user.name || ""}
                  userEmail={preventivo.user.email}
                  userTelefono={preventivo.user.telefono || ""}
                  onSubmit={handleDocumentSubmit}
                />
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
