import type { Gender, StuntingStatus, NutritionStatus } from '../types.ts';

/**
 * WHO Child Growth Standards / WHO Reference 2007 (5 to 19 years)
 * Parameter LMS (Box-Cox power L, Median M, Coefficient of Variation S)
 * Digunakan untuk menghitung Z-score baku:
 * Z = ((y / M)^L - 1) / (L * S) jika L != 0
 * Z = ln(y / M) / S jika L == 0
 */

// Sampel representatif titik umur (bulan: 60 = 5 thn, 72 = 6 thn, 84 = 7 thn, 96 = 8 thn, 108 = 9 thn, 120 = 10 thn, 132 = 11 thn, 144 = 12 thn)
// TB/U (Tinggi Badan menurut Umur dalam cm)
export interface WHOTableEntry {
  ageMonths: number;
  L: number;
  M: number;
  S: number;
  sd3neg: number;
  sd2neg: number;
  sd1neg: number;
  median: number;
  sd1pos: number;
  sd2pos: number;
  sd3pos: number;
}

// Data Kurva TB/U Laki-laki (WHO 2007)
export const WHO_HFA_BOYS: WHOTableEntry[] = [
  { ageMonths: 60,  L: 1, M: 110.0, S: 0.0435, sd3neg: 96.1,  sd2neg: 100.7, sd1neg: 105.3, median: 110.0, sd1pos: 114.6, sd2pos: 119.2, sd3pos: 123.9 },
  { ageMonths: 72,  L: 1, M: 116.0, S: 0.0441, sd3neg: 101.2, sd2neg: 106.1, sd1neg: 111.0, median: 116.0, sd1pos: 120.9, sd2pos: 125.8, sd3pos: 130.8 },
  { ageMonths: 84,  L: 1, M: 121.7, S: 0.0448, sd3neg: 106.0, sd2neg: 111.2, sd1neg: 116.5, median: 121.7, sd1pos: 127.0, sd2pos: 132.2, sd3pos: 137.5 },
  { ageMonths: 96,  L: 1, M: 127.3, S: 0.0456, sd3neg: 110.6, sd2neg: 116.2, sd1neg: 121.7, median: 127.3, sd1pos: 132.8, sd2pos: 138.4, sd3pos: 144.0 },
  { ageMonths: 108, L: 1, M: 132.6, S: 0.0465, sd3neg: 115.1, sd2neg: 121.0, sd1neg: 126.8, median: 132.6, sd1pos: 138.5, sd2pos: 144.3, sd3pos: 150.2 },
  { ageMonths: 120, L: 1, M: 137.8, S: 0.0475, sd3neg: 119.5, sd2neg: 125.6, sd1neg: 131.7, median: 137.8, sd1pos: 143.9, sd2pos: 150.0, sd3pos: 156.2 },
  { ageMonths: 132, L: 1, M: 143.1, S: 0.0488, sd3neg: 123.9, sd2neg: 130.3, sd1neg: 136.7, median: 143.1, sd1pos: 149.5, sd2pos: 156.0, sd3pos: 162.4 },
  { ageMonths: 144, L: 1, M: 149.1, S: 0.0503, sd3neg: 128.6, sd2neg: 135.4, sd1neg: 142.3, median: 149.1, sd1pos: 155.9, sd2pos: 162.8, sd3pos: 169.6 },
  { ageMonths: 156, L: 1, M: 156.0, S: 0.0520, sd3neg: 134.1, sd2neg: 141.4, sd1neg: 148.7, median: 156.0, sd1pos: 163.3, sd2pos: 170.6, sd3pos: 177.9 }
];

// Data Kurva TB/U Perempuan (WHO 2007)
export const WHO_HFA_GIRLS: WHOTableEntry[] = [
  { ageMonths: 60,  L: 1, M: 109.4, S: 0.0435, sd3neg: 95.7,  sd2neg: 100.2, sd1neg: 104.8, median: 109.4, sd1pos: 113.9, sd2pos: 118.5, sd3pos: 123.1 },
  { ageMonths: 72,  L: 1, M: 115.1, S: 0.0442, sd3neg: 100.4, sd2neg: 105.3, sd1neg: 110.2, median: 115.1, sd1pos: 120.0, sd2pos: 124.9, sd3pos: 129.8 },
  { ageMonths: 84,  L: 1, M: 120.8, S: 0.0450, sd3neg: 105.1, sd2neg: 110.3, sd1neg: 115.5, median: 120.8, sd1pos: 126.0, sd2pos: 131.3, sd3pos: 136.5 },
  { ageMonths: 96,  L: 1, M: 126.6, S: 0.0460, sd3neg: 109.8, sd2neg: 115.4, sd1neg: 121.0, median: 126.6, sd1pos: 132.2, sd2pos: 137.8, sd3pos: 143.4 },
  { ageMonths: 108, L: 1, M: 132.5, S: 0.0472, sd3neg: 114.6, sd2neg: 120.6, sd1neg: 126.5, median: 132.5, sd1pos: 138.4, sd2pos: 144.4, sd3pos: 150.3 },
  { ageMonths: 120, L: 1, M: 138.6, S: 0.0487, sd3neg: 119.8, sd2neg: 126.1, sd1neg: 132.4, median: 138.6, sd1pos: 144.9, sd2pos: 151.2, sd3pos: 157.5 },
  { ageMonths: 132, L: 1, M: 145.0, S: 0.0505, sd3neg: 125.4, sd2neg: 132.0, sd1neg: 138.5, median: 145.0, sd1pos: 151.6, sd2pos: 158.1, sd3pos: 164.7 },
  { ageMonths: 144, L: 1, M: 151.2, S: 0.0519, sd3neg: 131.0, sd2neg: 137.7, sd1neg: 144.4, median: 151.2, sd1pos: 157.9, sd2pos: 164.6, sd3pos: 171.4 },
  { ageMonths: 156, L: 1, M: 155.8, S: 0.0524, sd3neg: 135.1, sd2neg: 142.0, sd1neg: 148.9, median: 155.8, sd1pos: 162.7, sd2pos: 169.6, sd3pos: 176.5 }
];

// Data Kurva IMT/U (BMI-for-Age) Laki-laki (WHO 2007)
export const WHO_BMI_BOYS: WHOTableEntry[] = [
  { ageMonths: 60,  L: -1.78, M: 15.3, S: 0.081, sd3neg: 12.1, sd2neg: 13.0, sd1neg: 14.1, median: 15.3, sd1pos: 16.7, sd2pos: 18.3, sd3pos: 20.3 },
  { ageMonths: 72,  L: -1.82, M: 15.3, S: 0.086, sd3neg: 12.0, sd2neg: 12.9, sd1neg: 14.0, median: 15.3, sd1pos: 16.8, sd2pos: 18.6, sd3pos: 20.8 },
  { ageMonths: 84,  L: -1.86, M: 15.5, S: 0.093, sd3neg: 12.0, sd2neg: 13.0, sd1neg: 14.1, median: 15.5, sd1pos: 17.1, sd2pos: 19.1, sd3pos: 21.6 },
  { ageMonths: 96,  L: -1.90, M: 15.7, S: 0.100, sd3neg: 12.1, sd2neg: 13.1, sd1neg: 14.3, median: 15.7, sd1pos: 17.5, sd2pos: 19.8, sd3pos: 22.6 },
  { ageMonths: 108, L: -1.94, M: 16.1, S: 0.109, sd3neg: 12.3, sd2neg: 13.3, sd1neg: 14.6, median: 16.1, sd1pos: 18.1, sd2pos: 20.6, sd3pos: 23.9 },
  { ageMonths: 120, L: -1.98, M: 16.6, S: 0.118, sd3neg: 12.5, sd2neg: 13.7, sd1neg: 15.0, median: 16.6, sd1pos: 18.8, sd2pos: 21.6, sd3pos: 25.4 },
  { ageMonths: 132, L: -2.00, M: 17.2, S: 0.126, sd3neg: 12.9, sd2neg: 14.1, sd1neg: 15.5, median: 17.2, sd1pos: 19.5, sd2pos: 22.7, sd3pos: 26.9 },
  { ageMonths: 144, L: -2.02, M: 17.8, S: 0.133, sd3neg: 13.3, sd2neg: 14.5, sd1neg: 16.0, median: 17.8, sd1pos: 20.4, sd2pos: 23.9, sd3pos: 28.5 },
  { ageMonths: 156, L: -2.03, M: 18.5, S: 0.138, sd3neg: 13.8, sd2neg: 15.1, sd1neg: 16.7, median: 18.5, sd1pos: 21.3, sd2pos: 25.1, sd3pos: 30.1 }
];

// Data Kurva IMT/U (BMI-for-Age) Perempuan (WHO 2007)
export const WHO_BMI_GIRLS: WHOTableEntry[] = [
  { ageMonths: 60,  L: -2.04, M: 15.2, S: 0.084, sd3neg: 11.9, sd2neg: 12.8, sd1neg: 13.9, median: 15.2, sd1pos: 16.7, sd2pos: 18.5, sd3pos: 20.7 },
  { ageMonths: 72,  L: -2.06, M: 15.2, S: 0.090, sd3neg: 11.8, sd2neg: 12.7, sd1neg: 13.9, median: 15.2, sd1pos: 16.9, sd2pos: 18.9, sd3pos: 21.4 },
  { ageMonths: 84,  L: -2.08, M: 15.4, S: 0.097, sd3neg: 11.8, sd2neg: 12.8, sd1neg: 14.0, median: 15.4, sd1pos: 17.2, sd2pos: 19.5, sd3pos: 22.4 },
  { ageMonths: 96,  L: -2.10, M: 15.7, S: 0.106, sd3neg: 11.9, sd2neg: 13.0, sd1neg: 14.2, median: 15.7, sd1pos: 17.7, sd2pos: 20.3, sd3pos: 23.6 },
  { ageMonths: 108, L: -2.11, M: 16.2, S: 0.116, sd3neg: 12.2, sd2neg: 13.3, sd1neg: 14.6, median: 16.2, sd1pos: 18.3, sd2pos: 21.2, sd3pos: 25.1 },
  { ageMonths: 120, L: -2.11, M: 16.8, S: 0.126, sd3neg: 12.5, sd2neg: 13.7, sd1neg: 15.1, median: 16.8, sd1pos: 19.1, sd2pos: 22.4, sd3pos: 26.8 },
  { ageMonths: 132, L: -2.10, M: 17.5, S: 0.134, sd3neg: 12.9, sd2neg: 14.2, sd1neg: 15.7, median: 17.5, sd1pos: 20.0, sd2pos: 23.6, sd3pos: 28.5 },
  { ageMonths: 144, L: -2.08, M: 18.3, S: 0.140, sd3neg: 13.4, sd2neg: 14.8, sd1neg: 16.4, median: 18.3, sd1pos: 21.0, sd2pos: 24.9, sd3pos: 30.2 },
  { ageMonths: 156, L: -2.05, M: 19.0, S: 0.143, sd3neg: 14.0, sd2neg: 15.4, sd1neg: 17.1, median: 19.0, sd1pos: 21.9, sd2pos: 26.0, sd3pos: 31.7 }
];

// Helper: Linear Interpolation untuk parameter L, M, S berdasarkan usia bulan aktual
export function interpolateLMS(table: WHOTableEntry[], ageMonths: number): { L: number; M: number; S: number } {
  const sorted = [...table].sort((a, b) => a.ageMonths - b.ageMonths);
  if (ageMonths <= sorted[0].ageMonths) {
    return { L: sorted[0].L, M: sorted[0].M, S: sorted[0].S };
  }
  if (ageMonths >= sorted[sorted.length - 1].ageMonths) {
    const last = sorted[sorted.length - 1];
    return { L: last.L, M: last.M, S: last.S };
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const next = sorted[i + 1];
    if (ageMonths >= curr.ageMonths && ageMonths <= next.ageMonths) {
      const factor = (ageMonths - curr.ageMonths) / (next.ageMonths - curr.ageMonths);
      return {
        L: curr.L + factor * (next.L - curr.L),
        M: curr.M + factor * (next.M - curr.M),
        S: curr.S + factor * (next.S - curr.S)
      };
    }
  }

  return { L: sorted[0].L, M: sorted[0].M, S: sorted[0].S };
}

/**
 * Formula WHO Z-Score LMS Standar Resmi WHO AnthroPlus:
 * Z = ((y / M)^L - 1) / (L * S) jika |Z| <= 3
 * Dilengkapi Restricted Standard Deviation WHO AnthroPlus jika Z > +3 atau Z < -3
 */
export function calculateZScore(value: number, L: number, M: number, S: number): number {
  if (value <= 0 || M <= 0 || S <= 0) return 0;
  
  let zInd: number;
  if (Math.abs(L) < 0.001) {
    zInd = Math.log(value / M) / S;
  } else {
    zInd = (Math.pow(value / M, L) - 1) / (L * S);
  }

  // WHO AnthroPlus Restricted Tail adjustment beyond +-3 SD
  if (zInd > 3.0) {
    const sd3pos = Math.abs(L) < 0.001 ? M * Math.exp(3 * S) : M * Math.pow(1 + L * S * 3, 1 / L);
    const sd2pos = Math.abs(L) < 0.001 ? M * Math.exp(2 * S) : M * Math.pow(1 + L * S * 2, 1 / L);
    const deltaSD = sd3pos - sd2pos;
    if (deltaSD > 0) {
      zInd = 3.0 + (value - sd3pos) / deltaSD;
    }
  } else if (zInd < -3.0) {
    const sd3neg = Math.abs(L) < 0.001 ? M * Math.exp(-3 * S) : M * Math.pow(1 + L * S * (-3), 1 / L);
    const sd2neg = Math.abs(L) < 0.001 ? M * Math.exp(-2 * S) : M * Math.pow(1 + L * S * (-2), 1 / L);
    const deltaSD = sd2neg - sd3neg;
    if (deltaSD > 0) {
      zInd = -3.0 + (value - sd3neg) / deltaSD;
    }
  }

  return Number(zInd.toFixed(2));
}

/**
 * Hitung Z-Score TB/U (Height-for-Age)
 */
export function computeZScoreHFA(heightCm: number, ageMonths: number, gender: Gender): number {
  const table = gender === 'L' ? WHO_HFA_BOYS : WHO_HFA_GIRLS;
  const { L, M, S } = interpolateLMS(table, ageMonths);
  return calculateZScore(heightCm, L, M, S);
}

/**
 * Hitung Z-Score IMT/U (BMI-for-Age)
 */
export function computeZScoreBMI(bmi: number, ageMonths: number, gender: Gender): number {
  const table = gender === 'L' ? WHO_BMI_BOYS : WHO_BMI_GIRLS;
  const { L, M, S } = interpolateLMS(table, ageMonths);
  return calculateZScore(bmi, L, M, S);
}

/**
 * Klasifikasi Status Stunting berdasarkan Z-score TB/U (Permenkes No 2/2020 & WHO 2007)
 */
export function classifyStunting(zScore: number): StuntingStatus {
  if (zScore < -3.0) return 'Sangat Pendek';
  if (zScore < -2.0) return 'Pendek';
  if (zScore <= 3.0) return 'Normal';
  return 'Tinggi';
}

/**
 * Klasifikasi Status Gizi berdasarkan Z-score IMT/U (Permenkes No 2/2020 & WHO 2007)
 */
export function classifyNutrition(zScore: number): NutritionStatus {
  if (zScore < -3.0) return 'Gizi Buruk';
  if (zScore < -2.0) return 'Gizi Kurang';
  if (zScore <= 1.0) return 'Gizi Baik (Normal)';
  if (zScore <= 2.0) return 'Berisiko Gizi Lebih';
  return 'Obesitas';
}

export function calculateAgeInMonths(birthDateStr: string, measurementDateStr: string): number {
  const birth = new Date(birthDateStr);
  const meas = new Date(measurementDateStr);
  let months = (meas.getFullYear() - birth.getFullYear()) * 12 + (meas.getMonth() - birth.getMonth());
  if (meas.getDate() < birth.getDate()) {
    months -= 1;
  }
  return Math.max(1, months);
}
