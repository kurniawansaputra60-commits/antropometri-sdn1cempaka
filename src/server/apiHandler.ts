import { INITIAL_STUDENTS } from '../data/mockStudents.ts';
import type { Student, MeasurementRecord } from '../types.ts';
import { 
  computeZScoreHFA, 
  computeZScoreBMI, 
  classifyStunting, 
  classifyNutrition, 
  calculateAgeInMonths 
} from '../data/whoReference.ts';

// In-memory runtime database for live IoT ingestion
let serverStudents: Student[] = [...INITIAL_STUDENTS];
let liveMeasurementLogs: Array<{
  id: string;
  timestamp: string;
  rfidUid: string;
  studentName: string;
  className: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  zScoreHFA: number;
  zScoreBMI: number;
  stuntingStatus: string;
  nutritionStatus: string;
  deviceSerial: string;
  originIp: string;
  status: 'SUCCESS' | 'ERROR';
  latencyMs: number;
}> = [];

export function getLiveStudents(): Student[] {
  return serverStudents;
}

export function getLiveMeasurementLogs() {
  return liveMeasurementLogs;
}

/**
 * Handle incoming IoT ingestion request from physical ESP32 or test client
 */
export function handleIoTSyncRequest(payload: any, clientIp: string = '192.168.1.145') {
  const startTime = Date.now();
  const { rfidUid, weightKg, heightCm, deviceSerial = 'ESP32-ANTRO-SDN1C-01' } = payload || {};

  if (!rfidUid || typeof weightKg !== 'number' || typeof heightCm !== 'number') {
    return {
      status: 400,
      body: {
        status: 'error',
        code: 400,
        message: 'Invalid payload: rfidUid, weightKg (number), and heightCm (number) are required.'
      }
    };
  }

  // Find student by RFID UID or NISN
  const cleanUid = String(rfidUid).trim().toUpperCase();
  let student = serverStudents.find(
    s => s.rfidUid.toUpperCase() === cleanUid || s.nisn === cleanUid || s.id === cleanUid
  );

  const todayStr = new Date().toISOString().split('T')[0];

  // If unregistered RFID, create a provisional student entry so physical testing never fails silently
  if (!student) {
    const provisionalId = `std-rfid-${cleanUid.replace(/[^A-Z0-9]/g, '')}`;
    student = {
      id: provisionalId,
      nisn: `01${Math.floor(10000000 + Math.random() * 90000000)}`,
      name: `Siswa Baru (Tag: ${cleanUid})`,
      gender: 'L',
      birthDate: '2017-06-15',
      className: 'UKS',
      parentName: 'Orang Tua Siswa',
      parentPhone: '081234567890',
      rfidUid: cleanUid,
      measurements: []
    };
    serverStudents.push(student);
  }

  // Calculate WHO metrics
  const ageMonths = calculateAgeInMonths(student.birthDate, todayStr);
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(2));
  const zScoreHFA = computeZScoreHFA(heightCm, ageMonths, student.gender);
  const zScoreBMI = computeZScoreBMI(bmi, ageMonths, student.gender);
  const stuntingStatus = classifyStunting(zScoreHFA);
  const nutritionStatus = classifyNutrition(zScoreBMI);

  const newRecord: MeasurementRecord = {
    id: `m-iot-${Date.now()}`,
    studentId: student.id,
    date: todayStr,
    ageMonths,
    weightKg: Number(weightKg.toFixed(1)),
    heightCm: Number(heightCm.toFixed(1)),
    bmi,
    zScoreHFA,
    zScoreBMI,
    stuntingStatus,
    nutritionStatus,
    source: 'IoT-Device',
    deviceSerial,
    measuredBy: 'ESP32 Stadiometer IoT SDN 1 Cempaka',
    notes: `Otomatis tersinkronisasi via RFID ${cleanUid}`
  };

  // Add to student's measurement history
  student.measurements.push(newRecord);

  const latencyMs = Date.now() - startTime;

  // Add to network telemetry log
  liveMeasurementLogs.unshift({
    id: newRecord.id,
    timestamp: new Date().toISOString(),
    rfidUid: cleanUid,
    studentName: student.name,
    className: student.className,
    weightKg: newRecord.weightKg,
    heightCm: newRecord.heightCm,
    bmi,
    zScoreHFA,
    zScoreBMI,
    stuntingStatus,
    nutritionStatus,
    deviceSerial,
    originIp: clientIp,
    status: 'SUCCESS',
    latencyMs: Math.max(12, latencyMs)
  });

  // Limit log size to 50 items
  if (liveMeasurementLogs.length > 50) {
    liveMeasurementLogs = liveMeasurementLogs.slice(0, 50);
  }

  return {
    status: 200,
    body: {
      status: 'success',
      code: 200,
      message: 'Data pengukuran berhasil disinkronisasi ke server UKS SDN 1 Cempaka',
      timestamp: new Date().toISOString(),
      student: {
        id: student.id,
        name: student.name,
        className: student.className,
        nisn: student.nisn,
        gender: student.gender
      },
      measurement: newRecord
    }
  };
}
