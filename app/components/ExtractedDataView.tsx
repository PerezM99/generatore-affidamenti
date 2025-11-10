"use client";

import { motion } from "framer-motion";
import { ExtractedData } from "@/lib/llm-parser";

interface ExtractedDataViewProps {
  data: ExtractedData;
  onConfirm: () => void;
  onEdit: () => void;
}

export default function ExtractedDataView({ data, onConfirm, onEdit }: ExtractedDataViewProps) {
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
          {(data.importoTotale || data.importoImponibile || data.importoIva) && (
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
                {data.importoImponibile && (
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-sm text-foreground/70">Imponibile (IVA escl.)</span>
                    <span className="font-semibold text-foreground">€ {data.importoImponibile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {data.importoIva && (
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-sm text-foreground/70">IVA</span>
                    <span className="font-semibold text-foreground">€ {data.importoIva.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {data.importoTotale && (
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border-2 border-gold/30">
                    <span className="text-sm text-foreground font-semibold">Totale (IVA incl.)</span>
                    <span className="font-bold text-gold">€ {data.importoTotale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
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
              <div className="space-y-3">
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
                    <p className="text-sm text-foreground mt-1 whitespace-pre-line">{data.fornitore.indirizzo}</p>
                  </div>
                )}
                {(data.fornitore.email || data.fornitore.pec) && (
                  <div className="pt-2 border-t border-border space-y-1">
                    {data.fornitore.email && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-foreground/70">{data.fornitore.email}</span>
                      </div>
                    )}
                    {data.fornitore.pec && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm text-gold font-medium">PEC: {data.fornitore.pec}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Oggetto e Tipo Affidamento */}
          {(data.oggetto || data.tipoAffidamento) && (
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
                <h3 className="font-semibold text-foreground">Oggetto dell'Affidamento</h3>
              </div>
              <div className="space-y-3">
                {data.tipoAffidamento && (
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">Tipo</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                        data.tipoAffidamento === 'fornitura' ? 'bg-blue-500/20 text-blue-400' :
                        data.tipoAffidamento === 'servizi' ? 'bg-green-500/20 text-green-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {data.tipoAffidamento.charAt(0).toUpperCase() + data.tipoAffidamento.slice(1)}
                      </span>
                    </div>
                  </div>
                )}
                {data.oggetto && (
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">Descrizione</span>
                    <p className="text-sm font-medium text-foreground mt-1 leading-relaxed">{data.oggetto}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Riferimenti Documento */}
          {(data.numeroPreventivo || data.numeroProtocollo || data.dataProtocollo) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card-bg border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3 className="font-semibold text-foreground">Riferimenti Documento</h3>
              </div>
              <div className="space-y-3">
                {data.numeroPreventivo && (
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">N. Preventivo</span>
                    <p className="text-sm font-medium text-foreground mt-1">{data.numeroPreventivo}</p>
                  </div>
                )}
                {data.numeroProtocollo && (
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">N. Protocollo</span>
                    <p className="text-sm font-medium text-foreground mt-1">{data.numeroProtocollo}</p>
                  </div>
                )}
                {data.dataProtocollo && (
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">Data Protocollo</span>
                    <p className="text-sm font-medium text-foreground mt-1">{data.dataProtocollo}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Voci Preventivo */}
          {data.vociPreventivo && data.vociPreventivo.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card-bg border border-border rounded-xl p-6 lg:col-span-2"
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="font-semibold text-foreground">Voci del Preventivo</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-xs font-medium text-foreground/50 uppercase">Descrizione</th>
                      <th className="text-center py-3 px-2 text-xs font-medium text-foreground/50 uppercase">Q.tà</th>
                      <th className="text-right py-3 px-2 text-xs font-medium text-foreground/50 uppercase">Prezzo Unit. (IVA escl.)</th>
                      <th className="text-center py-3 px-2 text-xs font-medium text-foreground/50 uppercase">IVA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vociPreventivo.map((voce, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-3 px-2 text-foreground">{voce.descrizione}</td>
                        <td className="py-3 px-2 text-center text-foreground">{voce.quantita || '-'}</td>
                        <td className="py-3 px-2 text-right font-medium text-foreground">
                          {voce.prezzoUnitario ? `€ ${voce.prezzoUnitario.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="py-3 px-2 text-center text-gold">{voce.iva ? `${voce.iva}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Note */}
          {data.note && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card-bg border border-border rounded-xl p-6 lg:col-span-2"
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h3 className="font-semibold text-foreground">Note</h3>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">{data.note}</p>
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
