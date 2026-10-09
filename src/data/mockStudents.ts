import { Student } from '../types';
import { computeZScoreHFA, computeZScoreBMI, classifyStunting, classifyNutrition, calculateAgeInMonths } from './whoReference';

function createRecord(
  id: string,
  studentId: string,
  date: string,
  birthDate: string,
  gender: 'L' | 'P',
  weightKg: number,
  heightCm: number,
  source: 'IoT-Device' | 'Manual-UKS' = 'IoT-Device',
  measuredBy: string = 'Petugas UKS (Siti Rohmah, S.Pd)',
  notes?: string
) {
  const ageMonths = calculateAgeInMonths(birthDate, date);
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(2));
  const zScoreHFA = computeZScoreHFA(heightCm, ageMonths, gender);
  const zScoreBMI = computeZScoreBMI(bmi, ageMonths, gender);
  const stuntingStatus = classifyStunting(zScoreHFA);
  const nutritionStatus = classifyNutrition(zScoreBMI);

  return {
    id,
    studentId,
    date,
    ageMonths,
    weightKg,
    heightCm,
    bmi,
    zScoreHFA,
    zScoreBMI,
    stuntingStatus,
    nutritionStatus,
    source,
    deviceSerial: 'ESP32-ANTRO-SDN1C-01',
    measuredBy,
    notes,
  };
}

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-001',
    nisn: '0129482011',
    name: 'Muhammad Farhan',
    gender: 'L',
    birthDate: '2016-04-12', // Sekitar 10 tahun 6 bulan (~126 bulan di Okt 2026)
    className: '4A',
    parentName: 'Bambang Supriyadi',
    parentPhone: '081234567890',
    rfidUid: 'E4:9B:12:F1',
    measurements: [
      createRecord('m-001-1', 'std-001', '2025-04-15', '2016-04-12', 'L', 31.0, 134.5, 'IoT-Device', 'Petugas UKS', 'Pemeriksaan Awal Semester 2'),
      createRecord('m-001-2', 'std-001', '2025-10-18', '2016-04-12', 'L', 32.8, 137.2, 'IoT-Device', 'Petugas UKS', 'Pemeriksaan Rutin Semester 1'),
      createRecord('m-001-3', 'std-001', '2026-04-14', '2016-04-12', 'L', 34.5, 140.0, 'IoT-Device', 'Petugas UKS', 'Monitoring Berkala'),
      createRecord('m-001-4', 'std-001', '2026-10-05', '2016-04-12', 'L', 36.2, 142.8, 'IoT-Device', 'Petugas UKS', 'Pertumbuhan normal stabil')
    ]
  },
  {
    id: 'std-002',
    nisn: '0138294712',
    name: 'Aisyah Putri Rahmadani',
    gender: 'P',
    birthDate: '2017-08-20', // Sekitar 9 tahun 2 bulan (~110 bulan di Okt 2026)
    className: '3B',
    parentName: 'Hendra Gunawan',
    parentPhone: '081398765432',
    rfidUid: 'A1:3F:89:0C',
    measurements: [
      createRecord('m-002-1', 'std-002', '2025-05-10', '2017-08-20', 'P', 20.1, 118.0, 'IoT-Device', 'Petugas UKS', 'Terindikasi Tinggi Badan kurang (Pendek)'),
      createRecord('m-002-2', 'std-002', '2025-10-20', '2017-08-20', 'P', 21.4, 120.2, 'IoT-Device', 'Petugas UKS', 'Diberikan intervensi PMT & edukasi gizi'),
      createRecord('m-002-3', 'std-002', '2026-04-16', '2017-08-20', 'P', 23.5, 124.5, 'IoT-Device', 'Petugas UKS', 'Respon positif intervensi gizi UKS'),
      createRecord('m-002-4', 'std-002', '2026-10-06', '2017-08-20', 'P', 25.0, 128.2, 'IoT-Device', 'Petugas UKS', 'Status membaik menuju batas normal')
    ]
  },
  {
    id: 'std-003',
    nisn: '0147281930',
    name: 'Bintang Pratama',
    gender: 'L',
    birthDate: '2018-02-14', // Sekitar 8 tahun 8 bulan (~104 bulan di Okt 2026)
    className: '2A',
    parentName: 'Dedi Kurniawan',
    parentPhone: '085712349876',
    rfidUid: 'B3:4D:77:2E',
    measurements: [
      createRecord('m-003-1', 'std-003', '2025-09-12', '2018-02-14', 'L', 20.0, 116.5, 'IoT-Device', 'Petugas UKS', 'Terdeteksi Stunted (Z-score < -2.0)'),
      createRecord('m-003-2', 'std-003', '2026-03-20', '2018-02-14', 'L', 21.8, 119.4, 'IoT-Device', 'Petugas UKS', 'Konsultasi bersama Puskesmas Cempaka'),
      createRecord('m-003-3', 'std-003', '2026-10-07', '2018-02-14', 'L', 23.1, 122.0, 'IoT-Device', 'Petugas UKS', 'Pemantauan ketat program susu & telur')
    ]
  },
  {
    id: 'std-004',
    nisn: '0156372819',
    name: 'Nabila Zahra Syahrani',
    gender: 'P',
    birthDate: '2019-06-05', // Sekitar 7 tahun 4 bulan (~88 bulan di Okt 2026)
    className: '1A',
    parentName: 'Suryanto',
    parentPhone: '082199887766',
    rfidUid: 'C8:5E:33:11',
    measurements: [
      createRecord('m-004-1', 'std-004', '2026-07-20', '2019-06-05', 'P', 22.0, 121.0, 'IoT-Device', 'Petugas UKS', 'Pengukuran Masuk Siswa Baru'),
      createRecord('m-004-2', 'std-004', '2026-10-08', '2019-06-05', 'P', 22.8, 122.5, 'IoT-Device', 'Petugas UKS', 'Pertumbuhan sangat baik dan aktif')
    ]
  },
  {
    id: 'std-005',
    nisn: '0112938475',
    name: 'Rafa Aditya Wijaya',
    gender: 'L',
    birthDate: '2015-11-28', // Sekitar 10 tahun 11 bulan (~131 bulan di Okt 2026)
    className: '5B',
    parentName: 'Agus Wijaya',
    parentPhone: '081122334455',
    rfidUid: 'D9:6A:44:88',
    measurements: [
      createRecord('m-005-1', 'std-005', '2025-03-10', '2015-11-28', 'L', 45.0, 138.0, 'IoT-Device', 'Petugas UKS', 'IMT/U tinggi (Berisiko Gizi Lebih)'),
      createRecord('m-005-2', 'std-005', '2025-09-15', '2015-11-28', 'L', 46.5, 140.2, 'IoT-Device', 'Petugas UKS', 'Edukasi aktivitas fisik & kurangi gula'),
      createRecord('m-005-3', 'std-005', '2026-04-10', '2015-11-28', 'L', 47.0, 143.5, 'IoT-Device', 'Petugas UKS', 'Laju kenaikan BB mulai terkendali'),
      createRecord('m-005-4', 'std-005', '2026-10-02', '2015-11-28', 'L', 47.8, 146.0, 'IoT-Device', 'Petugas UKS', 'Kategori membaik')
    ]
  },
  {
    id: 'std-006',
    nisn: '0103847291',
    name: 'Dewi Lestari',
    gender: 'P',
    birthDate: '2014-08-15', // Sekitar 12 tahun 2 bulan (~146 bulan di Okt 2026)
    className: '6A',
    parentName: 'Eko Santoso',
    parentPhone: '087812345678',
    rfidUid: 'F2:1B:99:43',
    measurements: [
      createRecord('m-006-1', 'std-006', '2025-08-25', '2014-08-15', 'P', 38.0, 148.0, 'IoT-Device', 'Petugas UKS', 'Pertumbuhan normal'),
      createRecord('m-006-2', 'std-006', '2026-03-12', '2014-08-15', 'P', 41.2, 151.4, 'IoT-Device', 'Petugas UKS', 'Perkembangan optimal kelas 6'),
      createRecord('m-006-3', 'std-006', '2026-09-28', '2014-08-15', 'P', 43.0, 153.2, 'IoT-Device', 'Petugas UKS', 'Status gizi baik & normal')
    ]
  }
];
