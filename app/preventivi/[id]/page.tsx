"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import FornitoreConflictResolver from "@/app/components/FornitoreConflictResolver";
import { numberToWords } from "@/lib/number-to-words";

// Tipi
interface ExtractedData {
  fornitore?: {
    ragioneSociale?: string;
    indirizzo?: string;
    capComuneProvincia?: string;
    email?: string;
    pec?: string;
    partitaIva?: string;
  };
  descrizioneSintetica?: string;
  descrizioneEstesa?: string;
  tipoAffidamento?: "fornitura" | "servizi" | "lavori";
  vociPreventivo?: Array<{
    descrizione: string;
    quantita?: number;
    prezzoUnitario?: number;
  }>;
  importoImponibile?: number;
  condizioniRilevanti?: string[];
  numeroProtocollo?: string; // Estratto con regex (es. "5229/2025")
  dataProtocollo?: string;   // Estratto con regex (es. "11/09/2025")
  _fornitoreMatch?: any;
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
  createdAt: string;
}

interface Dirigente {
  id: string;
  titolo: string;
  nome: string;
  cognome: string;
  ruolo: "GENERALE" | "AREA_TERRITORIO";
}

interface RUP {
  id: string;
  titolo: string;
  nome: string;
  cognome: string;
}

export default function PreventivoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [preventivo, setPreventivo] = useState<Preventivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<"AFFIDAMENTO" | "PROPOSTA" | "DETERMINA">("AFFIDAMENTO");
  const [showConflictResolver, setShowConflictResolver] = useState(false);

  // Form fields
  const [metodoInvio, setMetodoInvio] = useState("PEC");
  const [lettera, setLettera] = useState<"a)" | "b)">("b)");
  const [tipoServizioFornitura, setTipoServizioFornitura] = useState<"servizi" | "fornitura">("fornitura");
  const [oggetto, setOggetto] = useState("");
  const [cup, setCup] = useState("");
  const [codiceLavoro, setCodiceLavoro] = useState("");
  const [capitoloBilancio, setCapitoloBilancio] = useState("");
  const [cpvNumero, setCpvNumero] = useState("");
  const [cpvDescrizione, setCpvDescrizione] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [condizioni, setCondizioni] = useState("");
  const [tempistiche, setTempistiche] = useState("");
  const [prescrizioniTecniche, setPrescrizioniTecniche] = useState("");
  const [garanzie, setGaranzie] = useState("");
  const [importoImponibile, setImportoImponibile] = useState(0);

  // Dirigente e RUP
  const [dirigenteId, setDirigenteId] = useState("");
  const [rupId, setRupId] = useState("");
  const [dataPropostaRup, setDataPropostaRup] = useState("");
  const [dirigenti, setDirigenti] = useState<Dirigente[]>([]);
  const [rups, setRups] = useState<RUP[]>([]);

  // Dati fornitore
  const [fRagione, setFRagione] = useState("");
  const [fCfIva, setFCfIva] = useState("");
  const [fIndirizzo, setFIndirizzo] = useState("");
  const [fCapComuneProv, setFCapComuneProv] = useState("");
  const [fMail, setFMail] = useState("");
  const [fPec, setFPec] = useState("");

  // Mostra campi opzionali
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Ref per textarea auto-espandibile
  const descrizioneRef = useRef<HTMLTextAreaElement>(null);

  // Riferimenti
  const [pNumero, setPNumero] = useState("");
  const [pData, setPData] = useState("");
  const [numeroPreventivo, setNumeroPreventivo] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);

  // Redirect se non autenticato
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  // Carica dirigenti e RUP
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dirigentiRes, rupsRes] = await Promise.all([
          fetch("/api/dirigenti"),
          fetch("/api/rup"),
        ]);

        if (dirigentiRes.ok) {
          const data = await dirigentiRes.json();
          setDirigenti(data.dirigenti);
        }

        if (rupsRes.ok) {
          const data = await rupsRes.json();
          setRups(data.rups);
        }
      } catch (error) {
        console.error("Errore caricamento dati:", error);
      }
    };

    fetchData();
  }, []);

  // Carica preventivo
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

        // Pre-compila form con dati estratti
        const extracted = data.preventivo.extractedData;
        if (extracted) {
          // Oggetto e descrizioni
          setOggetto(extracted.descrizioneSintetica || "");
          setDescrizione(extracted.descrizioneEstesa || "");

          // Condizioni rilevanti
          if (extracted.condizioniRilevanti && extracted.condizioniRilevanti.length > 0) {
            setCondizioni(extracted.condizioniRilevanti.join("\n"));
            setShowOptionalFields(true); // Mostra campi opzionali se ci sono dati estratti
          }

          // Fornitore
          if (extracted.fornitore) {
            setFRagione(extracted.fornitore.ragioneSociale || "");
            setFCfIva(extracted.fornitore.partitaIva || "");
            setFIndirizzo(extracted.fornitore.indirizzo || "");
            setFCapComuneProv(extracted.fornitore.capComuneProvincia || "");
            setFMail(extracted.fornitore.email || "");
            setFPec(extracted.fornitore.pec || "");
          }

          // Protocollo (estratto con regex)
          if (extracted.numeroProtocollo) {
            setPNumero(extracted.numeroProtocollo);
          }
          if (extracted.dataProtocollo) {
            setPData(extracted.dataProtocollo);
          }

          // Importo
          if (extracted.importoImponibile) {
            setImportoImponibile(extracted.importoImponibile);
          }

          // Tipo affidamento
          if (extracted.tipoAffidamento === "lavori") {
            setLettera("a)");
          } else {
            setLettera("b)");
            setTipoServizioFornitura(extracted.tipoAffidamento === "servizi" ? "servizi" : "fornitura");
          }
        }

        // Verifica conflitti fornitore
        if (extracted?._fornitoreMatch?.needsUserInput) {
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

  // Auto-espandi textarea descrizione
  useEffect(() => {
    if (descrizioneRef.current) {
      descrizioneRef.current.style.height = "auto";
      descrizioneRef.current.style.height = descrizioneRef.current.scrollHeight + "px";
    }
  }, [descrizione]);

  const handleConflictResolve = async (resolvedData: Record<string, string>) => {
    try {
      const matchData = preventivo?.extractedData?._fornitoreMatch;
      if (!matchData?.fornitoreId) {
        alert("Errore: ID fornitore non trovato");
        return;
      }

      const updateRes = await fetch(`/api/fornitori/${matchData.fornitoreId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedData: resolvedData }),
      });

      if (!updateRes.ok) {
        throw new Error("Errore durante l'aggiornamento del fornitore");
      }

      const response = await fetch(`/api/preventivi/${params.id}`);
      const data = await response.json();

      if (data.preventivo.extractedData?._fornitoreMatch) {
        data.preventivo.extractedData._fornitoreMatch.needsUserInput = false;
      }

      setPreventivo(data.preventivo);
      setShowConflictResolver(false);
    } catch (error) {
      console.error("Errore risoluzione conflitti:", error);
      alert(error instanceof Error ? error.message : "Errore durante la risoluzione dei conflitti");
    }
  };

  const handleConflictCancel = () => {
    setShowConflictResolver(false);
  };

  const handleGenerate = async () => {
    if (!preventivo) return;

    setIsGenerating(true);

    try {
      const dirigenteSelezionato = dirigenti.find((d) => d.id === dirigenteId);
      const rupSelezionato = rups.find((r) => r.id === rupId);

      const totaleNumero = importoImponibile;
      const totaleLettere = numberToWords(totaleNumero);

      // Costruisci proposta RUP
      let proposta = "";
      if (rupSelezionato && dirigenteId !== rupId) {
        proposta = `vista la proposta del Responsabile Unico del Progetto ${rupSelezionato.titolo} ${rupSelezionato.nome} ${rupSelezionato.cognome}`;
        if (totaleNumero > 5000 && dataPropostaRup) {
          proposta += ` in data ${dataPropostaRup}`;
        }
      }

      const riferimento = numeroPreventivo
        ? `al preventivo n. ${numeroPreventivo}`
        : "al preventivo";

      const documentData = {
        // Dati fornitore
        F_Ragione: fRagione,
        F_CF_IVA: fCfIva,
        F_Indirizzo: fIndirizzo,
        F_CAP_Comune_Prov: fCapComuneProv,
        F_Mail: fMail,
        F_Pec: fPec,

        // Metadati
        Metodo_Invio: metodoInvio,
        Lettera: lettera,
        Tipo_Servizio_Fornitura: tipoServizioFornitura,
        Oggetto: oggetto,
        CUP: cup,
        Codice_Lavoro: codiceLavoro,
        Capitolo_Bilancio: capitoloBilancio,
        CPV_Numero: cpvNumero,
        CPV_Descrizione: cpvDescrizione,

        // Riferimenti
        Riferimento: riferimento,
        P_Numero: pNumero,
        P_Data: pData,

        // Proposta
        Proposta: proposta,

        // Descrizioni
        Descrizione: descrizione,
        Condizioni: condizioni,
        Tempistiche: tempistiche,
        Prescrizioni_Tecniche: prescrizioniTecniche,
        Garanzie: garanzie,

        // Importi
        Totale_Numero: totaleNumero,
        Totale_Lettere: totaleLettere,

        // Dirigente
        Direttore_Nome: dirigenteSelezionato
          ? `${dirigenteSelezionato.titolo} ${dirigenteSelezionato.nome} ${dirigenteSelezionato.cognome}`
          : "",
        Direttore_Ruolo: dirigenteSelezionato?.ruolo === "GENERALE" ? "GENERALE" : "AREA TERRITORIO",

        // Referente
        R_Nome: preventivo.user.name || "",
        R_Interno: preventivo.user.telefono || "",
        R_Mail: preventivo.user.email,

        // IDs
        dirigenteId,
        rupId: rupId || null,
        dataPropostaRup: dataPropostaRup || null,
      };

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

      // Download file
      const blob = await generateRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tipoDocumento}_${fRagione.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert("Documento generato con successo!");
    } catch (error) {
      console.error("Errore generazione:", error);
      alert(error instanceof Error ? error.message : "Errore nella generazione del documento");
    } finally {
      setIsGenerating(false);
    }
  };

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

  if (!preventivo || !preventivo.extractedData) {
    return null;
  }

  const data = preventivo.extractedData;
  const matchData = data._fornitoreMatch;

  const dirigenteSelezionato = dirigenti.find((d) => d.id === dirigenteId);
  const rupSelezionato = rups.find((r) => r.id === rupId);
  const mostraProposta = rupSelezionato && dirigenteId !== rupId;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Modal conflitti */}
      {showConflictResolver && matchData?.needsUserInput && (
        <FornitoreConflictResolver
          matchData={matchData}
          ragioneSociale={data.fornitore?.ragioneSociale || "Fornitore sconosciuto"}
          onResolve={handleConflictResolve}
          onCancel={handleConflictCancel}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card-bg border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-8 py-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-foreground/70 hover:text-gold transition-colors flex items-center gap-2 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Indietro
          </button>
          <h1 className="text-2xl font-semibold text-foreground">{preventivo.fileName}</h1>
          <p className="text-sm text-foreground/50 mt-1">
            Generazione documento
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex gap-3 border-b border-border/30 mt-8">
          <button
            onClick={() => setTipoDocumento("AFFIDAMENTO")}
            className={`px-8 py-4 font-medium transition-all relative ${
              tipoDocumento === "AFFIDAMENTO" ? "text-gold" : "text-foreground/60 hover:text-foreground"
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
          </button>
          <button
            onClick={() => setTipoDocumento("PROPOSTA")}
            className={`px-8 py-4 font-medium transition-all relative ${
              tipoDocumento === "PROPOSTA" ? "text-gold" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Proposta Affidamento
            {tipoDocumento === "PROPOSTA" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          <button
            onClick={() => setTipoDocumento("DETERMINA")}
            className={`px-8 py-4 font-medium transition-all relative ${
              tipoDocumento === "DETERMINA" ? "text-gold" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Determina
            {tipoDocumento === "DETERMINA" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-card-bg border border-border rounded-xl p-8">
          <form className="space-y-8">
            {/* Sezione Fornitore */}
            <div>
              <h3 className="text-lg font-bold text-gold mb-4">Dati Fornitore</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ragione Sociale</label>
                  <input
                    type="text"
                    value={fRagione}
                    onChange={(e) => setFRagione(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CF/P.IVA</label>
                  <input
                    type="text"
                    value={fCfIva}
                    onChange={(e) => setFCfIva(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Indirizzo</label>
                  <input
                    type="text"
                    value={fIndirizzo}
                    onChange={(e) => setFIndirizzo(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    placeholder="Via Europa, 30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CAP Comune (Provincia)</label>
                  <input
                    type="text"
                    value={fCapComuneProv}
                    onChange={(e) => setFCapComuneProv(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    placeholder="46100 Mantova (MN)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={fMail}
                    onChange={(e) => setFMail(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">PEC</label>
                  <input
                    type="email"
                    value={fPec}
                    onChange={(e) => setFPec(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Oggetto e Descrizione */}
            <div>
              <h3 className="text-lg font-bold text-gold mb-6">Oggetto Affidamento</h3>
              <div className="space-y-6">
                {/* Oggetto Sintetico con Contesto */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Oggetto (sintetico)
                  </label>
                  <div className="bg-background/50 border border-border/50 rounded-lg p-4 mb-3">
                    <p className="text-foreground/90 leading-relaxed">
                      Affidamento diretto, ai sensi dell'art. 50, comma 1, lettera{" "}
                      <select
                        value={lettera}
                        onChange={(e) => setLettera(e.target.value as "a)" | "b)")}
                        className="inline-block mx-1 px-2 py-1 bg-background border border-border rounded text-foreground font-medium"
                      >
                        <option value="a)">a) lavori</option>
                        <option value="b)">b) servizi/forniture</option>
                      </select>
                      {" "}del D.Lgs. 36/2023,{" "}
                      <span className="text-gold font-medium">[completa qui sotto]</span>
                    </p>
                  </div>
                  <input
                    type="text"
                    value={oggetto}
                    onChange={(e) => setOggetto(e.target.value)}
                    className="w-full px-4 py-3 bg-background border-2 border-gold/30 rounded-lg text-foreground text-base"
                    placeholder="della fornitura di..."
                  />
                  <p className="text-xs text-foreground/50 mt-2">
                    Inizia con "della fornitura di...", "del servizio di..." o "per i lavori di..."
                  </p>
                </div>

                {/* Descrizione Estesa con Contesto Completo */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Descrizione (estesa)
                  </label>
                  <div className="bg-background/50 border border-border/50 rounded-lg p-4 mb-3">
                    <p className="text-foreground/90 leading-relaxed">
                      Con riferimento{" "}
                      <span className="text-gold font-medium">
                        {numeroPreventivo ? `al preventivo n. ${numeroPreventivo}` : "al preventivo"}
                      </span>
                      {" "}recepito a protocollo con n.{" "}
                      <span className="text-gold font-medium">
                        {pNumero || "XXXX/20XX"}
                      </span>
                      {" "}del{" "}
                      <span className="text-gold font-medium">
                        {pData || "XX/XX/XXXX"}
                      </span>
                      , si affida alla spettabile ditta{" "}
                      <span className="text-gold font-medium">
                        {fRagione || "[RAGIONE SOCIALE]"}
                      </span>
                      {" "}– C.F./p.IVA{" "}
                      <span className="text-gold font-medium">
                        {fCfIva || "XXXXXXXXXXXXX"}
                      </span>
                      {" "}
                      <span className="text-gold font-medium">[completa qui sotto]</span>
                    </p>
                  </div>
                  <textarea
                    ref={descrizioneRef}
                    value={descrizione}
                    onChange={(e) => setDescrizione(e.target.value)}
                    className="w-full px-4 py-3 bg-background border-2 border-gold/30 rounded-lg text-foreground text-base resize-none overflow-hidden"
                    style={{ minHeight: "150px" }}
                    placeholder="la fornitura di:&#10;- N. 1 ...&#10;- N. 2 ..."
                  />
                  <p className="text-xs text-foreground/50 mt-2">
                    Se ci sono voci con quantità, usa formato: "la fornitura di: - N. X ..., al costo unitario di € ... + IVA"
                  </p>
                </div>
              </div>
            </div>

            {/* Codici e Riferimenti */}
            <div>
              <h3 className="text-lg font-bold text-gold mb-4">Codici e Riferimenti</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CUP - Solo per lavori */}
                {lettera === "a)" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      CUP <span className="text-xs text-foreground/60">(solo per lavori)</span>
                    </label>
                    <input
                      type="text"
                      value={cup}
                      onChange={(e) => setCup(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>
                )}

                {/* Codice Lavoro - Solo per lavori */}
                {lettera === "a)" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Codice Lavoro <span className="text-xs text-foreground/60">(solo per lavori)</span>
                    </label>
                    <input
                      type="text"
                      value={codiceLavoro}
                      onChange={(e) => setCodiceLavoro(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CPV - Numero</label>
                  <input
                    type="text"
                    value={cpvNumero}
                    onChange={(e) => setCpvNumero(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    placeholder="30200000-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CPV - Descrizione</label>
                  <input
                    type="text"
                    value={cpvDescrizione}
                    onChange={(e) => setCpvDescrizione(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    placeholder="Apparecchiature per elaboratori"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Capitolo Bilancio</label>
                  <input
                    type="text"
                    value={capitoloBilancio}
                    onChange={(e) => setCapitoloBilancio(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Numero Preventivo</label>
                  <input
                    type="text"
                    value={numeroPreventivo}
                    onChange={(e) => setNumeroPreventivo(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">N. Protocollo</label>
                  <input
                    type="text"
                    value={pNumero}
                    onChange={(e) => setPNumero(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    placeholder="1234/2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Data Protocollo</label>
                  <input
                    type="text"
                    value={pData}
                    onChange={(e) => setPData(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    placeholder="15/01/2024"
                  />
                </div>
              </div>
            </div>

            {/* Dirigente e RUP */}
            <div>
              <h3 className="text-lg font-bold text-gold mb-4">Dirigente e RUP</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Dirigente</label>
                  <select
                    value={dirigenteId}
                    onChange={(e) => setDirigenteId(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="">Seleziona dirigente</option>
                    {dirigenti.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.titolo} {d.nome} {d.cognome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">RUP (opzionale)</label>
                  <select
                    value={rupId}
                    onChange={(e) => setRupId(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="">Nessuno (stesso del dirigente)</option>
                    {rups.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.titolo} {r.nome} {r.cognome}
                      </option>
                    ))}
                  </select>
                </div>
                {mostraProposta && importoImponibile > 5000 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Data Proposta RUP
                    </label>
                    <input
                      type="text"
                      value={dataPropostaRup}
                      onChange={(e) => setDataPropostaRup(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                      placeholder="15/01/2024"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Condizioni e Note Opzionali */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gold">
                  Condizioni e Note <span className="text-xs text-foreground/60 font-normal">(opzionale)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg text-gold transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${showOptionalFields ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {showOptionalFields ? "Nascondi campi" : "Aggiungi campi opzionali"}
                </button>
              </div>

              {showOptionalFields && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Condizioni</label>
                    <textarea
                      value={condizioni}
                      onChange={(e) => setCondizioni(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tempistiche</label>
                    <textarea
                      value={tempistiche}
                      onChange={(e) => setTempistiche(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Prescrizioni Tecniche</label>
                    <textarea
                      value={prescrizioniTecniche}
                      onChange={(e) => setPrescrizioniTecniche(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Garanzie</label>
                    <textarea
                      value={garanzie}
                      onChange={(e) => setGaranzie(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Importo */}
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gold mb-4">Importo Totale (IVA esclusa)</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-2">Importo € + IVA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={importoImponibile}
                    onChange={(e) => setImportoImponibile(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-background border-2 border-gold/30 rounded-lg text-foreground text-xl font-bold"
                  />
                </div>
              </div>
              <p className="text-sm text-foreground/60 mt-3">
                {numberToWords(importoImponibile)}
              </p>
            </div>

            {/* Pulsante genera */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !dirigenteId}
              className="w-full bg-gold text-background px-6 py-4 rounded-lg font-bold text-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generazione in corso..." : `Genera ${tipoDocumento}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
