/**
 * Converte un numero in lettere in italiano
 * Formato: "milleduecentotrentaquattro/56" per 1234.56
 */

const unita = [
  "",
  "uno",
  "due",
  "tre",
  "quattro",
  "cinque",
  "sei",
  "sette",
  "otto",
  "nove",
];

const decine = [
  "",
  "dieci",
  "venti",
  "trenta",
  "quaranta",
  "cinquanta",
  "sessanta",
  "settanta",
  "ottanta",
  "novanta",
];

const speciali = [
  "dieci",
  "undici",
  "dodici",
  "tredici",
  "quattordici",
  "quindici",
  "sedici",
  "diciassette",
  "diciotto",
  "diciannove",
];

const centinaia = [
  "",
  "cento",
  "duecento",
  "trecento",
  "quattrocento",
  "cinquecento",
  "seicento",
  "settecento",
  "ottocento",
  "novecento",
];

function convertiFinoANove(n: number): string {
  return unita[n] || "";
}

function convertiFinoANovantaNove(n: number): string {
  if (n < 10) return unita[n];
  if (n >= 10 && n < 20) return speciali[n - 10];

  const decina = Math.floor(n / 10);
  const resto = n % 10;

  let risultato = decine[decina];

  // Gestisci casi speciali (es. "ventuno", "trentotto")
  if (resto === 1 || resto === 8) {
    // Rimuovi ultima vocale della decina
    risultato = risultato.slice(0, -1);
  }

  risultato += unita[resto];
  return risultato;
}

function convertiFinoANovecentoNovantaNove(n: number): string {
  if (n < 100) return convertiFinoANovantaNove(n);

  const centinaia_val = Math.floor(n / 100);
  const resto = n % 100;

  let risultato = centinaia[centinaia_val];

  if (resto > 0) {
    risultato += convertiFinoANovantaNove(resto);
  }

  return risultato;
}

function convertiMigliaia(n: number): string {
  if (n < 1000) return convertiFinoANovecentoNovantaNove(n);

  const migliaia = Math.floor(n / 1000);
  const resto = n % 1000;

  let risultato = "";

  if (migliaia === 1) {
    risultato = "mille";
  } else {
    risultato = convertiFinoANovecentoNovantaNove(migliaia) + "mila";
  }

  if (resto > 0) {
    risultato += convertiFinoANovecentoNovantaNove(resto);
  }

  return risultato;
}

function convertiMilioni(n: number): string {
  if (n < 1000000) return convertiMigliaia(n);

  const milioni = Math.floor(n / 1000000);
  const resto = n % 1000000;

  let risultato = "";

  if (milioni === 1) {
    risultato = "unmilione";
  } else {
    risultato = convertiMigliaia(milioni) + "milioni";
  }

  if (resto > 0) {
    risultato += convertiMigliaia(resto);
  }

  return risultato;
}

/**
 * Converte un numero con decimali in lettere
 * Formato: "milleduecentotrentaquattro/56" per 1234.56
 */
export function numberToWords(num: number): string {
  if (num === 0) return "zero/00";

  const parts = num.toFixed(2).split(".");
  const integerPart = parseInt(parts[0], 10);
  const decimalPart = parts[1];

  const parteIntera = convertiMilioni(integerPart);

  return `${parteIntera}/${decimalPart}`;
}

/**
 * Versione completa con "virgola"
 * Formato: "milleduecentotrentaquattro virgola cinquantasei" per 1234.56
 */
export function numberToWordsComplete(num: number): string {
  if (num === 0) return "zero";

  const parts = num.toFixed(2).split(".");
  const integerPart = parseInt(parts[0], 10);
  const decimalPart = parseInt(parts[1], 10);

  const parteIntera = convertiMilioni(integerPart);

  if (decimalPart === 0) {
    return parteIntera;
  }

  const parteDecimale = convertiFinoANovantaNove(decimalPart);

  return `${parteIntera} virgola ${parteDecimale}`;
}
