/**
 * Pakistani Currency & Regional Formatting Utilities
 */

// Format as PKR with proper Pakistani comma grouping or Lakhs / Crores notation
export function formatPKR(amount: number, options?: { showPrefix?: boolean; compact?: boolean }): string {
  const showPrefix = options?.showPrefix !== false;
  const prefix = showPrefix ? 'Rs. ' : '';

  if (isNaN(amount)) return `${prefix}0`;

  if (options?.compact) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 10000000) {
      // 1 Crore = 10,000,000
      const crore = (abs / 10000000).toFixed(2);
      return `${sign}${prefix}${crore.replace(/\.00$/, '')} Cr`;
    }
    if (abs >= 100000) {
      // 1 Lakh = 100,000
      const lakh = (abs / 100000).toFixed(2);
      return `${sign}${prefix}${lakh.replace(/\.00$/, '')} Lac`;
    }
    if (abs >= 1000) {
      const k = (abs / 1000).toFixed(1);
      return `${sign}${prefix}${k.replace(/\.0$/, '')}k`;
    }
  }

  // Pakistani comma format: 12,34,567
  const parts = Math.round(amount).toString().split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${prefix}${formatted}`;
}

// Convert Tola to Grams (1 Tola = 11.6638 Grams = 12 Masha = 96 Ratti)
export const GOLD_CONSTANTS = {
  GRAMS_PER_TOLA: 11.6638,
  MASHA_PER_TOLA: 12,
  RATTI_PER_TOLA: 96,
  RATTI_PER_MASHA: 8,
};

export function tolaToGrams(tola: number, masha = 0, ratti = 0): number {
  const totalTola = tola + masha / GOLD_CONSTANTS.MASHA_PER_TOLA + ratti / GOLD_CONSTANTS.RATTI_PER_TOLA;
  return Number((totalTola * GOLD_CONSTANTS.GRAMS_PER_TOLA).toFixed(3));
}

export function gramsToTolaBreakdown(grams: number): { tola: number; masha: number; ratti: number } {
  const totalTola = grams / GOLD_CONSTANTS.GRAMS_PER_TOLA;
  const tola = Math.floor(totalTola);
  const remainingMasha = (totalTola - tola) * GOLD_CONSTANTS.MASHA_PER_TOLA;
  const masha = Math.floor(remainingMasha);
  const remainingRatti = (remainingMasha - masha) * GOLD_CONSTANTS.RATTI_PER_MASHA;
  const ratti = Number(remainingRatti.toFixed(2));
  return { tola, masha, ratti };
}

// Real estate area conversion (1 Kanal = 20 Marlas = 4500 sq ft or 5440 sq ft depending on region, standard CDA/LDA: 1 Marla = 225 sq ft)
export const REAL_ESTATE_CONSTANTS = {
  MARLAS_PER_KANAL: 20,
  SQFT_PER_MARLA: 225, // standard residential
};

export function marlaToKanal(marla: number): { kanal: number; remainingMarla: number } {
  const kanal = Math.floor(marla / REAL_ESTATE_CONSTANTS.MARLAS_PER_KANAL);
  const remainingMarla = marla % REAL_ESTATE_CONSTANTS.MARLAS_PER_KANAL;
  return { kanal, remainingMarla };
}

export function formatMarlaToKanal(marla: number): string {
  const kanalValue = marla / REAL_ESTATE_CONSTANTS.MARLAS_PER_KANAL;
  if (kanalValue >= 1 && marla % REAL_ESTATE_CONSTANTS.MARLAS_PER_KANAL === 0) {
    return `${kanalValue} Kanal`;
  }
  if (kanalValue >= 1) {
    const k = Math.floor(kanalValue);
    const r = marla % REAL_ESTATE_CONSTANTS.MARLAS_PER_KANAL;
    return `${k} Kanal ${r} Marla`;
  }
  return `${kanalValue.toFixed(2).replace(/\.?0+$/, '')} Kanal`;
}

export function marlaToSqFt(marla: number): number {
  return marla * REAL_ESTATE_CONSTANTS.SQFT_PER_MARLA;
}

// Date formatter
export function formatPakistaniDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}
