import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Layers, 
  Users, 
  Heart, 
  Wrench, 
  Radio, 
  Sparkles, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  GraduationCap,
  ExternalLink,
  School,
  Apple,
  Globe
} from 'lucide-react';
import { INITIAL_STUDENTS } from './data/mockStudents';
import { Student, MeasurementRecord } from './types';
import { TeacherDashboard } from './components/TeacherDashboard';
import { IoTSimulator } from './components/IoTSimulator';
import { ParentPortal } from './components/ParentPortal';
import { DiagramViewer } from './components/DiagramViewer';
import { SystemArchitectureDoc } from './components/SystemArchitectureDoc';
import { PojokGizi } from './components/PojokGizi';
import { DeployGuideModal } from './components/DeployGuideModal';

export default function App() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'parent' | 'diagrams' | 'techdoc' | 'pojokgizi'>('dashboard');
  const [showDeployGuide, setShowDeployGuide] = useState<boolean>(false);
  const [latestSyncNotice, setLatestSyncNotice] = useState<{
    studentName: string;
    heightCm: number;
    weightKg: number;
    stuntingStatus: string;
    time: string;
  } | null>(null);

  // Handle incoming real-time measurement from IoT Simulator
  const handleSyncMeasurement = (record: MeasurementRecord, studentId: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          measurements: [...student.measurements, record]
        };
      }
      return student;
    }));

    const std = students.find(s => s.id === studentId);
    if (std) {
      setLatestSyncNotice({
        studentName: std.name,
        heightCm: record.heightCm,
        weightKg: record.weightKg,
        stuntingStatus: record.stuntingStatus,
        time: new Date().toLocaleTimeString('id-ID')
      });

      // Auto dismiss banner after 6 seconds
      setTimeout(() => {
        setLatestSyncNotice(null);
      }, 6000);
    }
  };

  // Add manual measurement (fallback/emergency input)
  const handleAddManualMeasurement = (
    studentId: string, 
    weight: number, 
    height: number, 
    notes: string
  ) => {
    const std = students.find(s => s.id === studentId);
    if (!std) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const birth = new Date(std.birthDate);
    const now = new Date(todayStr);
    const ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    const heightM = height / 100;
    const bmi = Number((weight / (heightM * heightM)).toFixed(2));

    // Approximate Z-score for demo manual entry
    const zScoreHFA = Number(((height - (110 + ageMonths * 0.4)) / 6).toFixed(2));
    const zScoreBMI = Number(((bmi - 16.0) / 1.8).toFixed(2));

    const newRecord: MeasurementRecord = {
      id: `m-manual-${Date.now()}`,
      studentId,
      date: todayStr,
      ageMonths,
      weightKg: weight,
      heightCm: height,
      bmi,
      zScoreHFA,
      zScoreBMI,
      stuntingStatus: zScoreHFA < -3 ? 'Sangat Pendek' : zScoreHFA < -2 ? 'Pendek' : 'Normal',
      nutritionStatus: zScoreBMI < -2 ? 'Gizi Kurang' : zScoreBMI > 2 ? 'Obesitas' : 'Gizi Baik (Normal)',
      source: 'Manual-UKS',
      measuredBy: 'Petugas UKS',
      notes
    };

    setStudents(prev => prev.map(s => s.id === studentId ? {
      ...s,
      measurements: [...s.measurements, newRecord]
    } : s));

    setLatestSyncNotice({
      studentName: std.name,
      heightCm: height,
      weightKg: weight,
      stuntingStatus: newRecord.stuntingStatus,
      time: new Date().toLocaleTimeString('id-ID')
    });
  };

  // Delete student handler
  const handleDeleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (student) {
      setLatestSyncNotice({
        studentName: student.name,
        heightCm: 0,
        weightKg: 0,
        stuntingStatus: 'Dihapus dari Sistem',
        time: new Date().toLocaleTimeString('id-ID')
      });
      setTimeout(() => setLatestSyncNotice(null), 4000);
    }
  };

  // Bulk import students handler from Excel (.xlsx/.csv)
  const handleImportStudents = (newStudents: Student[]) => {
    setStudents(prev => {
      // Filter out duplicates by NISN if any
      const existingNisns = new Set(prev.map(s => s.nisn));
      const freshList = newStudents.filter(ns => !existingNisns.has(ns.nisn));
      return [...prev, ...freshList];
    });

    setLatestSyncNotice({
      studentName: `${newStudents.length} Siswa Baru`,
      heightCm: 0,
      weightKg: 0,
      stuntingStatus: 'Import Excel Berhasil',
      time: new Date().toLocaleTimeString('id-ID')
    });
    setTimeout(() => setLatestSyncNotice(null), 5000);
  };

  const handleSelectForIoTSim = (studentId: string) => {
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Notification Toast when IoT data arrives */}
      {latestSyncNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between z-50 text-xs sm:text-sm animate-in slide-in-from-top duration-300">
          <div className="container mx-auto flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-200 animate-pulse shrink-0" />
            <span>
              <strong>Sinkronisasi Real-time Berhasil:</strong> Data baru siswa{' '}
              <span className="font-bold underline">{latestSyncNotice.studentName}</span> (TB: {latestSyncNotice.heightCm} cm, BB: {latestSyncNotice.weightKg} kg, Status: {latestSyncNotice.stuntingStatus}) diterima dari ESP32 UKS pada {latestSyncNotice.time}.
            </span>
          </div>
          <button 
            onClick={() => setLatestSyncNotice(null)}
            className="text-white hover:text-emerald-200 text-xs font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                  SDN 1 CEMPAKA
                </h1>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded-md uppercase tracking-wider">
                  IoT Antropometri
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Sistem Monitoring Status Pertumbuhan &amp; Deteksi Stunting Standar WHO 2007
              </p>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <nav className="flex items-center overflow-x-auto gap-1 bg-slate-100/90 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Dashboard UKS &amp; Guru
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Simulator Hardware IoT
            </button>

            <button
              onClick={() => setActiveTab('parent')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'parent'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Portal Orang Tua
            </button>

            <button
              onClick={() => setActiveTab('diagrams')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'diagrams'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Diagram &amp; Kerangka Sistem
            </button>

            <button
              onClick={() => setActiveTab('techdoc')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'techdoc'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Teknik Perancangan
            </button>

            <button
              onClick={() => setActiveTab('pojokgizi')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'pojokgizi'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Apple className="w-3.5 h-3.5 text-emerald-600" />
              Pojok Gizi
            </button>

            <button
              onClick={() => setShowDeployGuide(true)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap bg-slate-900 text-white hover:bg-slate-800 shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Deploy Vercel
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content View */}
      <main className="container mx-auto px-4 py-6 flex-1">
        {activeTab === 'dashboard' && (
          <TeacherDashboard
            students={students}
            onAddManualMeasurement={handleAddManualMeasurement}
            onSelectForIoTSim={handleSelectForIoTSim}
            onDeleteStudent={handleDeleteStudent}
            onImportStudents={handleImportStudents}
          />
        )}

        {activeTab === 'simulator' && (
          <IoTSimulator
            students={students}
            onSyncMeasurement={handleSyncMeasurement}
          />
        )}

        {activeTab === 'parent' && (
          <ParentPortal students={students} />
        )}

        {activeTab === 'diagrams' && (
          <DiagramViewer />
        )}

        {activeTab === 'techdoc' && (
          <SystemArchitectureDoc />
        )}

        {activeTab === 'pojokgizi' && (
          <PojokGizi
            students={students}
            selectedClass="ALL"
          />
        )}
      </main>

      {/* Modal Deploy Vercel / GitHub */}
      {showDeployGuide && (
        <DeployGuideModal
          onClose={() => setShowDeployGuide(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Rancang Bangun Sistem Antropometri Digital IoT</span>
            <span>•</span>
            <span>SDN 1 Cempaka</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Standar: Permenkes RI No. 2/2020 &amp; WHO 2007</span>
            <span>ESP32 + Load Cell HX711 + ToF Laser + RFID RC522</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
