"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen";
import DocumentViewer from "../components/DocumentViewer";

interface GeneratedDocument {
  id: string;
  type: "affidamento" | "proposta" | "determina";
  title: string;
  content: string;
}

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocs, setSelectedDocs] = useState({
    affidamento: false,
    proposta: false,
    determina: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[] | null>(null);

  // Mock data per documenti precedenti
  const previousDocs = [
    { id: 1, name: "Preventivo ABC - 15/10/2024", type: "Affidamento", amount: "€ 45,000" },
    { id: 2, name: "Progetto XYZ - 12/10/2024", type: "Proposta", amount: "€ 12,500" },
    { id: 3, name: "Servizio 123 - 08/10/2024", type: "Determina", amount: "€ 8,300" },
    { id: 4, name: "Fornitura DEF - 03/10/2024", type: "Affidamento", amount: "€ 67,000" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const toggleDoc = (doc: keyof typeof selectedDocs) => {
    setSelectedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
  };

  // Simula il completamento della generazione documenti
  useEffect(() => {
    if (isGenerating) {
      // Dopo circa 7.5 secondi (durata totale degli step del loading)
      const timer = setTimeout(() => {
        // Genera documenti mock basati sulle selezioni
        const docs: GeneratedDocument[] = [];

        if (selectedDocs.affidamento) {
          docs.push({
            id: "affidamento-1",
            type: "affidamento",
            title: "Affidamento Diretto",
            content: `AFFIDAMENTO DIRETTO

Oggetto: Affidamento diretto per la fornitura di servizi

PREMESSO CHE:
- È necessario procedere all'affidamento diretto per la fornitura di servizi;
- L'importo previsto è inferiore alla soglia comunitaria;
- Il fornitore individuato possiede i requisiti necessari;

VISTO:
- Il D.Lgs. 36/2023 (Codice dei contratti pubblici);
- Il preventivo presentato dal fornitore;
- La disponibilità di bilancio;

DETERMINA

Art. 1 - Di affidare al fornitore [NOME FORNITORE] i seguenti servizi:
[DESCRIZIONE SERVIZI]

Art. 2 - L'importo complessivo dell'affidamento è pari a € [IMPORTO]

Art. 3 - Il termine di esecuzione è fissato in [GIORNI] giorni dalla firma del contratto.

Luogo e Data: ___________________

Il Responsabile
_______________________`
          });
        }

        if (selectedDocs.proposta) {
          docs.push({
            id: "proposta-1",
            type: "proposta",
            title: "Proposta d'Affidamento",
            content: `PROPOSTA D'AFFIDAMENTO

Al Responsabile [UFFICIO]
Oggetto: Proposta di affidamento diretto

Si propone l'affidamento diretto dei seguenti servizi/forniture:

1. OGGETTO DELL'AFFIDAMENTO
Descrizione dettagliata dei servizi/forniture richiesti:
[DESCRIZIONE DETTAGLIATA]

2. MOTIVAZIONI
Le ragioni che rendono necessario l'affidamento:
- Necessità urgente di [SERVIZIO/FORNITURA]
- Specificità delle prestazioni richieste
- Continuità operativa

3. FORNITORE INDIVIDUATO
Ragione sociale: [NOME FORNITORE]
Partita IVA: [P.IVA]
Indirizzo: [INDIRIZZO]

4. IMPORTO
L'importo complessivo previsto è di € [IMPORTO] (IVA esclusa)

5. COPERTURA FINANZIARIA
Capitolo di bilancio: [CAPITOLO]
Disponibilità: € [DISPONIBILITÀ]

6. NORMATIVA DI RIFERIMENTO
- D.Lgs. 36/2023
- Regolamento interno dell'Ente

Si chiede pertanto l'autorizzazione a procedere con l'affidamento diretto.

Data: ___________________

Il Proponente
_______________________`
          });
        }

        if (selectedDocs.determina) {
          docs.push({
            id: "determina-1",
            type: "determina",
            title: "Determina Dirigenziale",
            content: `DETERMINA DIRIGENZIALE N. _____

IL DIRIGENTE

VISTI:
- Il D.Lgs. 36/2023 (Codice dei contratti pubblici);
- Lo Statuto comunale/provinciale;
- Il Regolamento di contabilità;

RICHIAMATI:
- La delibera di Giunta n. ____ del ______;
- Il Piano Esecutivo di Gestione;

CONSIDERATO CHE:
- È necessario procedere all'acquisizione di [OGGETTO];
- L'importo previsto rientra nei limiti di competenza dirigenziale;
- È stata effettuata la necessaria ricerca di mercato;

ACCERTATO:
- La disponibilità della somma sul capitolo di bilancio ______
- La regolarità contributiva del fornitore
- Il possesso dei requisiti di legge

DETERMINA

1. Di approvare l'affidamento a [FORNITORE] per € [IMPORTO] + IVA
2. Di impegnare la somma sul capitolo [CAPITOLO] del bilancio
3. Di dare atto che si provvederà alla liquidazione a seguito di regolare fatturazione
4. Di trasmettere copia del presente atto ai servizi competenti

Lì, ___________________

IL DIRIGENTE
_______________________`
          });
        }

        setGeneratedDocuments(docs);
        setIsGenerating(false);
      }, 7500); // Durata totale degli step

      return () => clearTimeout(timer);
    }
  }, [isGenerating, selectedDocs]);

  const handleCloseViewer = () => {
    setGeneratedDocuments(null);
    setSelectedFile(null);
    setSelectedDocs({
      affidamento: false,
      proposta: false,
      determina: false,
    });
  };

  if (isGenerating) {
    return <LoadingScreen />;
  }

  if (generatedDocuments && generatedDocuments.length > 0) {
    return <DocumentViewer documents={generatedDocuments} onClose={handleCloseViewer} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Documenti precedenti */}
      <aside className="w-80 border-r border-border bg-card-bg flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/icona.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-semibold text-foreground">Generatore</span>
          </div>
          <button className="w-full px-4 py-3 bg-gold hover:bg-gold-dark transition-all rounded-lg text-background font-medium flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuovo documento
          </button>
        </div>

        {/* Lista documenti */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs text-foreground/50 px-3 py-2 font-medium">DOCUMENTI RECENTI</div>
          {previousDocs.map((doc) => (
            <button
              key={doc.id}
              className="w-full text-left px-3 py-3 rounded-lg hover:bg-background/60 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground font-medium truncate">
                    {doc.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-foreground/60">{doc.type}</span>
                    <span className="text-xs text-gold">{doc.amount}</span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* User profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gold/20 rounded-full flex items-center justify-center">
              <span className="text-gold font-semibold text-sm">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">Utente</div>
              <div className="text-xs text-foreground/60">utente@esempio.it</div>
            </div>
            <button className="text-foreground/60 hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm p-4">
          <h1 className="text-xl font-semibold text-foreground">Genera nuovo documento</h1>
          <p className="text-sm text-foreground/60 mt-1">Carica un preventivo e seleziona i documenti da generare</p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Step 1: Upload file */}
            <div className="bg-card-bg border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center text-background font-bold">
                  1
                </div>
                <h2 className="text-xl font-semibold text-foreground">Carica preventivo</h2>
              </div>

              <div className="border-2 border-dashed border-border rounded-xl p-8 hover:border-gold/50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  {selectedFile ? (
                    <div className="text-center">
                      <p className="text-foreground font-medium mb-1">{selectedFile.name}</p>
                      <p className="text-sm text-foreground/60">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-xs text-gold mt-2">Clicca per cambiare file</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-foreground font-medium mb-1">Clicca per caricare</p>
                      <p className="text-sm text-foreground/60">PDF, DOC, DOCX, XLS, XLSX</p>
                      <p className="text-xs text-foreground/40 mt-2">Max 10 MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Step 2: Select documents */}
            <div className="bg-card-bg border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center text-background font-bold">
                  2
                </div>
                <h2 className="text-xl font-semibold text-foreground">Seleziona documenti da generare</h2>
              </div>

              <div className="space-y-3">
                {/* Affidamento */}
                <label className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-gold/50 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDocs.affidamento}
                    onChange={() => toggleDoc('affidamento')}
                    className="w-5 h-5 rounded border-border bg-background text-gold focus:ring-2 focus:ring-gold/50 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium text-foreground">Affidamento</span>
                    </div>
                    <p className="text-sm text-foreground/60 mt-1">Documento di affidamento completo</p>
                  </div>
                </label>

                {/* Proposta */}
                <label className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-gold/50 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDocs.proposta}
                    onChange={() => toggleDoc('proposta')}
                    className="w-5 h-5 rounded border-border bg-background text-gold focus:ring-2 focus:ring-gold/50 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-medium text-foreground">Proposta d'Affidamento</span>
                    </div>
                    <p className="text-sm text-foreground/60 mt-1">Proposta dettagliata per approvazione</p>
                  </div>
                </label>

                {/* Determina */}
                <label className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-gold/50 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDocs.determina}
                    onChange={() => toggleDoc('determina')}
                    className="w-5 h-5 rounded border-border bg-background text-gold focus:ring-2 focus:ring-gold/50 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span className="font-medium text-foreground">Determina</span>
                    </div>
                    <p className="text-sm text-foreground/60 mt-1">Determina in base all'importo</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Generate button */}
            <div className="flex justify-end gap-4">
              <button className="px-6 py-3 bg-card-bg hover:bg-card-bg/60 border border-border rounded-lg text-foreground font-medium transition-all">
                Annulla
              </button>
              <button
                onClick={handleGenerate}
                disabled={!selectedFile || (!selectedDocs.affidamento && !selectedDocs.proposta && !selectedDocs.determina)}
                className="px-8 py-3 bg-gold hover:bg-gold-dark transition-all rounded-lg text-background font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/20"
              >
                Genera documenti
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
