import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  KeyRound, 
  X, 
  Users, 
  Heart, 
  GraduationCap, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { UserRole, UserSession, Student } from '../types';

interface AuthModalProps {
  currentSession: UserSession;
  students: Student[];
  targetRole?: UserRole;
  onLoginSuccess: (session: UserSession) => void;
  onClose: () => void;
}

export function AuthModal({ 
  currentSession, 
  students, 
  targetRole, 
  onLoginSuccess, 
  onClose 
}: AuthModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(targetRole || 'TEACHER_UKS');
  const [teacherPin, setTeacherPin] = useState<string>('1234');
  const [parentNisn, setParentNisn] = useState<string>(students[0]?.nisn || '0129482011');
  const [auditorName, setAuditorName] = useState<string>('Dosen Penguji / Peneliti');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedRole === 'TEACHER_UKS') {
      if (teacherPin === '1234' || teacherPin === 'uks123') {
        onLoginSuccess({
          role: 'TEACHER_UKS',
          name: 'Siti Rohmah, S.Pd (Petugas UKS)',
          identifier: '19850412 201001 2 021',
          loginTime: new Date().toLocaleTimeString('id-ID')
        });
        onClose();
      } else {
        setErrorMsg('PIN Petugas UKS salah. PIN Default pengujian: 1234');
      }
      return;
    }

    if (selectedRole === 'PARENT') {
      const student = students.find(s => s.nisn.trim() === parentNisn.trim());
      if (student) {
        onLoginSuccess({
          role: 'PARENT',
          name: `${student.parentName} (Ortu ${student.name})`,
          identifier: student.nisn,
          verifiedChildId: student.id,
          loginTime: new Date().toLocaleTimeString('id-ID')
        });
        onClose();
      } else {
        setErrorMsg(`Siswa dengan NISN "${parentNisn}" tidak ditemukan.`);
      }
      return;
    }

    if (selectedRole === 'AUDITOR') {
      onLoginSuccess({
        role: 'AUDITOR',
        name: auditorName || 'Auditor Penguji Bab 3',
        identifier: 'AUDIT-RESEARCH-SDN1',
        loginTime: new Date().toLocaleTimeString('id-ID')
      });
      onClose();
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Autentikasi Hak Akses (RBAC)
              </h3>
              <p className="text-xs text-slate-500">
                Pilih peran pengguna sesuai perancangan proposal Bab 3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => { setSelectedRole('TEACHER_UKS'); setErrorMsg(''); }}
            className={`py-2 px-1 rounded-lg font-bold transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'TEACHER_UKS'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Petugas UKS</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedRole('PARENT'); setErrorMsg(''); }}
            className={`py-2 px-1 rounded-lg font-bold transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'PARENT'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Orang Tua</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedRole('AUDITOR'); setErrorMsg(''); }}
            className={`py-2 px-1 rounded-lg font-bold transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'AUDITOR'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>Peneliti / Penguji</span>
          </button>
        </div>

        {/* Form Body Based on Role */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {selectedRole === 'TEACHER_UKS' && (
            <div className="space-y-3 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <div className="text-emerald-900 font-bold flex items-center justify-between">
                <span>Peran: Petugas UKS &amp; Guru</span>
                <span className="text-[10px] font-normal text-emerald-700">Akses Penuh</span>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Masukkan PIN Petugas UKS:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={teacherPin}
                    onChange={(e) => setTeacherPin(e.target.value)}
                    placeholder="PIN 4 Digit"
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-slate-300 font-mono text-sm tracking-widest text-slate-900"
                    required
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                  <span>PIN Default Pengujian: <strong>1234</strong></span>
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'PARENT' && (
            <div className="space-y-3 p-3.5 bg-rose-50/50 rounded-xl border border-rose-200">
              <div className="text-rose-900 font-bold flex items-center justify-between">
                <span>Peran: Orang Tua Siswa (Wali Murid)</span>
                <span className="text-[10px] font-normal text-rose-700">Terkunci per Siswa</span>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Pilih Siswa / Masukkan NISN Anak:
                </label>
                <select
                  value={parentNisn}
                  onChange={(e) => setParentNisn(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-800"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.nisn}>
                      {s.name} (Kelas {s.className}) - NISN: {s.nisn}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Orang tua hanya memiliki hak akses membaca grafik perkembangan anaknya sendiri.
                </p>
              </div>
            </div>
          )}

          {selectedRole === 'AUDITOR' && (
            <div className="space-y-3 p-3.5 bg-purple-50/50 rounded-xl border border-purple-200">
              <div className="text-purple-900 font-bold flex items-center justify-between">
                <span>Peran: Kepala Sekolah / Peneliti (Auditor)</span>
                <span className="text-[10px] font-normal text-purple-700">Mode Read-Only Evaluasi</span>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Penilai / Dosen Penguji:
                </label>
                <input
                  type="text"
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-800"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Hak akses evaluasi Bab 3: Mengaudit komputasi WHO AnthroPlus dan pengujian komunikasi IoT.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Terapkan Peran Pengguna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
