"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

interface Document {
  id: string;
  type: "affidamento" | "proposta" | "determina";
  title: string;
  content: string;
}

interface DocumentViewerProps {
  documents: Document[];
  onClose: () => void;
}

export default function DocumentViewer({ documents, onClose }: DocumentViewerProps) {
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || "");
  const [zoom, setZoom] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  const selectedDoc = documents.find(doc => doc.id === selectedDocId);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "affidamento":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "proposta":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case "determina":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
    }
  };

  const getCurrentContent = () => {
    if (!selectedDoc) return "";
    return editedContent[selectedDoc.id] ?? selectedDoc.content;
  };

  const handleContentChange = (value: string) => {
    if (selectedDoc) {
      setEditedContent(prev => ({
        ...prev,
        [selectedDoc.id]: value
      }));
    }
  };

  const handleDownload = () => {
    // Logica per scaricare il documento
    console.log("Download documento:", selectedDoc?.title);
  };

  const handleDownloadAll = () => {
    // Logica per scaricare tutti i documenti
    console.log("Download tutti i documenti");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border bg-card-bg flex flex-col">
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
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-card-bg hover:bg-background/60 border border-border transition-all rounded-lg text-foreground font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Nuovo documento
          </button>
        </div>

        {/* Lista documenti generati */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs text-foreground/50 px-3 py-2 font-medium">DOCUMENTI GENERATI</div>
          {documents.map((doc) => (
            <motion.button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                selectedDoc?.id === doc.id
                  ? "bg-gold/20 border border-gold/50"
                  : "hover:bg-background/60"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <div className={selectedDoc?.id === doc.id ? "text-gold" : "text-foreground/60"}>
                  {getDocumentIcon(doc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground font-medium truncate">
                    {doc.title}
                  </div>
                  <div className="text-xs text-foreground/60 capitalize mt-0.5">
                    {doc.type}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={handleDownloadAll}
            className="w-full px-4 py-2.5 bg-gold hover:bg-gold-dark transition-all rounded-lg text-background font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Scarica tutto
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm">
          {/* Document Tabs */}
          <div className="flex items-center gap-2 px-4 pt-4 overflow-x-auto">
            {documents.map((doc) => (
              <motion.button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                  selectedDoc?.id === doc.id
                    ? "border-gold bg-card-bg text-foreground font-medium"
                    : "border-transparent hover:bg-card-bg/50 text-foreground/60"
                }`}
                whileHover={{ y: -2 }}
              >
                {getDocumentIcon(doc.type)}
                <span className="text-sm">{doc.title}</span>
              </motion.button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isEditing
                    ? "bg-gold text-background"
                    : "bg-card-bg text-foreground hover:bg-card-bg/60"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {isEditing ? "Visualizza" : "Modifica"}
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-card-bg hover:bg-card-bg/60 rounded-lg text-sm font-medium text-foreground transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Scarica
              </button>
            </div>
          </div>
        </header>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDocId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {/* Document Paper */}
              <motion.div
                className="bg-white rounded-lg shadow-2xl overflow-hidden"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top center",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {isEditing ? (
                  <textarea
                    value={getCurrentContent()}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full min-h-[800px] p-12 text-gray-900 font-serif text-base leading-relaxed resize-none focus:outline-none"
                    style={{ fontSize: `${16 * (zoom / 100)}px` }}
                  />
                ) : (
                  <div
                    className="p-12 text-gray-900 font-serif text-base leading-relaxed whitespace-pre-wrap"
                    style={{ fontSize: `${16 * (zoom / 100)}px` }}
                  >
                    {getCurrentContent()}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Zoom Control Bar */}
        <div className="border-t border-border bg-card-bg/80 backdrop-blur-sm px-6 py-3">
          <div className="max-w-md mx-auto flex items-center gap-4">
            {/* Zoom Out Button */}
            <motion.button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-2 hover:bg-background/60 rounded-lg transition-colors text-foreground"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={zoom <= 50}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </motion.button>

            {/* Zoom Slider */}
            <div className="flex-1 flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="150"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer zoom-slider"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((zoom - 50) / 100) * 100}%, #1e3a2a ${((zoom - 50) / 100) * 100}%, #1e3a2a 100%)`
                }}
              />
              <span className="text-sm font-medium text-foreground w-12 text-center">
                {zoom}%
              </span>
            </div>

            {/* Zoom In Button */}
            <motion.button
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              className="p-2 hover:bg-background/60 rounded-lg transition-colors text-foreground"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={zoom >= 150}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </motion.button>

            {/* Reset Zoom */}
            <motion.button
              onClick={() => setZoom(100)}
              className="px-3 py-1.5 bg-background hover:bg-background/60 rounded-lg text-xs font-medium text-foreground transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset
            </motion.button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .zoom-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .zoom-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
