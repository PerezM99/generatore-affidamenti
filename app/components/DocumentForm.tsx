"use client";

import { useState, useEffect } from "react";
import { ExtractedData } from "@/lib/llm-parser";

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
      }).join("; ");

      return `${articolo}: ${voci}`;
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header del documento */}
      <div className="bg-card-bg border border-border rounded-xl p-8 font-mono text-sm space-y-4">
        <h2 className="text-lg font-bold text-gold mb-4 font-sans">Documento di Affidamento</h2>

        {/* Metodo invio (sx) e destinatario (dx) */}
        <div className="flex justify-between items-start">
          {/* Sinistra: Via */}
          <div className="flex items-center gap-2">
            <span className="text-foreground">Via</span>
            <select
              value={metodoInvio}
              onChange={(e) => setMetodoInvio(e.target.value)}
              className="bg-background border border-gold rounded px-3 py-1 text-foreground font-sans"
            >
              <option>PEC</option>
              <option>Raccomandata</option>
              <option>Email</option>
            </select>
          </div>

          {/* Destra: Dati fornitore (uno per riga) */}
          <div className="text-right space-y-1 min-w-[400px]">
            <div className="text-foreground/80 text-sm">Spett.le</div>
            <div>
              <input
                type="text"
                value={fRagione}
                onChange={(e) => setFRagione(e.target.value)}
                placeholder="Ragione Sociale"
                className="w-full text-right bg-background border border-gold rounded px-3 py-1 text-foreground font-sans"
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={fIndirizzo}
                onChange={(e) => setFIndirizzo(e.target.value)}
                placeholder="Via Roma, 10"
                className="w-full text-right bg-background border border-gold rounded px-3 py-1 text-foreground font-sans"
              />
            </div>
            <div>
              <input
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
                className="w-full text-right bg-background border border-gold rounded px-3 py-1 text-foreground font-sans"
              />
            </div>
            <div>
              <input
                type="email"
                value={fMail}
                onChange={(e) => setFMail(e.target.value)}
                placeholder="email@fornitore.it"
                className="w-full text-right bg-background border border-border rounded px-3 py-1 text-foreground/80 font-sans text-sm"
              />
            </div>
            <div>
              <input
                type="email"
                value={fPec}
                onChange={(e) => setFPec(e.target.value)}
                placeholder="pec@fornitore.it"
                className="w-full text-right bg-background border border-border rounded px-3 py-1 text-foreground/80 font-sans text-sm"
              />
            </div>
          </div>
        </div>

        {/* p.c. Ufficio gare */}
        <div className="text-foreground text-right pr-24">
          <div>p.c. Ufficio gare</div>
          <div>gare@gardachiese.it</div>
        </div>

        {/* Oggetto */}
        <div className="space-y-2 pt-4">
          <div className="font-bold text-foreground">OGGETTO:</div>
          <div className="pl-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground">Affidamento diretto, ai sensi dell'art. 50, comma 1, lettera</span>
              <select
                value={lettera}
                onChange={(e) => setLettera(e.target.value as "a)" | "b)")}
                className="bg-background border border-gold rounded px-2 py-1 text-foreground font-sans"
                required
              >
                <option value="a)">a) lavori</option>
                <option value="b)">b) servizi/forniture</option>
              </select>
              <span className="text-foreground">del D.Lgs. 36/2023,</span>
            </div>

            <textarea
              value={oggetto}
              onChange={(e) => setOggetto(e.target.value)}
              placeholder="Oggetto dell'affidamento (es. del servizio di manutenzione...)"
              className="w-full bg-background border border-gold rounded px-3 py-2 text-foreground font-sans"
              rows={2}
              required
            />

            {lettera === "a)" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={cup}
                  onChange={(e) => setCup(e.target.value)}
                  placeholder="CUP (Codice Unico di Progetto)"
                  className="w-full bg-background border border-gold rounded px-3 py-2 text-foreground font-sans"
                />
                <input
                  type="text"
                  value={codiceLavoro}
                  onChange={(e) => setCodiceLavoro(e.target.value)}
                  placeholder="Codice Lavoro"
                  className="w-full bg-background border border-gold rounded px-3 py-2 text-foreground font-sans"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-foreground">Capitolo di bilancio:</span>
              <input
                type="text"
                value={capitoloBilancio}
                onChange={(e) => setCapitoloBilancio(e.target.value)}
                placeholder="Codice capitolo"
                className="flex-1 bg-background border border-gold rounded px-3 py-2 text-foreground font-sans"
                required
              />
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
            <div className="pl-4 space-y-2 bg-gold/10 p-3 rounded">
              <div className="text-foreground">
                vista la proposta del Responsabile Unico del Progetto{" "}
                <span className="text-gold font-bold">
                  {rupSelezionato.titolo} {rupSelezionato.nome} {rupSelezionato.cognome}
                </span>
                {totaleNumero > 5000 && (
                  <>
                    {" "}in data{" "}
                    <input
                      type="text"
                      value={dataPropostaRup}
                      onChange={(e) => setDataPropostaRup(e.target.value)}
                      placeholder="GG/MM/AAAA"
                      className="w-32 bg-background border border-gold rounded px-2 py-1 text-foreground font-sans"
                      pattern="\d{2}/\d{2}/\d{4}"
                    />
                  </>
                )}
              </div>
            </div>
          )}

          <div className="text-foreground">
            si affida a codesta spettabile ditta{" "}
            <span className="text-gold font-bold">{fRagione || "[RAGIONE SOCIALE]"}</span> – c.f./p.iva{" "}
            <span className="text-gold font-bold">{fCfIva || "[CF/PIVA]"}</span>
          </div>

          <textarea
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            placeholder="Descrizione dettagliata dell'affidamento..."
            className="w-full bg-background border border-gold rounded px-3 py-2 text-foreground font-sans"
            rows={4}
            required
          />

          <div className="flex items-center gap-2">
            <span className="text-foreground">CPV:</span>
            <input
              type="text"
              value={cpv}
              onChange={(e) => setCpv(e.target.value)}
              placeholder="Codice CPV"
              className="flex-1 bg-background border border-gold rounded px-3 py-2 text-foreground font-sans"
            />
          </div>

          <div className="text-foreground">
            per l'importo complessivo di € <span className="text-gold font-bold text-lg">{totaleNumero.toFixed(2)}</span>{" "}
            (<span className="text-gold font-bold">{totaleLettere}</span>) oltre ad IVA.
          </div>
        </div>

        {/* Note opzionali */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div>
            <label className="text-foreground/80 text-xs font-sans">Condizioni (opzionale)</label>
            <textarea
              value={condizioni}
              onChange={(e) => setCondizioni(e.target.value)}
              placeholder="Condizioni particolari..."
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground font-sans text-xs"
              rows={2}
            />
          </div>

          <div>
            <label className="text-foreground/80 text-xs font-sans">Tempistiche (opzionale)</label>
            <textarea
              value={tempistiche}
              onChange={(e) => setTempistiche(e.target.value)}
              placeholder="Tempistiche di consegna/esecuzione..."
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground font-sans text-xs"
              rows={2}
            />
          </div>

          <div>
            <label className="text-foreground/80 text-xs font-sans">Prescrizioni Tecniche (opzionale)</label>
            <textarea
              value={prescrizioniTecniche}
              onChange={(e) => setPrescrizioniTecniche(e.target.value)}
              placeholder="Prescrizioni tecniche particolari..."
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground font-sans text-xs"
              rows={2}
            />
          </div>

          <div>
            <label className="text-foreground/80 text-xs font-sans">Garanzie (opzionale)</label>
            <textarea
              value={garanzie}
              onChange={(e) => setGaranzie(e.target.value)}
              placeholder="Garanzie richieste..."
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground font-sans text-xs"
              rows={2}
            />
          </div>
        </div>

        {/* Firme */}
        <div className="pt-6 space-y-4">
          <div>
            <label className="text-foreground/80 text-xs font-sans font-bold block mb-2">
              Seleziona Dirigente *
            </label>
            <select
              value={dirigenteId}
              onChange={(e) => setDirigenteId(e.target.value)}
              className="w-full bg-background border border-gold rounded px-3 py-2 text-foreground font-sans"
              required
            >
              <option value="">-- Seleziona Dirigente --</option>
              {dirigenti.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.titolo} {d.nome} {d.cognome} ({d.ruolo === "GENERALE" ? "Direttore Generale" : "Direttore Area Territorio"})
                </option>
              ))}
            </select>
          </div>

          {dirigenteSelezionato && (
            <div className="text-foreground pl-4">
              Il Direttore {dirigenteSelezionato.ruolo === "GENERALE" ? "Generale" : "Area Territorio"}
              <br />
              <span className="text-gold font-bold">
                {dirigenteSelezionato.titolo} {dirigenteSelezionato.nome} {dirigenteSelezionato.cognome}
              </span>
            </div>
          )}

          <div>
            <label className="text-foreground/80 text-xs font-sans font-bold block mb-2">
              Seleziona RUP (opzionale, se diverso dal Dirigente)
            </label>
            <select
              value={rupId}
              onChange={(e) => setRupId(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground font-sans"
            >
              <option value="">-- Nessun RUP (o RUP = Dirigente) --</option>
              {rups.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.titolo} {r.nome} {r.cognome}
                </option>
              ))}
            </select>
          </div>

          <div className="text-foreground pl-4 pt-4 border-t border-border">
            <div className="text-foreground/80 text-xs mb-2">Il Referente</div>
            <div className="text-gold font-bold">{userName}</div>
            <div className="text-foreground/80 text-sm">Tel. {userTelefono}</div>
            <div className="text-foreground/80 text-sm">Email: {userEmail}</div>
          </div>
        </div>
      </div>

      {/* Pulsanti */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-lg border border-border text-foreground hover:bg-card-bg transition-colors"
        >
          Annulla
        </button>
        <button
          type="submit"
          className="bg-gold text-background px-8 py-3 rounded-lg hover:bg-gold/90 transition-colors font-medium"
        >
          Genera Documento Word
        </button>
      </div>
    </form>
  );
}

// Helper per convertire numero in lettere (versione base)
function numberToWords(num: number): string {
  const parts = num.toFixed(2).split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Per ora ritorna formato base, da migliorare con libreria dedicata
  // TODO: Implementare conversione completa
  return `${integerPart}/${decimalPart}`;
}
