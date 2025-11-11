/**
 * Script per riparare i placeholder spezzati in un documento Word
 *
 * Word spesso divide i placeholder su più tag XML, es:
 * {</w:t></w:r><w:r><w:t>R_Nome</w:t></w:r><w:r><w:t>}
 *
 * Questo script li unifica in:
 * {R_Nome}
 */

const fs = require('fs');
const PizZip = require('pizzip');

// File di input e output
const inputFile = process.argv[2] || './public/M-APP-08A_TAGGED_Ordine affidamento diretto_RUP uguale DIRIGENTE_rev00.docx';
const outputFile = process.argv[3] || './public/M-APP-08A_FIXED_Ordine affidamento diretto_RUP uguale DIRIGENTE_rev00.docx';

console.log(`\n📄 Riparazione placeholder in: ${inputFile}`);
console.log(`💾 Output: ${outputFile}\n`);

try {
  // 1. Leggi il file docx
  const content = fs.readFileSync(inputFile);
  const zip = new PizZip(content);

  // 2. Estrai document.xml
  let docXml = zip.files['word/document.xml'].asText();

  console.log(`📊 Dimensione originale: ${docXml.length} caratteri`);

  // 3. Ripara i placeholder spezzati
  // Strategia: trova sequenze {....} e consolida tutti i tag <w:t> interni

  let fixed = docXml;
  let iterations = 0;
  const maxIterations = 50; // Previeni loop infiniti

  // Pattern per trovare placeholder spezzati:
  // Cerca { seguito da contenuto con tag XML, fino a }
  const placeholderPattern = /\{([^{}]*?)<\/w:t>([^{}]*?)<w:t[^>]*>([^{}]*?)\}/g;

  while (placeholderPattern.test(fixed) && iterations < maxIterations) {
    iterations++;

    // Sostituisci unendo il contenuto
    fixed = fixed.replace(placeholderPattern, (match, before, middle, after) => {
      // Estrai solo il testo dai tag XML in "middle"
      const middleText = middle.replace(/<[^>]+>/g, '').trim();
      const consolidated = `{${before}${middleText}${after}}`;
      return consolidated;
    });

    // Reset del regex per il prossimo ciclo
    placeholderPattern.lastIndex = 0;
  }

  // Pattern aggiuntivo per casi più complessi
  // Rimuovi tag vuoti tra { e }
  fixed = fixed.replace(/(\{[^{}]*?)<\/w:t><[^>]+><w:t[^>]*>([^{}]*?\})/g, '$1$2');

  // Pulisci spazi e tag di formattazione all'interno dei placeholder
  fixed = fixed.replace(/\{([^{}]*?)\}/g, (match, content) => {
    // Rimuovi tutti i tag XML interni
    const cleaned = content.replace(/<[^>]+>/g, '').replace(/\s+/g, '_');
    return `{${cleaned}}`;
  });

  console.log(`🔧 Iterazioni di riparazione: ${iterations}`);
  console.log(`📊 Dimensione dopo fix: ${fixed.length} caratteri`);

  // 4. Aggiorna il document.xml nel zip
  zip.file('word/document.xml', fixed);

  // 5. Genera il nuovo docx
  const buf = zip.generate({
    type: 'nodebuffer',
    compression: 'DEFLATE'
  });

  // 6. Salva il file riparato
  fs.writeFileSync(outputFile, buf);

  console.log(`\n✅ File riparato salvato: ${outputFile}\n`);

  // 7. Estrai i placeholder dal file riparato per verifica
  const placeholders = new Set();
  const regex = /\{([^}]+)\}/g;
  let match;

  while ((match = regex.exec(fixed)) !== null) {
    placeholders.add(match[1]);
  }

  console.log(`📋 Placeholder trovati nel file riparato:\n`);
  Array.from(placeholders).sort().forEach(p => {
    console.log(`  • {${p}}`);
  });

  console.log(`\n✨ Totale: ${placeholders.size} placeholder\n`);

} catch (error) {
  console.error('\n❌ Errore durante la riparazione:', error);
  process.exit(1);
}
