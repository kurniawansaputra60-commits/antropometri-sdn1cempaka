import React from 'react';
import { Student } from '../types';
import { Printer } from 'lucide-react';

interface PrintableCollectiveReportProps {
  students: Student[];
  selectedClass: string;
  onClose: () => void;
}

export function PrintableCollectiveReport({ students, selectedClass, onClose }: PrintableCollectiveReportProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalStudents = students.length;
  let normalCount = 0;
  let stuntingCount = 0;
  let severeStuntingCount = 0;
  let tallCount = 0;

  students.forEach(s => {
    if (s.measurements.length > 0) {
      const last = s.measurements[s.measurements.length - 1];
      if (last.stuntingStatus === 'Normal') normalCount++;
      else if (last.stuntingStatus === 'Pendek') stuntingCount++;
      else if (last.stuntingStatus === 'Sangat Pendek') severeStuntingCount++;
      else if (last.stuntingStatus === 'Tinggi') tallCount++;
    }
  });

  const stuntingRate = totalStudents > 0
    ? (((stuntingCount + severeStuntingCount) / totalStudents) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-4">
      {/* Top action toolbar (hidden on print) */}
      <div className="flex items-center justify-between print:hidden pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Laporan Rekapitulasi Antropometri Siswa (Siap Cetak / PDF)
          </h3>
          <p className="text-xs text-slate-500">
            {selectedClass === 'ALL' ? 'Semua Kelas (1 s/d 6)' : `Khusus Kelas ${selectedClass}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-8 border border-slate-300 rounded-xl text-slate-900 font-serif print:border-none print:p-0 print:shadow-none space-y-6">
        {/* Kop Surat Sekolah */}
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <h4 className="text-xs uppercase tracking-widest font-sans font-semibold text-slate-700">
            Pemerintah Daerah • Dinas Pendidikan dan Kebudayaan
          </h4>
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-slate-900 font-sans mt-0.5">
            SEKOLAH DASAR NEGERI 1 CEMPAKA
          </h2>
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-800 font-sans">
            UNIT KESEHATAN SEKOLAH (UKS) &amp; PUSAT PEMANTAUAN GIZI
          </h3>
          <p className="text-[11px] text-slate-600 font-sans mt-1">
            Jl. Raya Cempaka No. 01, Kec. Cempaka • Website: sdn1cempaka.sch.id • Email: uks@sdn1cempaka.sch.id
          </p>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider underline font-sans">
            LAPORAN REKAPITULASI STATUS PERTUMBUHAN &amp; DETEKSI STUNTING SISWA
          </h3>
          <p className="text-xs text-slate-600 font-sans">
            Tahun Ajaran 2025/2026 • Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-4 gap-3 text-center text-xs font-sans p-3 bg-slate-50 border border-slate-300 rounded-lg">
          <div>
            <div className="text-slate-500 text-[10px]">Total Siswa Diperiksa</div>
            <div className="text-base font-bold text-slate-900">{totalStudents} Siswa</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">Tinggi Badan Normal</div>
            <div className="text-base font-bold text-emerald-700">{normalCount} Siswa</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">Terindikasi Stunting</div>
            <div className="text-base font-bold text-rose-700">{stuntingCount + severeStuntingCount} Siswa</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">Prevalensi Stunting</div>
            <div className="text-base font-bold text-amber-700">{stuntingRate}%</div>
          </div>
        </div>

        {/* Collective Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] font-sans border-collapse border border-slate-400">
            <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[9px]">
              <tr className="border-b border-slate-400">
                <th className="p-2 border-r border-slate-400 text-center">No</th>
                <th className="p-2 border-r border-slate-400">NISN</th>
                <th className="p-2 border-r border-slate-400">Nama Lengkap Siswa</th>
                <th className="p-2 border-r border-slate-400 text-center">Kelas</th>
                <th className="p-2 border-r border-slate-400 text-center">JK</th>
                <th className="p-2 border-r border-slate-400 text-center">TB (cm)</th>
                <th className="p-2 border-r border-slate-400 text-center">BB (kg)</th>
                <th className="p-2 border-r border-slate-400 text-center">IMT</th>
                <th className="p-2 border-r border-slate-400 text-center">Z-Score TB/U</th>
                <th className="p-2 border-r border-slate-400">Status Stunting</th>
                <th className="p-2 border-r border-slate-400">Status Gizi</th>
                <th className="p-2 text-center">Tgl Ukur</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const last = student.measurements[student.measurements.length - 1];
                return (
                  <tr key={student.id} className="border-b border-slate-300">
                    <td className="p-1.5 border-r border-slate-300 text-center">{idx + 1}</td>
                    <td className="p-1.5 border-r border-slate-300 font-mono">{student.nisn}</td>
                    <td className="p-1.5 border-r border-slate-300 font-bold">{student.name}</td>
                    <td className="p-1.5 border-r border-slate-300 text-center">{student.className}</td>
                    <td className="p-1.5 border-r border-slate-300 text-center">{student.gender}</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-mono">{last?.heightCm || '-'}</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-mono">{last?.weightKg || '-'}</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-mono">{last?.bmi || '-'}</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-mono font-bold">
                      {last ? `${last.zScoreHFA} SD` : '-'}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-semibold">
                      {last?.stuntingStatus || '-'}
                    </td>
                    <td className="p-1.5 border-r border-slate-300">
                      {last?.nutritionStatus || '-'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-[10px]">
                      {last?.date || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Catatan Kesimpulan & Tindak Lanjut */}
        <div className="space-y-1 text-xs font-sans">
          <div className="font-bold uppercase tracking-wide text-slate-800">
            Catatan Rekomendasi &amp; Tindak Lanjut:
          </div>
          <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
            1. Siswa dengan indikasi status <strong>Pendek (Stunted)</strong> dan <strong>Sangat Pendek</strong> diberikan surat rekomendasi ke orang tua untuk konsultasi gizi terpadu bersama Puskesmas Cempaka.<br />
            2. Program Pemberian Makanan Tambahan (PMT) tinggi protein hewani (telur &amp; susu) diprioritaskan bagi siswa yang berada di bawah garis -2 SD.<br />
            3. Pengukuran berkala selanjutnya dijadwalkan pada awal semester berikutnya via sistem antropometri digital IoT UKS.
          </p>
        </div>

        {/* Tanda Tangan */}
        <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs font-sans">
          <div>
            <div>Mengetahui &amp; Memeriksa,</div>
            <div className="text-slate-600">Koordinator UKS SDN 1 Cempaka</div>
            <div className="h-16"></div>
            <div className="font-bold border-b border-slate-400 inline-block px-4">
              ( Siti Rohmah, S.Pd )
            </div>
            <div className="text-[10px] text-slate-500">NIP. 19850412 201001 2 021</div>
          </div>

          <div>
            <div>Cempaka, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div className="text-slate-600">Kepala Sekolah SDN 1 Cempaka</div>
            <div className="h-16"></div>
            <div className="font-bold border-b border-slate-400 inline-block px-4">
              ( Drs. H. Suryadinata, M.Pd )
            </div>
            <div className="text-[10px] text-slate-500">NIP. 19740815 199903 1 005</div>
          </div>
        </div>
      </div>
    </div>
  );
}
