"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DocumentForm from "@/app/components/DocumentForm";

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

  const handleDocumentSubmit = async (documentData: any) => {
    try {
      setIsGenerating(true);
      setGenerationStep("Preparazione dati...");

      // Fase 1: Chiama LLM per generare testo formattato
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
        const error = await generateRes.json();
        throw new Error(error.error || "Errore nella generazione del testo");
      }

      const { testo } = await generateRes.json();
      console.log("✅ Testo generato:", testo);

      // Fase 2: Genera documento Word (da implementare)
      setGenerationStep("Generazione documento Word...");
      // TODO: Chiamare API per generare Word con il testo formattato

      setIsGenerating(false);
      alert("Documento generato con successo! (Download da implementare)");
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

  return (
    <div className="min-h-screen bg-background relative">
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
      <div className="bg-card-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-foreground hover:text-gold transition-colors"
            >
              ← Indietro
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{preventivo.fileName}</h1>
              <p className="text-sm text-foreground/60">
                Caricato il {new Date(preventivo.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              preventivo.status === "PARSED"
                ? "bg-green-500/20 text-green-500"
                : "bg-yellow-500/20 text-yellow-500"
            }`}>
              {preventivo.status}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!data ? (
          <div className="bg-card-bg border border-border rounded-xl p-8 text-center">
            <p className="text-foreground/60">
              Nessun dato estratto disponibile. Il preventivo è ancora in elaborazione.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab per selezionare tipo documento */}
            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setTipoDocumento("AFFIDAMENTO")}
                className={`px-6 py-3 font-medium transition-colors ${
                  tipoDocumento === "AFFIDAMENTO"
                    ? "text-gold border-b-2 border-gold"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                Affidamento
              </button>
              <button
                disabled
                className="px-6 py-3 font-medium text-foreground/30 cursor-not-allowed"
                title="Disponibile prossimamente"
              >
                Proposta Affidamento
              </button>
              <button
                disabled
                className="px-6 py-3 font-medium text-foreground/30 cursor-not-allowed"
                title="Disponibile prossimamente"
              >
                Determina
              </button>
            </div>

            {/* Form compilazione documento */}
            {tipoDocumento === "AFFIDAMENTO" && (
              <DocumentForm
                extractedData={data}
                userName={preventivo.user.name || ""}
                userEmail={preventivo.user.email}
                userTelefono={preventivo.user.telefono || ""}
                onSubmit={handleDocumentSubmit}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
