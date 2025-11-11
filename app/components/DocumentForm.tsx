"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExtractedData } from "@/lib/llm-parser";
import { numberToWords } from "@/lib/number-to-words";
import TextInput from "./ui/TextInput";
import SelectInput from "./ui/SelectInput";
import TextAreaInput from "./ui/TextAreaInput";

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

interface DocumentFormProps {
  extractedData: ExtractedData;
  userName: string;
  userEmail: string;
  userTelefono: string;
  onSubmit: (data: any) => void;
}

export default function DocumentForm({
  extractedData,
  userName,
  userEmail,
  userTelefono,
  onSubmit,
}: DocumentFormProps) {
  // Stati per i campi del form
  const [metodoInvio, setMetodoInvio] = useState("PEC");
  const [lettera, setLettera] = useState<"a)" | "b)">(
    extractedData.tipoAffidamento === "lavori" ? "a)" : "b)"
  );
  const [tipoServizioFornitura, setTipoServizioFornitura] = useState<"servizi" | "fornitura">(
    extractedData.tipoAffidamento === "servizi" ? "servizi" : "fornitura"
  );
  const [oggetto, setOggetto] = useState(extractedData.oggetto || "");
  const [cup, setCup] = useState("");
  const [codiceLavoro, setCodiceLavoro] = useState("");
  const [capitoloBilancio, setCapitoloBilancio] = useState("");
  const [cpv, setCpv] = useState("");
  const [descrizione, setDescrizione] = useState(() => {
    // Genera descrizione fluente dalle voci
    if (extractedData.vociPreventivo && extractedData.vociPreventivo.length > 0) {
      const tipo = extractedData.tipoAffidamento || "fornitura";
      const articolo = tipo === "servizi" ? "del servizio di" : tipo === "fornitura" ? "la fornitura dei seguenti beni" : "dei lavori di";

      const voci = extractedData.vociPreventivo.map((v) => {
        const qta = v.quantita ? `N. ${v.quantita} ` : "";
        const prezzo = v.prezzoUnitario ? `, al costo unitario di € ${v.prezzoUnitario.toFixed(2)} + IVA` : "";
        return `${qta}${v.descrizione}${prezzo}`;
      }).join("\n"); // Usa a capo invece di `;`

      return `${articolo}:\n${voci}`;
    }
    return extractedData.oggetto || "";
  });
  const [condizioni, setCondizioni] = useState(extractedData.condizioniPagamento || "");
  const [tempistiche, setTempistiche] = useState(extractedData.tempiConsegna || "");
  const [prescrizioniTecniche, setPrescrizioniTecniche] = useState("");
  const [garanzie, setGaranzie] = useState("");

  // Selezione dirigente e RUP
  const [dirigenteId, setDirigenteId] = useState("");
  const [rupId, setRupId] = useState("");
  const [dataPropostaRup, setDataPropostaRup] = useState("");

  // Liste da API
  const [dirigenti, setDirigenti] = useState<Dirigente[]>([]);
  const [rups, setRups] = useState<RUP[]>([]);

  // Dati fornitore (editabili)
  const [fRagione, setFRagione] = useState(extractedData.fornitore?.ragioneSociale || "");
  const [fCfIva, setFCfIva] = useState(
    extractedData.fornitore?.partitaIva || extractedData.fornitore?.codiceFiscale || ""
  );
  const [fIndirizzo, setFIndirizzo] = useState(extractedData.fornitore?.indirizzo || "");
  const [fCap, setFCap] = useState(extractedData.fornitore?.cap || "");
  const [fComune, setFComune] = useState(extractedData.fornitore?.comune || "");
  const [fProvincia, setFProvincia] = useState(extractedData.fornitore?.provincia || "");
  const [fMail, setFMail] = useState(extractedData.fornitore?.email || "");
  const [fPec, setFPec] = useState(extractedData.fornitore?.pec || "");

  // Riferimenti
  const riferimento = extractedData.numeroPreventivo
    ? `al preventivo n. ${extractedData.numeroPreventivo}`
    : "al preventivo";
  const pNumero = extractedData.numeroProtocollo || "";
  const pData = extractedData.dataProtocollo || "";
  const totaleNumero = extractedData.importoImponibile || 0;
  const totaleLettere = numberToWords(totaleNumero);

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
        console.error("Errore nel caricamento dati:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dirigenteSelezionato = dirigenti.find((d) => d.id === dirigenteId);
    const rupSelezionato = rups.find((r) => r.id === rupId);

    // Costruisci testo proposta RUP
    let proposta = "";
    if (rupSelezionato && dirigenteId !== rupId) {
      proposta = `vista la proposta del Responsabile Unico del Progetto ${rupSelezionato.titolo} ${rupSelezionato.nome} ${rupSelezionato.cognome}`;
      if (totaleNumero > 5000 && dataPropostaRup) {
        proposta += ` in data ${dataPropostaRup}`;
      }
    }

    const documentData = {
      // Dati fornitore
      F_Ragione: fRagione,
      F_CF_IVA: fCfIva,
      F_Indirizzo: fIndirizzo,
      F_Cap_Comune_Provincia: `${fCap} ${fComune}${fProvincia ? ` (${fProvincia})` : ""}`,
      F_Mail: fMail,
      F_Pec: fPec,

      // Metadati documento
      Metodo_Invio: metodoInvio,
      Lettera: lettera,
      Oggetto: oggetto,
      CUP: cup,
      Codice_Lavoro: codiceLavoro,
      Capitolo_Bilancio: capitoloBilancio,
      CPV: cpv,

      // Riferimenti
      Riferimento: riferimento,
      P_Numero: pNumero,
      P_Data: pData,

      // Proposta RUP
      Proposta: proposta,

      // Descrizione e note
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
      R_Nome: userName,
      R_Interno: userTelefono,
      R_Mail: userEmail,

      // IDs per database
      dirigenteId,
      rupId: rupId || null,
      dataPropostaRup: dataPropostaRup || null,
    };

    onSubmit(documentData);
  };

  const dirigenteSelezionato = dirigenti.find((d) => d.id === dirigenteId);
  const rupSelezionato = rups.find((r) => r.id === rupId);
  const mostraProposta = rupSelezionato && dirigenteId !== rupId;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header del documento */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-card-bg border border-border/50 rounded-2xl p-10 space-y-6 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border/30 pb-4">
          <h2 className="text-xl font-semibold text-gold">Documento di Affidamento</h2>
          <span className="text-xs text-foreground/40 font-mono">M-APP-08A rev.00</span>
        </div>

        {/* Metodo invio (sx) e destinatario (dx) */}
        <div className="flex justify-between items-start">
          {/* Sinistra: Via */}
          <div className="flex items-center gap-4">
            <span className="text-foreground/70 text-base font-medium">Via</span>
            <SelectInput
              value={metodoInvio}
              onChange={(e) => setMetodoInvio(e.target.value)}
              className="w-auto min-w-[180px]"
            >
              <option>PEC</option>
              <option>Raccomandata</option>
              <option>Email</option>
            </SelectInput>
          </div>

          {/* Destra: Dati fornitore (uno per riga) */}
          <div className="text-right space-y-2.5 min-w-[450px]">
            <div className="text-foreground/60 text-sm font-medium">Spett.le</div>
            <TextInput
              type="text"
              value={fRagione}
              onChange={(e) => setFRagione(e.target.value)}
              placeholder="Ragione Sociale"
              className="text-right"
              variant="highlight"
              required
            />
            <TextInput
              type="text"
              value={fIndirizzo}
              onChange={(e) => setFIndirizzo(e.target.value)}
              placeholder="Via Roma, 10"
              className="text-right"
            />
            <TextInput
              type="text"
              value={`${fCap} ${fComune}${fProvincia ? ` (${fProvincia})` : ""}`}
              onChange={(e) => {
                const parts = e.target.value.split(" ");
                setFCap(parts[0] || "");
                const resto = parts.slice(1).join(" ");
                const match = resto.match(/^(.+?)\s*\(([A-Z]{2})\)$/);
                if (match) {
                  setFComune(match[1].trim());
                  setFProvincia(match[2]);
                } else {
                  setFComune(resto);
                }
              }}
              placeholder="46100 Mantova (MN)"
              className="text-right"
            />
            <TextInput
              type="email"
              value={fMail}
              onChange={(e) => setFMail(e.target.value)}
              placeholder="email@fornitore.it"
              className="text-right text-sm"
            />
            <TextInput
              type="email"
              value={fPec}
              onChange={(e) => setFPec(e.target.value)}
              placeholder="pec@fornitore.it"
              className="text-right text-sm"
            />
          </div>
        </div>

        {/* p.c. Ufficio gare */}
        <div className="text-foreground text-right pr-24">
          <div>p.c. Ufficio gare</div>
          <div>gare@gardachiese.it</div>
        </div>

        {/* Oggetto */}
        <div className="space-y-2 pt-4">
          <div className="flex justify-between items-start">
            <div className="font-bold text-foreground">OGGETTO:</div>
            <div className="flex-1 pl-12 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground">Affidamento diretto, ai sensi dell'art. 50, comma 1, lettera</span>
              <SelectInput
                value={lettera}
                onChange={(e) => setLettera(e.target.value as "a)" | "b)")}
                className="w-auto min-w-[200px]"
                required
              >
                <option value="a)">a) lavori</option>
                <option value="b)">b) servizi/forniture</option>
              </SelectInput>
              <span className="text-foreground">del D.Lgs. 36/2023,</span>
            </div>

            <TextAreaInput
              value={oggetto}
              onChange={(e) => setOggetto(e.target.value)}
              placeholder="Oggetto dell'affidamento (es. del servizio di manutenzione...)"
              label=""
              rows={2}
              required
            />

            {lettera === "a)" && (
              <div className="space-y-3">
                <TextInput
                  type="text"
                  value={cup}
                  onChange={(e) => setCup(e.target.value)}
                  placeholder="CUP (Codice Unico di Progetto)"
                />
                <TextInput
                  type="text"
                  value={codiceLavoro}
                  onChange={(e) => setCodiceLavoro(e.target.value)}
                  placeholder="Codice Lavoro"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-foreground whitespace-nowrap">Capitolo di bilancio:</span>
              <TextInput
                type="text"
                value={capitoloBilancio}
                onChange={(e) => setCapitoloBilancio(e.target.value)}
                placeholder="Codice capitolo"
                className="flex-1"
                required
              />
            </div>
            </div>
          </div>
        </div>

        {/* Corpo del documento */}
        <div className="space-y-2 pt-4">
          <div className="text-foreground">
            Con riferimento <span className="text-gold font-bold">{riferimento}</span> recepito a protocollo con n.{" "}
            <span className="text-gold font-bold">{pNumero || "[N. PROTOCOLLO]"}</span> in data{" "}
            <span className="text-gold font-bold">{pData || "[DATA]"}</span>,
          </div>

          {/* Proposta RUP */}
          {mostraProposta && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gold/5 border border-gold/20 rounded-xl p-5"
            >
              <div className="text-foreground/70 text-sm mb-2">Proposta del RUP</div>
              <div className="text-foreground text-base">
                vista la proposta del Responsabile Unico del Progetto{" "}
                <span className="text-gold font-semibold">
                  {rupSelezionato.titolo} {rupSelezionato.nome} {rupSelezionato.cognome}
                </span>
                {totaleNumero > 5000 && (
                  <div className="mt-3">
                    <TextInput
                      type="text"
                      label="in data"
                      value={dataPropostaRup}
                      onChange={(e) => setDataPropostaRup(e.target.value)}
                      placeholder="GG/MM/AAAA"
                      className="w-48"
                      pattern="\d{2}/\d{2}/\d{4}"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div className="text-foreground">
            si affida a codesta spettabile ditta{" "}
            <span className="text-gold font-bold">{fRagione || "[RAGIONE SOCIALE]"}</span> – c.f./p.iva{" "}
            <span className="text-gold font-bold">{fCfIva || "[CF/PIVA]"}</span>
          </div>

          <TextAreaInput
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            placeholder="Descrizione dettagliata dell'affidamento..."
            label=""
            rows={4}
            required
          />

          <div className="flex items-center gap-3">
            <span className="text-foreground whitespace-nowrap">CPV:</span>
            <TextInput
              type="text"
              value={cpv}
              onChange={(e) => setCpv(e.target.value)}
              placeholder="Codice CPV"
              className="flex-1"
            />
          </div>

          <div className="text-foreground">
            per l'importo complessivo di € <span className="text-gold font-bold text-lg">{totaleNumero.toFixed(2)}</span>{" "}
            (<span className="text-gold font-bold">{totaleLettere}</span>) oltre ad IVA.
          </div>
        </div>

        {/* Note opzionali - collapsabili */}
        <div className="space-y-6 pt-6 border-t border-border/30">
          <h3 className="text-base font-semibold text-foreground/80">Note Opzionali</h3>

          <TextAreaInput
            label="Condizioni"
            value={condizioni}
            onChange={(e) => setCondizioni(e.target.value)}
            placeholder="Condizioni particolari di pagamento o esecuzione..."
            collapsible={true}
            initialValue={extractedData.condizioniPagamento}
          />

          <TextAreaInput
            label="Tempistiche"
            value={tempistiche}
            onChange={(e) => setTempistiche(e.target.value)}
            placeholder="Tempistiche di consegna o esecuzione..."
            collapsible={true}
            initialValue={extractedData.tempiConsegna}
          />

          <TextAreaInput
            label="Prescrizioni Tecniche"
            value={prescrizioniTecniche}
            onChange={(e) => setPrescrizioniTecniche(e.target.value)}
            placeholder="Prescrizioni tecniche particolari..."
            collapsible={true}
          />

          <TextAreaInput
            label="Garanzie"
            value={garanzie}
            onChange={(e) => setGaranzie(e.target.value)}
            placeholder="Garanzie richieste..."
            collapsible={true}
          />
        </div>

        {/* Firme */}
        <div className="pt-8 space-y-6 border-t border-border/30">
          <h3 className="text-base font-semibold text-foreground/80">Firmatari</h3>

          <SelectInput
            label="Seleziona Dirigente *"
            value={dirigenteId}
            onChange={(e) => setDirigenteId(e.target.value)}
            required
          >
            <option value="">-- Seleziona Dirigente --</option>
            {dirigenti.map((d) => (
              <option key={d.id} value={d.id}>
                {d.titolo} {d.nome} {d.cognome} ({d.ruolo === "GENERALE" ? "Direttore Generale" : "Direttore Area Territorio"})
              </option>
            ))}
          </SelectInput>

          {dirigenteSelezionato && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gold/5 border border-gold/20 rounded-xl p-4"
            >
              <div className="text-foreground/70 text-sm mb-1">
                Il Direttore {dirigenteSelezionato.ruolo === "GENERALE" ? "Generale" : "Area Territorio"}
              </div>
              <div className="text-gold font-semibold text-base">
                {dirigenteSelezionato.titolo} {dirigenteSelezionato.nome} {dirigenteSelezionato.cognome}
              </div>
            </motion.div>
          )}

          <SelectInput
            label="Seleziona RUP (opzionale, se diverso dal Dirigente)"
            value={rupId}
            onChange={(e) => setRupId(e.target.value)}
          >
            <option value="">-- Nessun RUP (o RUP = Dirigente) --</option>
            {rups.map((r) => (
              <option key={r.id} value={r.id}>
                {r.titolo} {r.nome} {r.cognome}
              </option>
            ))}
          </SelectInput>

          <div className="bg-background/30 border border-border/30 rounded-xl p-5 mt-6">
            <div className="text-foreground/60 text-sm mb-2.5 font-medium">Il Referente</div>
            <div className="text-gold font-semibold text-base mb-2">{userName}</div>
            <div className="text-foreground/70 text-sm space-y-1">
              <div>Tel. {userTelefono}</div>
              <div>Email: {userEmail}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pulsanti */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-end gap-4 pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => window.history.back()}
          className="px-8 py-3.5 rounded-xl border-2 border-border/50 text-foreground hover:bg-background/50 hover:border-border transition-all text-base font-medium"
        >
          Annulla
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(34, 197, 94, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="bg-gold text-background px-10 py-3.5 rounded-xl hover:bg-gold/90 transition-all font-semibold text-base shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Genera Documento Word
        </motion.button>
      </motion.div>
    </form>
  );
}
