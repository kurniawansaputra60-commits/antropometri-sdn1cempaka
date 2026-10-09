export type Gender = 'L' | 'P'; // Laki-laki / Perempuan

export type StuntingStatus = 'Sangat Pendek' | 'Pendek' | 'Normal' | 'Tinggi';
export type NutritionStatus = 'Gizi Buruk' | 'Gizi Kurang' | 'Gizi Baik (Normal)' | 'Berisiko Gizi Lebih' | 'Gizi Lebih' | 'Obesitas';

export interface MeasurementRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  ageMonths: number;
  weightKg: number;
  heightCm: number;
  bmi: number;
  zScoreHFA: number; // Height-for-Age (TB/U)
  zScoreBMI: number; // BMI-for-Age (IMT/U)
  zScoreWFA?: number; // Weight-for-Age (BB/U)
  stuntingStatus: StuntingStatus;
  nutritionStatus: NutritionStatus;
  source: 'IoT-Device' | 'Manual-UKS';
  deviceSerial?: string;
  measuredBy: string;
  notes?: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  className: string; // '1A', '2B', etc.
  parentName: string;
  parentPhone: string;
  rfidUid: string;
  photoUrl?: string;
  measurements: MeasurementRecord[];
}

export interface LMSValues {
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

export interface IoTTelemetry {
  isConnected: boolean;
  deviceIp: string;
  signalDbm: number;
  lastHeartbeat: string;
  currentTareWeight: number;
  rfidScannedUid: string | null;
  sensorDistanceRaw: number;
  loadCellRaw: number;
}

// RBAC (Role-Based Access Control) Types
export type UserRole = 'TEACHER_UKS' | 'PARENT' | 'AUDITOR' | 'GUEST';

export interface UserSession {
  role: UserRole;
  name: string;
  identifier: string; // NIP untuk guru, NISN anak untuk ortu, NIP/ID untuk auditor
  verifiedChildId?: string; // Jika role PARENT, hanya bisa lihat siswa ini
  loginTime: string;
}

// Validasi Komputasi WHO AnthroPlus Benchmark Types
export interface AnthroPlusValidationCase {
  id: string;
  sampleName: string;
  gender: Gender;
  ageMonths: number;
  heightCm: number;
  weightKg: number;
  // Official Gold-Standard outputs from WHO AnthroPlus software
  anthroPlusHFA: number;
  anthroPlusBMI: number;
  expectedStuntingStatus: StuntingStatus;
  expectedNutritionStatus: NutritionStatus;
  clinicalNote: string;
}
