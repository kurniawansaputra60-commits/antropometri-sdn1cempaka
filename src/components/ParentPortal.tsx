import React, { useState } from 'react';
import { Student, UserSession } from '../types';
import { GrowthChart } from './GrowthChart';
import { PrintableReport } from './PrintableReport';
import { 
  Heart, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Apple, 
  Calendar, 
  Printer, 
  TrendingUp, 
  Phone,
  ShieldCheck,
  UserCheck,
  Lock
} from 'lucide-react';

interface ParentPortalProps {
  students: Student[];
  userSession?: UserSession;
}

export function ParentPortal({ students, userSession }: ParentPortalProps) {
  // If parent session has a verified child, lock to that child
  const initialStudentId = userSession?.role === 'PARENT' && userSession.verifiedChildId
    ? userSession.verifiedChildId
    : students[0]?.id || '';

  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);
  const [nisnSearch, setNisnSearch] = useState<string>('');
  const [searchError, setSearchError] = useState<string>('');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // If role is parent, ensure they can only view their own child
  const effectiveStudentId = userSession?.role === 'PARENT' && userSession.verifiedChildId
    ? userSession.verifiedChildId
    : selectedStudentId;

  const student = students.find(s => s.id === effectiveStudentId) || students[0];
  const isParentLocked = userSession?.role === 'PARENT' && Boolean(userSession.verifiedChildId);

  const handleSearchNisn = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const found = students.find(s => s.nisn.trim() === nisnSearch.trim());
    if (found) {
      setSelectedStudentId(found.id);
    } else {
      setSearchError(`Siswa dengan NISN "${nisnSearch}" tidak ditemukan.`);
    }
  };

  if (!student) return null;

  const measurements = [...student.measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const latestMeas = measurements[measurements.length - 1];
  const previousMeas = measurements.length > 1 ? measurements[measurements.length - 2] : null;

  const heightGain = previousMeas && latestMeas 
    ? (latestMeas.heightCm - previousMeas.heightCm).toFixed(1) 
    : null;
  const weightGain = previousMeas && latestMeas 
    ? (latestMeas.weightKg - previousMeas.weightKg).toFixed(1) 
    : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner for Parents */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 text-rose-300" />
            Portal Orang Tua • Monitoring Tumbuh Kembang Siswa
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Pantau Pertumbuhan Ananda dari Rumah
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Data antropometri ditimbang dan diukur secara digital di ruang UKS SDN 1 Cempaka menggunakan perangkat IoT terkalibrasi. Anda dapat melihat perkembangan tinggi, berat, dan status gizi anak secara berkala setiap semester.
          </p>

          {/* Quick NISN Finder & Switcher (Hidden/Locked if logged in as specific Parent) */}
          {isParentLocked ? (
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-xs font-semibold text-white border border-white/30">
                <Lock className="w-3.5 h-3.5 text-emerald-300" />
                <span>Hak Akses Terverifikasi: Data Khusus Ananda <strong>{student.name}</strong> (NISN: {student.nisn})</span>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <form onSubmit={handleSearchNisn} className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Masukkan NISN anak (contoh: 0129482011)..."
                  value={nisnSearch}
                  onChange={(e) => setNisnSearch(e.target.value)}
                  className="w-full px-4 py-2 text-xs text-slate-800 bg-white rounded-xl focus:outline-hidden font-mono shadow-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-all shrink-0"
                >
                  Cari Anak
                </button>
              </form>

              {searchError && (
                <span className="text-xs bg-rose-900/60 text-white px-3 py-1 rounded-lg font-medium">
                  {searchError}
                </span>
              )}

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs text-emerald-200">Pilih cepat:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-3 py-2 text-xs bg-white text-slate-800 font-semibold rounded-xl focus:outline-hidden"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Kelas {s.className})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Child Profile & Current Growth Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card (1 Col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg flex items-center justify-center">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{student.name}</h3>
              <div className="text-xs text-slate-500 font-mono">NISN: {student.nisn}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Kelas</span>
              <span className="font-bold text-slate-800">Kelas {student.className}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Jenis Kelamin</span>
              <span className="font-bold text-slate-800">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Tanggal Lahir</span>
              <span className="font-bold text-slate-800">{student.birthDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Nama Orang Tua</span>
              <span className="font-bold text-slate-800">{student.parentName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">ID Kartu RFID</span>
              <span className="font-mono text-emerald-700 font-bold">{student.rfidUid}</span>
            </div>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak Rapor Tumbuh Kembang (PDF)
          </button>
        </div>

        {/* Growth Highlights (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pemeriksaan Terakhir: {latestMeas?.date || '-'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {latestMeas?.source === 'IoT-Device' ? 'Alat IoT Digital' : 'Pemeriksaan UKS'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              {/* Tinggi Badan */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Tinggi Badan</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block font-mono">
                  {latestMeas?.heightCm} cm
                </span>
                {heightGain && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +{heightGain} cm dari semester lalu
                  </span>
                )}
              </div>

              {/* Berat Badan */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Berat Badan</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block font-mono">
                  {latestMeas?.weightKg} kg
                </span>
                {weightGain && (
                  <span className="text-[10px] text-sky-600 font-bold flex items-center gap-0.5 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +{weightGain} kg dari semester lalu
                  </span>
                )}
              </div>

              {/* IMT */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Indeks Massa Tubuh</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block font-mono">
                  {latestMeas?.bmi}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  IMT = BB / (TB)²
                </span>
              </div>

              {/* Status Stunting */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 block font-bold">Status Stunting (TB/U)</span>
                <span className="text-base font-bold text-emerald-900 mt-1 block">
                  {latestMeas?.stuntingStatus}
                </span>
                <span className="text-[10px] text-emerald-700 block font-mono mt-1">
                  Z-Score: {latestMeas?.zScoreHFA} SD
                </span>
              </div>
            </div>
          </div>

          {/* Health Advice from Puskesmas / UKS */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <Apple className="w-4 h-4 text-amber-600" />
              Saran Asupan &amp; Stimulasi dari UKS SDN 1 Cempaka &amp; Puskesmas Cempaka:
            </div>
            <p className="leading-relaxed text-amber-950">
              {latestMeas?.stuntingStatus === 'Normal' ? (
                'Pertumbuhan Ananda berada pada kurva normal standar WHO. Pertahankan pola makan bergizi seimbang (Isi Piringku: 1/3 karbohidrat, 1/3 sayur, 1/3 lauk pauk tinggi protein hewani seperti telur, ikan, atau ayam), cukupi minum air putih dan tidur 8-9 jam setiap malam.'
              ) : latestMeas?.stuntingStatus === 'Pendek' ? (
                'Ananda terindikasi memiliki laju tinggi badan di bawah rata-rata usianya. Disarankan meningkatkan konsumsi protein hewani harian (2 butir telur/hari, susu, ikan) dan aktivitas melompat atau berenang. Tim UKS akan memberikan monitoring tambahan setiap bulan.'
              ) : (
                'Perlu evaluasi lanjutan bersama tenaga gizi Puskesmas Cempaka untuk penanganan intervensi stunting intensif dan pemberian makanan tambahan (PMT) terstruktur.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Historical Growth Chart */}
      <GrowthChart student={student} />

      {/* Modal Cetak Rapor */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-600" />
                Cetak Rapor Tumbuh Kembang Siswa SDN 1 Cempaka
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
              >
                Tutup
              </button>
            </div>

            <PrintableReport student={student} />
          </div>
        </div>
      )}
    </div>
  );
}
