import React from 'react';
import { Student } from '../types';
import { Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PrintableReportProps {
  student: Student;
}

export function PrintableReport({ student }: PrintableReportProps) {
  const handlePrint = () => {
    window.print();
  };

  const measurements = [...student.measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const latest = measurements[measurements.length - 1];

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex justify-end gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Cetak Dokumen / Simpan PDF
        </button>
      </div>

      {/* Official Printable Sheet */}
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
            UNIT KESEHATAN SEKOLAH (UKS) &amp; PUSAT PEMANTAUAN GIZI ANAK
          </h3>
          <p className="text-[11px] text-slate-600 font-sans mt-1">
            Jl. Raya Cempaka No. 01, Kec. Cempaka • Website: sdn1cempaka.sch.id • Email: uks@sdn1cempaka.sch.id
          </p>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider underline font-sans">
            RAPOR PEMANTAUAN ANTROPOMETRI &amp; STATUS PERTUMBUHAN SISWA
          </h3>
          <p className="text-xs text-slate-600 font-sans">
            Berdasarkan Standar Baku WHO Reference 2007 &amp; Permenkes RI No. 2 Tahun 2020
          </p>
        </div>

        {/* Student Biodata */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-sans bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex">
            <span className="w-32 text-slate-600">Nama Siswa</span>
            <span className="font-bold">: {student.name}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">Kelas</span>
            <span className="font-bold">: Kelas {student.className}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">Nomor Induk (NISN)</span>
            <span className="font-mono">: {student.nisn}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">Jenis Kelamin</span>
            <span>: {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">Tanggal Lahir</span>
            <span>: {student.birthDate}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">Nama Orang Tua / Wali</span>
            <span>: {student.parentName}</span>
          </div>
        </div>

        {/* Table of Periodic Measurements */}
        <div className="space-y-2">
          <div className="text-xs font-bold font-sans uppercase tracking-wide text-slate-800">
            I. Riwayat Pemeriksaan Berkala Antropometri Digital IoT
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse border border-slate-400">
              <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <tr className="border-b border-slate-400">
                  <th className="p-2 border-r border-slate-400 text-center">No</th>
                  <th className="p-2 border-r border-slate-400">Tanggal Ukur</th>
                  <th className="p-2 border-r border-slate-400">Usia (Th.Bln)</th>
                  <th className="p-2 border-r border-slate-400 text-center">TB (cm)</th>
                  <th className="p-2 border-r border-slate-400 text-center">BB (kg)</th>
                  <th className="p-2 border-r border-slate-400 text-center">IMT</th>
                  <th className="p-2 border-r border-slate-400 text-center">Z-Score TB/U</th>
                  <th className="p-2 border-r border-slate-400">Status Stunting</th>
                  <th className="p-2">Status Gizi</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m, idx) => (
                  <tr key={m.id} className="border-b border-slate-300">
                    <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-300 font-mono">{m.date}</td>
                    <td className="p-2 border-r border-slate-300">
                      {Math.floor(m.ageMonths / 12)} th {m.ageMonths % 12} bln
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold">{m.heightCm}</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold">{m.weightKg}</td>
                    <td className="p-2 border-r border-slate-300 text-center">{m.bmi}</td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">
                      {m.zScoreHFA} SD
                    </td>
                    <td className="p-2 border-r border-slate-300 font-bold">
                      {m.stuntingStatus}
                    </td>
                    <td className="p-2 font-medium">
                      {m.nutritionStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kesimpulan & Rekomendasi */}
        <div className="space-y-2 text-xs font-sans">
          <div className="font-bold uppercase tracking-wide text-slate-800">
            II. Catatan &amp; Rekomendasi Petugas UKS SDN 1 Cempaka
          </div>
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg leading-relaxed text-slate-800">
            {latest ? (
              <>
                Pada pemeriksaan terakhir tanggal <strong>{latest.date}</strong>, ananda berada pada kategori tinggi badan{' '}
                <span className="font-bold underline">{latest.stuntingStatus}</span> (Z-score TB/U: {latest.zScoreHFA} SD) dan status gizi{' '}
                <span className="font-bold underline">{latest.nutritionStatus}</span>.
                {latest.stuntingStatus === 'Normal' ? (
                  ' Pertumbuhan fisik berjalan baik dan ideal sesuai kurva WHO Reference 2007. Pertahankan asupan makanan seimbang, sarapan bernutrisi, dan kebiasaan berolahraga aktif.'
                ) : (
                  ' Disarankan untuk meningkatkan asupan pangan kaya protein hewani (telur, susu, ikan) serta berkonsultasi secara berkala dengan petugas gizi Puskesmas Cempaka.'
                )}
              </>
            ) : (
              'Belum ada catatan pengukuran.'
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs font-sans">
          <div>
            <div>Mengetahui,</div>
            <div className="text-slate-600">Orang Tua / Wali Siswa</div>
            <div className="h-16"></div>
            <div className="font-bold border-b border-slate-400 inline-block px-4">
              ( {student.parentName} )
            </div>
          </div>

          <div>
            <div>Diperiksa oleh,</div>
            <div className="text-slate-600">Petugas UKS SDN 1 Cempaka</div>
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
