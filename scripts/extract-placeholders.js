/**
 * Script per estrarre tutti i placeholder da un template docx
 */

const fs = require('fs');
const PizZip = require('pizzip');

const templatePath = process.argv[2] || './public/M-APP-08A_TAGGED_Ordine affidamento diretto_RUP uguale DIRIGENTE_rev00.docx';

console.log(`\n📄 Analisi template: ${templatePath}\n`);

// Leggi il file docx
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

// Estrai document.xml
const doc = zip.files['word/document.xml'].asText();

// Trova tutti i placeholder {qualcosa}
// Regex che cattura tutto tra { e }
const placeholderRegex = /\{([^}]+)\}/g;
const matches = doc.matchAll(placeholderRegex);

const placeholders = new Set();

for (const match of matches) {
  placeholders.add(match[1]);
}

console.log('✅ Placeholder trovati:\n');
const sorted = Array.from(placeholders).sort();
sorted.forEach(p => console.log(`  • {${p}}`));

console.log(`\n📊 Totale: ${placeholders.size} placeholder\n`);

// Genera JSON per configurazione
const config = {
  templateName: "ordine_affidamento",
  templateFile: "M-APP-08A_TAGGED_Ordine affidamento diretto_RUP uguale DIRIGENTE_rev00.docx",
  placeholders: {}
};

sorted.forEach(p => {
  config.placeholders[p] = {
    type: "direct", // o "llm" per quelli da generare
    description: `Placeholder per ${p}`
  };
});

console.log('📝 Configurazione JSON:\n');
console.log(JSON.stringify(config, null, 2));
