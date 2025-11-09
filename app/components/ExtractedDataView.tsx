"use client";

import { motion } from "framer-motion";
import { ExtractedData } from "@/lib/llm-parser";

interface ExtractedDataViewProps {
  data: ExtractedData;
  onConfirm: () => void;
  onEdit: () => void;
  onViewPDF?: () => void;
}

export default function ExtractedDataView({ data, onConfirm, onEdit, onViewPDF }: ExtractedDataViewProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dati Estratti con Successo
              </h1>
              <p className="text-sm text-foreground/60">
                Verifica i dati estratti dal preventivo prima di generare i documenti
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Importi */}
          {(data.importoTotale || data.importoIvaEsclusa || data.iva) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card-bg border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold text-foreground">Importi</h3>
              </div>
              <div className="space-y-3">
                {data.importoTotale && (
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-sm text-foreground/70">Totale</span>
                    <span className="font-bold text-gold">€ {data.importoTotale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {data.importoIvaEsclusa && (
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-sm text-foreground/70">IVA Esclusa</span>
                    <span className="font-semibold text-foreground">€ {data.importoIvaEsclusa.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {data.importoIvaInclusa && (
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-sm text-foreground/70">IVA Inclusa</span>
                    <span className="font-semibold text-foreground">€ {data.importoIvaInclusa.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {data.iva && (
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-sm text-foreground/70">Aliquota IVA</span>
                    <span className="font-semibold text-foreground">{data.iva}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Fornitore */}
          {data.fornitore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card-bg border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="font-semibold text-foreground">Fornitore</h3>
              </div>
              <div className="space-y-2">
                {data.fornitore.ragioneSociale && (
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">Ragione Sociale</span>
                    <p className="text-sm font-medium text-foreground mt-1">{data.fornitore.ragioneSociale}</p>
                  </div>
                )}
                {data.fornitore.partitaIva && (
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">P.IVA</span>
                    <p className="text-sm text-foreground mt-1">{data.fornitore.partitaIva}</p>
                  </div>
                )}
                {data.fornitore.indirizzo && (
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">Indirizzo</span>
                    <p className="text-sm text-foreground mt-1">
                      {data.fornitore.indirizzo}
                      {data.fornitore.citta && `, ${data.fornitore.citta}`}
                      {data.fornitore.cap && ` ${data.fornitore.cap}`}
                    </p>
                  </div>
                )}
                {(data.fornitore.email || data.fornitore.telefono) && (
                  <div className="pt-2 border-t border-border">
                    {data.fornitore.email && (
                      <p className="text-sm text-foreground/70">📧 {data.fornitore.email}</p>
                    )}
                    {data.fornitore.telefono && (
                      <p className="text-sm text-foreground/70">📞 {data.fornitore.telefono}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Oggetto e Descrizione */}
          {(data.oggetto || data.descrizione) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card-bg border border-border rounded-xl p-6 lg:col-span-2"
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="font-semibold text-foreground">Descrizione</h3>
              </div>
              {data.oggetto && (
                <div className="mb-3">
                  <span className="text-xs text-foreground/50 uppercase">Oggetto</span>
                  <p className="text-sm font-medium text-foreground mt-1">{data.oggetto}</p>
                </div>
              )}
              {data.descrizione && (
                <div>
                  <span className="text-xs text-foreground/50 uppercase">Descrizione Dettagliata</span>
                  <p className="text-sm text-foreground/70 mt-1 leading-relaxed">{data.descrizione}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Date */}
          {(data.dataPreventivo || data.validitaPreventivo || data.tempiConsegna) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card-bg border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="font-semibold text-foreground">Date e Scadenze</h3>
              </div>
              <div className="space-y-3">
                {data.dataPreventivo && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs text-foreground/50">Data Preventivo</span>
                      <p className="text-sm font-medium text-foreground">{data.dataPreventivo}</p>
                    </div>
                  </div>
                )}
                {data.validitaPreventivo && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs text-foreground/50">Validità</span>
                      <p className="text-sm font-medium text-foreground">{data.validitaPreventivo}</p>
                    </div>
                  </div>
                )}
                {data.tempiConsegna && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs text-foreground/50">Tempi di Consegna</span>
                      <p className="text-sm font-medium text-foreground">{data.tempiConsegna}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Altro */}
          {(data.numeroPreventivo || data.note) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card-bg border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h3 className="font-semibold text-foreground">Informazioni Aggiuntive</h3>
              </div>
              <div className="space-y-2">
                {data.numeroPreventivo && (
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">N. Preventivo</span>
                    <p className="text-sm font-medium text-foreground mt-1">{data.numeroPreventivo}</p>
                  </div>
                )}
                {data.note && (
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">Note</span>
                    <p className="text-sm text-foreground/70 mt-1">{data.note}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between p-6 bg-card-bg border border-border rounded-xl"
        >
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              I dati sono corretti?
            </p>
            <p className="text-xs text-foreground/60">
              Verifica accuratamente prima di procedere alla generazione dei documenti
            </p>
          </div>
          <div className="flex gap-3">
            {onViewPDF && (
              <button
                onClick={onViewPDF}
                className="px-6 py-3 bg-background hover:bg-background/60 border border-border rounded-lg text-foreground font-medium transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Visualizza PDF
              </button>
            )}
            <button
              onClick={onEdit}
              className="px-6 py-3 bg-background hover:bg-background/60 border border-border rounded-lg text-foreground font-medium transition-all"
            >
              Modifica Dati
            </button>
            <button
              onClick={onConfirm}
              className="px-8 py-3 bg-gold hover:bg-gold-dark transition-all rounded-lg text-background font-semibold shadow-lg shadow-gold/20"
            >
              Conferma e Genera
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
