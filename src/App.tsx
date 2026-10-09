import React, { useState, useEffect } from 'react';
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
  Globe,
  Lock,
  UserCheck
} from 'lucide-react';
import { INITIAL_STUDENTS } from './data/mockStudents';
import { Student, MeasurementRecord, UserSession, UserRole } from './types';
import { TeacherDashboard } from './components/TeacherDashboard';
import { IoTSimulator } from './components/IoTSimulator';
import { ParentPortal } from './components/ParentPortal';
import { DiagramViewer } from './components/DiagramViewer';
import { SystemArchitectureDoc } from './components/SystemArchitectureDoc';
import { PojokGizi } from './components/PojokGizi';
import { DeployGuideModal } from './components/DeployGuideModal';
import { ComputationValidationView } from './components/ComputationValidationView';
import { IoTCommunicationTestingView } from './components/IoTCommunicationTestingView';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'parent' | 'validation' | 'iot_testing' | 'simulator' | 'diagrams' | 'techdoc' | 'pojokgizi'
  >('dashboard');
  
  // RBAC User Session state
  const [userSession, setUserSession] = useState<UserSession>({
    role: 'TEACHER_UKS',
    name: 'Siti Rohmah, S.Pd (Petugas UKS)',
    identifier: '19850412 201001 2 021',
    loginTime: '07:30'
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [targetAuthRole, setTargetAuthRole] = useState<UserRole>('TEACHER_UKS');

  const [showDeployGuide, setShowDeployGuide] = useState<boolean>(false);
  const [latestSyncNotice, setLatestSyncNotice] = useState<{
    studentName: string;
    heightCm: number;
    weightKg: number;
    stuntingStatus: string;
    time: string;
  } | null>(null);

  // Poll backend for any incoming physical ESP32 data packets
  useEffect(() => {
    let lastKnownPacketId = '';
    const pollBackend = async () => {
      try {
        const res = await fetch('/api/v1/measurements/latest');
        if (res.ok) {
          const data = await res.json();
          if (data.latest && data.latest.id !== lastKnownPacketId) {
            lastKnownPacketId = data.latest.id;
            // update local student measurement if matching
            setStudents(prev => prev.map(s => {
              if (s.rfidUid === data.latest.rfidUid || s.name === data.latest.studentName) {
                const alreadyExists = s.measurements.some(m => m.id === data.latest.id);
                if (!alreadyExists) {
                  return {
                    ...s,
                    measurements: [
                      ...s.measurements,
                      {
                        id: data.latest.id,
                        studentId: s.id,
                        date: new Date(data.latest.timestamp).toISOString().split('T')[0],
                        ageMonths: 108,
                        weightKg: data.latest.weightKg,
                        heightCm: data.latest.heightCm,
                        bmi: data.latest.bmi,
                        zScoreHFA: data.latest.zScoreHFA,
                        zScoreBMI: data.latest.zScoreBMI,
                        stuntingStatus: data.latest.stuntingStatus as any,
                        nutritionStatus: data.latest.nutritionStatus as any,
                        source: 'IoT-Device',
                        deviceSerial: data.latest.deviceSerial,
                        measuredBy: 'ESP32 IoT Gateway',
                        notes: 'Tersinkronisasi otomatis via physical gateway'
                      }
                    ]
                  };
                }
              }
              return s;
            }));
          }
        }
      } catch (err) {
        // ignore offline poll error
      }
    };

    const interval = setInterval(pollBackend, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle incoming real-time measurement from IoT Simulator or API
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

  const handleSelectForIoTSim = (_studentId: string) => {
    setActiveTab('simulator');
  };

  const openAuthWithTargetRole = (role: UserRole) => {
    setTargetAuthRole(role);
    setShowAuthModal(true);
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
        <div className="container mx-auto px-4 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Brand Identity & RBAC Session Badge */}
          <div className="flex items-center justify-between gap-3">
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

            {/* RBAC Quick User Switcher Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                userSession.role === 'TEACHER_UKS'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : userSession.role === 'PARENT'
                  ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                  : 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-slate-500 uppercase font-semibold leading-none">
                  {userSession.role === 'TEACHER_UKS' ? 'Petugas UKS' : userSession.role === 'PARENT' ? 'Wali Murid' : 'Auditor Peneliti'}
                </div>
                <div className="truncate max-w-[140px] leading-tight font-bold">
                  {userSession.name}
                </div>
              </div>
              <span className="text-[10px] underline ml-1 text-slate-500">Ubah RBAC</span>
            </button>
          </div>

          {/* Navigation Tab Bar */}
          <nav className="flex items-center overflow-x-auto gap-1 bg-slate-100/90 p-1 rounded-xl text-xs">
            {/* Dashboard UKS & Guru */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Dashboard Guru</span>
              {userSession.role === 'PARENT' && (
                <Lock className="w-2.5 h-2.5 text-rose-500" />
              )}
            </button>

            {/* Portal Orang Tua */}
            <button
              onClick={() => setActiveTab('parent')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'parent'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Portal Orang Tua</span>
            </button>

            {/* Bab 3.3.6.1: Validasi Komputasi WHO AnthroPlus */}
            <button
              onClick={() => setActiveTab('validation')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'validation'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Validasi AnthroPlus</span>
            </button>

            {/* Bab 3.3.6.2: Pengujian Komunikasi IoT */}
            <button
              onClick={() => setActiveTab('iot_testing')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'iot_testing'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              <span>Uji Komunikasi IoT</span>
            </button>

            {/* Simulator Hardware IoT */}
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Hardware IoT</span>
            </button>

            {/* Diagram & Analisis Sistem Usulan */}
            <button
              onClick={() => setActiveTab('diagrams')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'diagrams'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Diagram Bab 3</span>
            </button>

            {/* Pojok Gizi */}
            <button
              onClick={() => setActiveTab('pojokgizi')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'pojokgizi'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Apple className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pojok Gizi</span>
            </button>

            {/* Teknik Perancangan */}
            <button
              onClick={() => setActiveTab('techdoc')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'techdoc'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Perancangan</span>
            </button>

            {/* Deploy Vercel Button */}
            <button
              onClick={() => setShowDeployGuide(true)}
              className="px-2.5 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap bg-slate-900 text-white hover:bg-slate-800 shadow-2xs ml-1"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deploy</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content View */}
      <main className="container mx-auto px-4 py-6 flex-1">
        {/* Tab 1: Dashboard UKS & Guru (with RBAC Protection) */}
        {activeTab === 'dashboard' && (
          <TeacherDashboard
            students={students}
            userSession={userSession}
            onRequestTeacherLogin={() => openAuthWithTargetRole('TEACHER_UKS')}
            onAddManualMeasurement={handleAddManualMeasurement}
            onSelectForIoTSim={handleSelectForIoTSim}
            onDeleteStudent={handleDeleteStudent}
            onImportStudents={handleImportStudents}
          />
        )}

        {/* Tab 2: Portal Orang Tua (with verified child lock if logged in as Parent) */}
        {activeTab === 'parent' && (
          <ParentPortal 
            students={students} 
            userSession={userSession} 
          />
        )}

        {/* Tab 3: Bab 3.3.6.1 Validasi Komputasi WHO AnthroPlus */}
        {activeTab === 'validation' && (
          <ComputationValidationView />
        )}

        {/* Tab 4: Bab 3.3.6.2 Pengujian Komunikasi IoT End-to-End */}
        {activeTab === 'iot_testing' && (
          <IoTCommunicationTestingView 
            students={students} 
            onDataIngested={handleSyncMeasurement}
          />
        )}

        {/* Tab 5: Simulator Hardware IoT */}
        {activeTab === 'simulator' && (
          <IoTSimulator
            students={students}
            onSyncMeasurement={handleSyncMeasurement}
          />
        )}

        {/* Tab 6: Diagram Analisis Sistem Usulan */}
        {activeTab === 'diagrams' && (
          <DiagramViewer />
        )}

        {/* Tab 7: Teknik Perancangan Sistem & Skematik */}
        {activeTab === 'techdoc' && (
          <SystemArchitectureDoc />
        )}

        {/* Tab 8: Pojok Gizi */}
        {activeTab === 'pojokgizi' && (
          <PojokGizi
            students={students}
            selectedClass="ALL"
          />
        )}
      </main>

      {/* Modal RBAC Authentication Switcher */}
      {showAuthModal && (
        <AuthModal
          currentSession={userSession}
          students={students}
          targetRole={targetAuthRole}
          onLoginSuccess={(session) => {
            setUserSession(session);
            // If parent login, auto navigate to parent tab
            if (session.role === 'PARENT') {
              setActiveTab('parent');
            } else if (session.role === 'TEACHER_UKS') {
              setActiveTab('dashboard');
            }
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

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
            <span>Standar: Permenkes RI No. 2/2020 &amp; WHO AnthroPlus 2007</span>
            <span>ESP32 + Load Cell HX711 + ToF Laser + RFID RC522</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
