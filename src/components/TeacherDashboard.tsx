import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Printer, 
  PlusCircle, 
  Radio, 
  FileSpreadsheet,
  Download,
  Upload,
  Trash2,
  FileText,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Globe,
  Apple
} from 'lucide-react';
import { Student, MeasurementRecord, UserSession } from '../types';
import { GrowthChart } from './GrowthChart';
import { PrintableReport } from './PrintableReport';
import { PrintableCollectiveReport } from './PrintableCollectiveReport';
import { ExcelImportModal } from './ExcelImportModal';
import { PojokGizi } from './PojokGizi';
import { WhatsAppSenderModal } from './WhatsAppSenderModal';
import { DeployGuideModal } from './DeployGuideModal';
import { Lock, ShieldAlert } from 'lucide-react';

interface TeacherDashboardProps {
  students: Student[];
  userSession?: UserSession;
  onRequestTeacherLogin?: () => void;
  onAddManualMeasurement: (studentId: string, weight: number, height: number, notes: string) => void;
  onSelectForIoTSim: (studentId: string) => void;
  onDeleteStudent: (studentId: string) => void;
  onImportStudents: (newStudents: Student[]) => void;
}

export function TeacherDashboard({ 
  students, 
  userSession,
  onRequestTeacherLogin,
  onAddManualMeasurement, 
  onSelectForIoTSim,
  onDeleteStudent,
  onImportStudents
}: TeacherDashboardProps) {
  // RBAC Access Control Check for Parent Role
  if (userSession?.role === 'PARENT') {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200/90 text-center max-w-lg mx-auto space-y-4 my-12 shadow-sm">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wide">
            RBAC Guard Active
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">
            Akses Terbatas: Khusus Petugas UKS &amp; Guru
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Sesuai perancangan sistem Bab 3.3.6.3 (Role-Based Access Control), menu <strong>Dashboard UKS &amp; Direktori Siswa</strong> diproteksi untuk menjaga kerahasiaan data medis siswa.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
          Status aktif: <strong>{userSession.name} (Wali Murid)</strong>
        </div>
        <button
          onClick={onRequestTeacherLogin}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Buka Kunci Akses (Masukkan PIN Petugas UKS)</span>
        </button>
      </div>
    );
  }

  const isAuditorReadOnly = userSession?.role === 'AUDITOR';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeStudentForChart, setActiveStudentForChart] = useState<Student | null>(students[0] || null);
  const [activeStudentForPrint, setActiveStudentForPrint] = useState<Student | null>(null);
  const [showCollectiveReport, setShowCollectiveReport] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [studentForWhatsApp, setStudentForWhatsApp] = useState<Student | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Manual input form state
  const [manualStudentId, setManualStudentId] = useState(students[0]?.id || '');
  const [manualWeight, setManualWeight] = useState(30);
  const [manualHeight, setManualHeight] = useState(130);
  const [manualNotes, setManualNotes] = useState('Pemeriksaan manual UKS');

  // Statistics
  const totalStudents = students.length;
  let totalNormal = 0;
  let totalStunted = 0;
  let totalSevereStunted = 0;
  let totalTall = 0;
  let totalOverweight = 0;

  students.forEach(s => {
    if (s.measurements.length > 0) {
      const last = s.measurements[s.measurements.length - 1];
      if (last.stuntingStatus === 'Normal') totalNormal++;
      else if (last.stuntingStatus === 'Pendek') totalStunted++;
      else if (last.stuntingStatus === 'Sangat Pendek') totalSevereStunted++;
      else if (last.stuntingStatus === 'Tinggi') totalTall++;

      if (last.nutritionStatus === 'Obesitas' || last.nutritionStatus === 'Berisiko Gizi Lebih') {
        totalOverweight++;
      }
    }
  });

  const stuntingRate = totalStudents > 0 
    ? (((totalStunted + totalSevereStunted) / totalStudents) * 100).toFixed(1)
    : '0.0';

  // Filtered students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.nisn.includes(searchQuery) ||
                          s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
    const lastMeas = s.measurements[s.measurements.length - 1];
    const matchesStatus = selectedStatus === 'ALL' || (lastMeas && lastMeas.stuntingStatus === selectedStatus);

    return matchesSearch && matchesClass && matchesStatus;
  });

  const classes = Array.from(new Set(students.map(s => s.className))).sort();

  // Export to Excel (.xlsx) function
  const handleExportExcel = () => {
    const exportData = filteredStudents.map((std, idx) => {
      const last = std.measurements[std.measurements.length - 1];
      return {
        'No': idx + 1,
        'NISN': std.nisn,
        'Nama Lengkap Siswa': std.name,
        'Kelas': std.className,
        'Jenis Kelamin': std.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        'Tanggal Lahir': std.birthDate,
        'Nama Orang Tua': std.parentName,
        'No Telepon Ortu': std.parentPhone,
        'UID Kartu RFID': std.rfidUid,
        'Tinggi Badan Terakhir (cm)': last ? last.heightCm : '-',
        'Berat Badan Terakhir (kg)': last ? last.weightKg : '-',
        'Indeks Massa Tubuh (IMT)': last ? last.bmi : '-',
        'Z-Score TB/U (SD)': last ? last.zScoreHFA : '-',
        'Status Stunting': last ? last.stuntingStatus : 'Belum Diukur',
        'Z-Score IMT/U (SD)': last ? last.zScoreBMI : '-',
        'Status Gizi': last ? last.nutritionStatus : 'Belum Diukur',
        'Tanggal Ukur Terakhir': last ? last.date : '-',
        'Sumber Pengukuran': last ? last.source : '-',
        'Catatan UKS': last?.notes || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    const sheetTitle = selectedClass === 'ALL' ? 'Rekap Siswa SDN 1 Cempaka' : `Kelas ${selectedClass}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
    
    const fileName = `Data_Pertumbuhan_Siswa_SDN1_Cempaka_${selectedClass === 'ALL' ? 'Semua_Kelas' : 'Kelas_' + selectedClass}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentId) return;
    onAddManualMeasurement(manualStudentId, manualWeight, manualHeight, manualNotes);
    setIsManualModalOpen(false);
  };

  const confirmDelete = () => {
    if (!studentToDelete) return;
    onDeleteStudent(studentToDelete.id);
    if (activeStudentForChart?.id === studentToDelete.id) {
      setActiveStudentForChart(null);
    }
    setStudentToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Siswa */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Siswa Terdata
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalStudents} Siswa</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">100%</span>
              <span>Terdaftar RFID UKS</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Status Normal */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Tinggi Badan Normal
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{totalNormal} Siswa</div>
            <div className="text-xs text-slate-500 mt-1">
              {totalStudents > 0 ? ((totalNormal / totalStudents) * 100).toFixed(0) : 0}% Sesuai Kurva WHO
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Prevalensi Stunting */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Terindikasi Stunting
            </span>
            <div className="text-2xl font-bold text-rose-600 mt-1">
              {totalStunted + totalSevereStunted} Siswa
            </div>
            <div className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{stuntingRate}% Prevalensi Sekolah</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Gizi Lebih / Obesitas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Risiko Gizi Lebih
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{totalOverweight} Siswa</div>
            <div className="text-xs text-slate-500 mt-1">Perlu Edukasi Pola Makan</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Student Directory Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        {/* Table Toolbar & Export/Import Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Direktori Pengukuran Siswa SDN 1 Cempaka
            </h3>
            <p className="text-xs text-slate-500">
              Sinkronisasi data real-time langsung dari mikrokontroler ESP32 di ruang UKS
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Unduh Excel (.xlsx) */}
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Unduh Excel (.xlsx)
            </button>

            {/* Cetak Rekap PDF */}
            <button
              onClick={() => setShowCollectiveReport(true)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              Cetak Rekap PDF
            </button>

            {/* Import Excel (.xlsx) */}
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Upload className="w-4 h-4 text-sky-600" />
              Import Excel
            </button>

            {/* Deploy ke Vercel & GitHub */}
            <button
              onClick={() => setShowDeployModal(true)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              Deploy Vercel / GitHub
            </button>

            {/* Input Manual Darurat */}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Input Manual
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau orang tua..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-emerald-500"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-emerald-500 text-slate-700 font-medium"
            >
              <option value="ALL">Semua Kelas (1 s/d 6)</option>
              {classes.map(c => (
                <option key={c} value={c}>Kelas {c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-emerald-500 text-slate-700 font-medium"
            >
              <option value="ALL">Semua Status Pertumbuhan</option>
              <option value="Normal">Normal</option>
              <option value="Pendek">Pendek (Stunted)</option>
              <option value="Sangat Pendek">Sangat Pendek (Severely Stunted)</option>
              <option value="Tinggi">Tinggi</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/90">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Siswa &amp; NISN</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3">JK</th>
                <th className="py-3 px-3">Tinggi (cm)</th>
                <th className="py-3 px-3">Berat (kg)</th>
                <th className="py-3 px-3">IMT</th>
                <th className="py-3 px-3">Z-Score TB/U</th>
                <th className="py-3 px-3">Status Stunting</th>
                <th className="py-3 px-3">Status Gizi</th>
                <th className="py-3 px-3">Tgl Ukur</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const last = student.measurements[student.measurements.length - 1];
                  const isCurrentChart = activeStudentForChart?.id === student.id;

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrentChart ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-600 font-mono">
                          NISN: {student.nisn} • RFID: {student.rfidUid}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700">Kelas {student.className}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {student.gender === 'L' ? 'L' : 'P'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                        {last ? `${last.heightCm} cm` : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                        {last ? `${last.weightKg} kg` : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {last ? last.bmi : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        {last ? (
                          <span className={last.zScoreHFA < -2.0 ? 'text-rose-600' : 'text-emerald-700'}>
                            {last.zScoreHFA} SD
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-3">
                        {last ? (
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            last.stuntingStatus === 'Normal' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : last.stuntingStatus === 'Pendek'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {last.stuntingStatus}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Belum diukur</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {last ? (
                          <span className="text-[11px] text-slate-700">
                            {last.nutritionStatus}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 font-mono">
                        {last ? last.date : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Lihat Grafik */}
                          <button
                            onClick={() => setActiveStudentForChart(student)}
                            title="Tampilkan Grafik Pertumbuhan"
                            className={`p-1.5 rounded-lg border transition-all ${
                              isCurrentChart 
                                ? 'bg-emerald-600 text-white border-emerald-600' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Cetak Rapor */}
                          <button
                            onClick={() => setActiveStudentForPrint(student)}
                            title="Cetak Rapor Tumbuh Kembang"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-all"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* KIRIM WHATSAPP KE ORANG TUA */}
                          <button
                            onClick={() => setStudentForWhatsApp(student)}
                            title="Kirim Hasil Pengukuran via WhatsApp ke Orang Tua"
                            className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Simulasi IoT */}
                          <button
                            onClick={() => onSelectForIoTSim(student.id)}
                            title="Simulasikan Pengukuran di Hardware IoT"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-sky-600 hover:bg-sky-50 transition-all"
                          >
                            <Radio className="w-3.5 h-3.5" />
                          </button>

                          {/* HAPUS SISWA */}
                          <button
                            onClick={() => setStudentToDelete(student)}
                            title="Hapus Data Siswa"
                            className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    Tidak ada data siswa yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Growth Chart Component for Selected Student */}
      {activeStudentForChart && (
        <div className="pt-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Grafik Perkembangan Berkala Siswa Terpilih
            </span>
            <button
              onClick={() => setActiveStudentForPrint(activeStudentForChart)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Rapor Antropometri Siswa Ini
            </button>
          </div>
          <GrowthChart student={activeStudentForChart} />
        </div>
      )}

      {/* Modul Pojok Gizi Pintar (Edukasi Otomatis Berdasarkan Status Rata-rata Kelas) */}
      <div className="pt-2">
        <PojokGizi 
          students={filteredStudents}
          selectedClass={selectedClass}
        />
      </div>

      {/* Modal Kirim WhatsApp ke Orang Tua */}
      {studentForWhatsApp && (
        <WhatsAppSenderModal
          student={studentForWhatsApp}
          onClose={() => setStudentForWhatsApp(null)}
        />
      )}

      {/* Modal Panduan & Deploy ke Vercel / GitHub */}
      {showDeployModal && (
        <DeployGuideModal
          onClose={() => setShowDeployModal(false)}
        />
      )}

      {/* Modal Cetak Rapor Individual */}
      {activeStudentForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-600" />
                Pratinjau Cetak Rapor Tumbuh Kembang Siswa
              </h3>
              <button
                onClick={() => setActiveStudentForPrint(null)}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
              >
                Tutup
              </button>
            </div>

            <PrintableReport student={activeStudentForPrint} />
          </div>
        </div>
      )}

      {/* Modal Cetak Laporan Rekapitulasi Kolektif PDF */}
      {showCollectiveReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <PrintableCollectiveReport
              students={filteredStudents}
              selectedClass={selectedClass}
              onClose={() => setShowCollectiveReport(false)}
            />
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showImportModal && (
        <ExcelImportModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={(newStudents) => {
            onImportStudents(newStudents);
            setShowImportModal(false);
          }}
        />
      )}

      {/* Modal Konfirmasi Hapus Siswa */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Siswa</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>Nama: <strong className="text-slate-900">{studentToDelete.name}</strong></div>
              <div>NISN: <span className="font-mono text-slate-700">{studentToDelete.nisn}</span></div>
              <div>Kelas: <span className="font-semibold text-slate-700">Kelas {studentToDelete.className}</span></div>
              <div>Riwayat Pengukuran: <span className="text-rose-600 font-bold">{studentToDelete.measurements.length} rekam data akan terhapus</span></div>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus data siswa ini dari sistem UKS SDN 1 Cempaka?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input Manual Darurat */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Input Pengukuran Manual UKS
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
              >
                Batal
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  value={manualStudentId}
                  onChange={(e) => setManualStudentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - Kelas {s.className} (NISN: {s.nisn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualHeight}
                    onChange={(e) => setManualHeight(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualWeight}
                    onChange={(e) => setManualWeight(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan Petugas</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Misal: Pemeriksaan fisik berkala semester 1"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                >
                  Simpan &amp; Hitung Z-Score WHO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
