"use client";

import { motion } from "framer-motion";
import { ExtractedData } from "@/lib/llm-parser";
import { useState } from "react";

interface ExtractedDataViewProps {
  data: ExtractedData;
  preventivoId: string;  // ID per salvare le modifiche nel DB
  onConfirm: () => void;
  onEdit: () => void;
}

export default function ExtractedDataView({ data, preventivoId, onConfirm, onEdit }: ExtractedDataViewProps) {
  // 📚 STATO: isEditing controlla se siamo in modalità modifica o visualizzazione
  const [isEditing, setIsEditing] = useState(false);

  // 📚 STATO: editedData contiene i dati che l'utente sta modificando
  // Inizialmente è una copia esatta di 'data'
  const [editedData, setEditedData] = useState<ExtractedData>(data);

  // 📚 STATO: isSaving indica se stiamo salvando nel database
  const [isSaving, setIsSaving] = useState(false);

  // 📚 FUNZIONE: Entra in modalità editing
  const handleEdit = () => {
    setIsEditing(true);
    // Resettiamo editedData ai dati originali quando entriamo in modalità edit
    setEditedData(data);
  };

  // 📚 FUNZIONE: Annulla le modifiche e torna alla visualizzazione
  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(data); // Ripristina i dati originali
  };

  // 📚 FUNZIONE: Salva le modifiche nel database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Chiamata API per aggiornare il preventivo nel database
      const response = await fetch(`/api/preventivi/${preventivoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedData: editedData,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore durante il salvataggio");
      }

      // Se il salvataggio ha successo, esci dalla modalità editing
      setIsEditing(false);

      // Notifica il componente padre (dashboard) che i dati sono cambiati
      // In questo modo la dashboard può aggiornare il suo stato
      onEdit(); // Chiamiamo onEdit per far ricaricare i dati

    } catch (error) {
      console.error("Errore salvamento:", error);
      alert("Errore durante il salvataggio delle modifiche");
    } finally {
      setIsSaving(false);
    }
  };

  // 📚 FUNZIONE HELPER: Aggiorna un campo specifico dell'editedData
  // Questa funzione usa la "dot notation" per aggiornare campi nested
  const updateField = (path: string, value: any) => {
    setEditedData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;

      // Naviga fino al penultimo livello
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      // Imposta il valore
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  // 📚 FUNZIONE: Aggiorna una voce specifica nell'array vociPreventivo
  const updateVoce = (index: number, field: string, value: any) => {
    setEditedData(prev => {
      const newData = { ...prev };
      if (!newData.vociPreventivo) {
        newData.vociPreventivo = [];
      }
      const newVoci = [...newData.vociPreventivo];
      newVoci[index] = {
        ...newVoci[index],
        [field]: value,
      };
      newData.vociPreventivo = newVoci;
      return newData;
    });
  };

  // 📚 FUNZIONE: Aggiunge una nuova voce vuota
  const addVoce = () => {
    setEditedData(prev => ({
      ...prev,
      vociPreventivo: [
        ...(prev.vociPreventivo || []),
        { descrizione: "", quantita: 0, prezzoUnitario: 0, iva: 22 }
      ]
    }));
  };

  // 📚 FUNZIONE: Rimuove una voce
  const removeVoce = (index: number) => {
    setEditedData(prev => ({
      ...prev,
      vociPreventivo: prev.vociPreventivo?.filter((_, i) => i !== index)
    }));
  };

  // 📚 RENDERING: Usa editedData se stiamo modificando, altrimenti data originale
  const displayData = isEditing ? editedData : data;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isEditing ? 'bg-blue-500/20' : 'bg-gold/20'
              }`}>
                <svg className={`w-6 h-6 ${isEditing ? 'text-blue-400' : 'text-gold'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isEditing ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditing ? "Modifica Dati Estratti" : "Dati Estratti con Successo"}
                </h1>
                <p className="text-sm text-foreground/60">
                  {isEditing
                    ? "Modifica i campi necessari e salva le modifiche"
                    : "Verifica i dati estratti dal preventivo prima di generare i documenti"
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Importi */}
          {(displayData.importoTotale || displayData.importoImponibile || displayData.importoIva || isEditing) && (
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
                {/* Imponibile */}
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-sm text-foreground/70">Imponibile (IVA escl.)</span>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={displayData.importoImponibile || ''}
                      onChange={(e) => updateField('importoImponibile', parseFloat(e.target.value))}
                      className="w-32 px-3 py-1 bg-card-bg border border-border rounded text-right text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="0.00"
                    />
                  ) : (
                    <span className="font-semibold text-foreground">
                      € {displayData.importoImponibile?.toLocaleString('it-IT', { minimumFractionDigits: 2 }) || '-'}
                    </span>
                  )}
                </div>

                {/* IVA */}
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-sm text-foreground/70">IVA</span>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={displayData.importoIva || ''}
                      onChange={(e) => updateField('importoIva', parseFloat(e.target.value))}
                      className="w-32 px-3 py-1 bg-card-bg border border-border rounded text-right text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="0.00"
                    />
                  ) : (
                    <span className="font-semibold text-foreground">
                      € {displayData.importoIva?.toLocaleString('it-IT', { minimumFractionDigits: 2 }) || '-'}
                    </span>
                  )}
                </div>

                {/* Totale */}
                <div className="flex justify-between items-center p-3 bg-background rounded-lg border-2 border-gold/30">
                  <span className="text-sm text-foreground font-semibold">Totale (IVA incl.)</span>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={displayData.importoTotale || ''}
                      onChange={(e) => updateField('importoTotale', parseFloat(e.target.value))}
                      className="w-32 px-3 py-1 bg-card-bg border border-gold/50 rounded text-right text-gold font-bold focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="0.00"
                    />
                  ) : (
                    <span className="font-bold text-gold">
                      € {displayData.importoTotale?.toLocaleString('it-IT', { minimumFractionDigits: 2 }) || '-'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Fornitore */}
          {(displayData.fornitore || isEditing) && (
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
                {/* Ragione Sociale */}
                <div>
                  <span className="text-xs text-foreground/50 uppercase">Ragione Sociale</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData.fornitore?.ragioneSociale || ''}
                      onChange={(e) => updateField('fornitore.ragioneSociale', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="Nome fornitore"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground mt-1">{displayData.fornitore?.ragioneSociale || '-'}</p>
                  )}
                </div>

                {/* P.IVA */}
                <div>
                  <span className="text-xs text-foreground/50 uppercase">P.IVA</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData.fornitore?.partitaIva || ''}
                      onChange={(e) => updateField('fornitore.partitaIva', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="12345678901"
                      maxLength={11}
                    />
                  ) : (
                    <p className="text-sm text-foreground mt-1">{displayData.fornitore?.partitaIva || '-'}</p>
                  )}
                </div>

                {/* Indirizzo */}
                <div>
                  <span className="text-xs text-foreground/50 uppercase">Indirizzo</span>
                  {isEditing ? (
                    <textarea
                      value={displayData.fornitore?.indirizzo || ''}
                      onChange={(e) => updateField('fornitore.indirizzo', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="Via Esempio, 10&#10;46100 Mantova (MN)"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-foreground mt-1 whitespace-pre-line">{displayData.fornitore?.indirizzo || '-'}</p>
                  )}
                </div>

                {/* Email e PEC */}
                <div className="pt-2 border-t border-border space-y-2">
                  {/* Email */}
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">Email</span>
                    {isEditing ? (
                      <input
                        type="email"
                        value={displayData.fornitore?.email || ''}
                        onChange={(e) => updateField('fornitore.email', e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                        placeholder="info@fornitore.it"
                      />
                    ) : displayData.fornitore?.email ? (
                      <div className="flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4 text-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-foreground/70">{displayData.fornitore.email}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* PEC */}
                  <div>
                    <span className="text-xs text-foreground/50 uppercase">PEC</span>
                    {isEditing ? (
                      <input
                        type="email"
                        value={displayData.fornitore?.pec || ''}
                        onChange={(e) => updateField('fornitore.pec', e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-background border border-gold/30 rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                        placeholder="pec@fornitore.it"
                      />
                    ) : displayData.fornitore?.pec ? (
                      <div className="flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm text-gold font-medium">PEC: {displayData.fornitore.pec}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Oggetto e Tipo Affidamento */}
          {(displayData.oggetto || displayData.tipoAffidamento || isEditing) && (
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
                {/* Tipo */}
                <div>
                  <span className="text-xs text-foreground/50 uppercase">Tipo</span>
                  <div className="mt-1">
                    {isEditing ? (
                      <select
                        value={displayData.tipoAffidamento || ''}
                        onChange={(e) => updateField('tipoAffidamento', e.target.value)}
                        className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      >
                        <option value="">Seleziona tipo</option>
                        <option value="fornitura">Fornitura</option>
                        <option value="servizi">Servizi</option>
                        <option value="lavori">Lavori</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                        displayData.tipoAffidamento === 'fornitura' ? 'bg-blue-500/20 text-blue-400' :
                        displayData.tipoAffidamento === 'servizi' ? 'bg-green-500/20 text-green-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {displayData.tipoAffidamento ? displayData.tipoAffidamento.charAt(0).toUpperCase() + displayData.tipoAffidamento.slice(1) : '-'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Descrizione */}
                <div>
                  <span className="text-xs text-foreground/50 uppercase">Descrizione</span>
                  {isEditing ? (
                    <textarea
                      value={displayData.oggetto || ''}
                      onChange={(e) => updateField('oggetto', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="Breve descrizione dell'oggetto dell'affidamento"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground mt-1 leading-relaxed">{displayData.oggetto || '-'}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Riferimenti Documento */}
          {(displayData.numeroPreventivo || displayData.numeroProtocollo || displayData.dataProtocollo || isEditing) && (
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
                {/* Numero Preventivo */}
                <div>
                  <span className="text-xs text-foreground/50 uppercase">N. Preventivo</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData.numeroPreventivo || ''}
                      onChange={(e) => updateField('numeroPreventivo', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="PREV-2024-001"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground mt-1">{displayData.numeroPreventivo || '-'}</p>
                  )}
                </div>

                {/* Numero Protocollo */}
                <div>
                  <span className="text-xs text-foreground/50 uppercase">N. Protocollo</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData.numeroProtocollo || ''}
                      onChange={(e) => updateField('numeroProtocollo', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="0005229/2025"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground mt-1">{displayData.numeroProtocollo || '-'}</p>
                  )}
                </div>

                {/* Data Protocollo */}
                <div>
                  <span className="text-xs text-foreground/50 uppercase">Data Protocollo</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData.dataProtocollo || ''}
                      onChange={(e) => updateField('dataProtocollo', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="11/09/2025"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground mt-1">{displayData.dataProtocollo || '-'}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Voci Preventivo */}
          {(displayData.vociPreventivo && displayData.vociPreventivo.length > 0) || isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card-bg border border-border rounded-xl p-6 lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="font-semibold text-foreground">Voci del Preventivo</h3>
                </div>
                {isEditing && (
                  <button
                    onClick={addVoce}
                    className="px-3 py-1 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Aggiungi Voce
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-xs font-medium text-foreground/50 uppercase">Descrizione</th>
                      <th className="text-center py-3 px-2 text-xs font-medium text-foreground/50 uppercase">Q.tà</th>
                      <th className="text-right py-3 px-2 text-xs font-medium text-foreground/50 uppercase">Prezzo Unit. (IVA escl.)</th>
                      <th className="text-center py-3 px-2 text-xs font-medium text-foreground/50 uppercase">IVA</th>
                      {isEditing && <th className="text-center py-3 px-2 text-xs font-medium text-foreground/50 uppercase">Azioni</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.vociPreventivo?.map((voce, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-3 px-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={voce.descrizione}
                              onChange={(e) => updateVoce(index, 'descrizione', e.target.value)}
                              className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                              placeholder="Descrizione articolo"
                            />
                          ) : (
                            <span className="text-foreground">{voce.descrizione}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={voce.quantita || ''}
                              onChange={(e) => updateVoce(index, 'quantita', parseInt(e.target.value))}
                              className="w-20 px-2 py-1 bg-background border border-border rounded text-center text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                            />
                          ) : (
                            <span className="text-foreground">{voce.quantita || '-'}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={voce.prezzoUnitario || ''}
                              onChange={(e) => updateVoce(index, 'prezzoUnitario', parseFloat(e.target.value))}
                              className="w-28 px-2 py-1 bg-background border border-border rounded text-right text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                            />
                          ) : (
                            <span className="font-medium text-foreground">
                              {voce.prezzoUnitario ? `€ ${voce.prezzoUnitario.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '-'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={voce.iva || ''}
                              onChange={(e) => updateVoce(index, 'iva', parseInt(e.target.value))}
                              className="w-16 px-2 py-1 bg-background border border-border rounded text-center text-sm text-gold focus:outline-none focus:ring-1 focus:ring-gold"
                            />
                          ) : (
                            <span className="text-gold">{voce.iva ? `${voce.iva}%` : '-'}</span>
                          )}
                        </td>
                        {isEditing && (
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => removeVoce(index)}
                              className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-all"
                              title="Rimuovi voce"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : null}

          {/* Note */}
          {(displayData.note || isEditing) && (
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
              {isEditing ? (
                <textarea
                  value={displayData.note || ''}
                  onChange={(e) => updateField('note', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Eventuali note aggiuntive..."
                  rows={3}
                />
              ) : (
                <p className="text-sm text-foreground/70 leading-relaxed">{displayData.note || '-'}</p>
              )}
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
              {isEditing ? "Modifica in corso" : "I dati sono corretti?"}
            </p>
            <p className="text-xs text-foreground/60">
              {isEditing
                ? "Modifica i campi necessari e clicca 'Salva Modifiche' per confermare"
                : "Verifica accuratamente prima di procedere alla generazione dei documenti"
              }
            </p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-background hover:bg-background/60 border border-border rounded-lg text-foreground font-medium transition-all"
                  disabled={isSaving}
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gold hover:bg-gold-dark transition-all rounded-lg text-background font-semibold shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Salvataggio...
                    </>
                  ) : (
                    "Salva Modifiche"
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
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
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
