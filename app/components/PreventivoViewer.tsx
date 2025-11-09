"use client";

import { motion } from "framer-motion";
import { ExtractedData } from "@/lib/llm-parser";
import { useState } from "react";

interface PreventivoViewerProps {
  preventivoId: string;
  pdfUrl: string;
  extractedData: ExtractedData;
  onBack: () => void;
  onGenerate: () => void;
}

export default function PreventivoViewer({
  preventivoId,
  pdfUrl,
  extractedData,
  onBack,
  onGenerate,
}: PreventivoViewerProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-card-bg hover:bg-background/60 border border-border rounded-lg text-foreground font-medium transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Indietro
        </button>

        <h1 className="text-xl font-semibold text-foreground">Visualizza Preventivo</h1>

        <button
          onClick={onGenerate}
          className="px-6 py-2 bg-gold hover:bg-gold-dark transition-all rounded-lg text-background font-semibold shadow-lg shadow-gold/20"
        >
          Genera Documenti
        </button>
      </header>

      {/* Main content: PDF + Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col bg-card-bg border-r border-border">
          {/* PDF Controls */}
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-background hover:bg-background/60 border border-border rounded-lg transition-all"
                title="Zoom Out"
              >
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>

              <span className="text-sm text-foreground/70 min-w-[60px] text-center">
                {zoom}%
              </span>

              <button
                onClick={handleZoomIn}
                className="p-2 bg-background hover:bg-background/60 border border-border rounded-lg transition-all"
                title="Zoom In"
              >
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
            </div>

            <a
              href={pdfUrl}
              download
              className="flex items-center gap-2 px-3 py-2 bg-background hover:bg-background/60 border border-border rounded-lg text-foreground text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Scarica PDF
            </a>
          </div>

          {/* PDF Display */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-background/50">
            <iframe
              src={pdfUrl}
              className="w-full h-full border border-border rounded-lg shadow-xl bg-white"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              title="PDF Preventivo"
            />
          </div>
        </div>

        {/* Sidebar with Extracted Data */}
        <aside className="w-[400px] overflow-y-auto bg-background p-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-foreground">Dati Estratti</h2>
              </div>
              <p className="text-xs text-foreground/60">
                Informazioni estratte automaticamente dal PDF
              </p>
            </div>

            {/* Importi */}
            {(extractedData.importoTotale || extractedData.importoIvaEsclusa || extractedData.iva) && (
              <div className="bg-card-bg border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-semibold text-foreground text-sm">Importi</h3>
                </div>
                <div className="space-y-2">
                  {extractedData.importoTotale && (
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs text-foreground/70">Totale</span>
                      <span className="font-bold text-gold text-sm">€ {extractedData.importoTotale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {extractedData.importoIvaEsclusa && (
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs text-foreground/70">IVA Esclusa</span>
                      <span className="font-semibold text-foreground text-sm">€ {extractedData.importoIvaEsclusa.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {extractedData.importoIvaInclusa && (
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs text-foreground/70">IVA Inclusa</span>
                      <span className="font-semibold text-foreground text-sm">€ {extractedData.importoIvaInclusa.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {extractedData.iva && (
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs text-foreground/70">Aliquota IVA</span>
                      <span className="font-semibold text-foreground text-sm">{extractedData.iva}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fornitore */}
            {extractedData.fornitore && (
              <div className="bg-card-bg border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="font-semibold text-foreground text-sm">Fornitore</h3>
                </div>
                <div className="space-y-2">
                  {extractedData.fornitore.ragioneSociale && (
                    <div>
                      <span className="text-xs text-foreground/50 uppercase">Ragione Sociale</span>
                      <p className="text-xs font-medium text-foreground mt-0.5">{extractedData.fornitore.ragioneSociale}</p>
                    </div>
                  )}
                  {extractedData.fornitore.partitaIva && (
                    <div>
                      <span className="text-xs text-foreground/50 uppercase">P.IVA</span>
                      <p className="text-xs text-foreground mt-0.5">{extractedData.fornitore.partitaIva}</p>
                    </div>
                  )}
                  {extractedData.fornitore.indirizzo && (
                    <div>
                      <span className="text-xs text-foreground/50 uppercase">Indirizzo</span>
                      <p className="text-xs text-foreground mt-0.5">
                        {extractedData.fornitore.indirizzo}
                        {extractedData.fornitore.citta && `, ${extractedData.fornitore.citta}`}
                        {extractedData.fornitore.cap && ` ${extractedData.fornitore.cap}`}
                      </p>
                    </div>
                  )}
                  {(extractedData.fornitore.email || extractedData.fornitore.telefono) && (
                    <div className="pt-2 border-t border-border">
                      {extractedData.fornitore.email && (
                        <p className="text-xs text-foreground/70">📧 {extractedData.fornitore.email}</p>
                      )}
                      {extractedData.fornitore.telefono && (
                        <p className="text-xs text-foreground/70 mt-1">📞 {extractedData.fornitore.telefono}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Oggetto e Descrizione */}
            {(extractedData.oggetto || extractedData.descrizione) && (
              <div className="bg-card-bg border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="font-semibold text-foreground text-sm">Descrizione</h3>
                </div>
                {extractedData.oggetto && (
                  <div className="mb-2">
                    <span className="text-xs text-foreground/50 uppercase">Oggetto</span>
                    <p className="text-xs font-medium text-foreground mt-0.5">{extractedData.oggetto}</p>
                  </div>
                )}
                {extractedData.descrizione && (
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">Dettagli</span>
                    <p className="text-xs text-foreground/70 mt-0.5 leading-relaxed">{extractedData.descrizione}</p>
                  </div>
                )}
              </div>
            )}

            {/* Date */}
            {(extractedData.dataPreventivo || extractedData.validitaPreventivo || extractedData.tempiConsegna) && (
              <div className="bg-card-bg border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-semibold text-foreground text-sm">Date e Scadenze</h3>
                </div>
                <div className="space-y-2">
                  {extractedData.dataPreventivo && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs text-foreground/50">Data Preventivo</span>
                        <p className="text-xs font-medium text-foreground">{extractedData.dataPreventivo}</p>
                      </div>
                    </div>
                  )}
                  {extractedData.validitaPreventivo && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs text-foreground/50">Validità</span>
                        <p className="text-xs font-medium text-foreground">{extractedData.validitaPreventivo}</p>
                      </div>
                    </div>
                  )}
                  {extractedData.tempiConsegna && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs text-foreground/50">Tempi di Consegna</span>
                        <p className="text-xs font-medium text-foreground">{extractedData.tempiConsegna}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Altro */}
            {(extractedData.numeroPreventivo || extractedData.note) && (
              <div className="bg-card-bg border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <h3 className="font-semibold text-foreground text-sm">Info Aggiuntive</h3>
                </div>
                <div className="space-y-2">
                  {extractedData.numeroPreventivo && (
                    <div>
                      <span className="text-xs text-foreground/50 uppercase">N. Preventivo</span>
                      <p className="text-xs font-medium text-foreground mt-0.5">{extractedData.numeroPreventivo}</p>
                    </div>
                  )}
                  {extractedData.note && (
                    <div>
                      <span className="text-xs text-foreground/50 uppercase">Note</span>
                      <p className="text-xs text-foreground/70 mt-0.5">{extractedData.note}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modifica Dati Button */}
            <button
              className="w-full px-4 py-3 bg-card-bg hover:bg-background/60 border border-border rounded-lg text-foreground font-medium transition-all"
              onClick={() => alert("Funzione modifica manuale da implementare!")}
            >
              Modifica Dati
            </button>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
