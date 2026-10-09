import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';
import { Student, Gender } from '../types';
import { computeZScoreHFA, computeZScoreBMI, classifyStunting, classifyNutrition, calculateAgeInMonths } from '../data/whoReference';

interface ExcelImportModalProps {
  onClose: () => void;
  onImportSuccess: (importedStudents: Student[]) => void;
}

interface ParsedStudentRow {
  nisn: string;
  name: string;
  className: string;
  gender: Gender;
  birthDate: string;
  parentName: string;
  parentPhone: string;
  rfidUid: string;
  heightCm?: number;
  weightKg?: number;
  isValid: boolean;
  validationError?: string;
}

export function ExcelImportModal({ onClose, onImportSuccess }: ExcelImportModalProps) {
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download Sample Template XLSX
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NISN: '0168392011',
        'Nama Lengkap': 'Dimas Satria Nugraha',
        Kelas: '3A',
        'Jenis Kelamin (L/P)': 'L',
        'Tanggal Lahir (YYYY-MM-DD)': '2017-05-12',
        'Nama Orang Tua': 'Budi Nugraha',
        'No HP Ortu': '081234567890',
        'RFID UID (Opsional)': 'D4:11:8A:2F',
        'Tinggi Awal (cm)': 122.5,
        'Berat Awal (kg)': 22.0
      },
      {
        NISN: '0179483022',
        'Nama Lengkap': 'Siti Khadijah',
        Kelas: '2B',
        'Jenis Kelamin (L/P)': 'P',
        'Tanggal Lahir (YYYY-MM-DD)': '2018-09-24',
        'Nama Orang Tua': 'Ahmad Fauzi',
        'No HP Ortu': '085678901234',
        'RFID UID (Opsional)': 'E9:23:4C:1A',
        'Tinggi Awal (cm)': 118.0,
        'Berat Awal (kg)': 19.5
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa SDN 1');
    XLSX.writeFile(workbook, 'Template_Import_Siswa_SDN1_Cempaka.xlsx');
  };

  // Handle file select and parse via SheetJS
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        if (!jsonData || jsonData.length === 0) {
          setErrorMsg('File Excel kosong atau format kolom tidak terbaca.');
          setIsProcessing(false);
          return;
        }

        const rows: ParsedStudentRow[] = jsonData.map((row, idx) => {
          // Normalize column names
          const nisn = String(row['NISN'] || row['nisn'] || '').trim();
          const name = String(row['Nama Lengkap'] || row['nama'] || row['Nama'] || '').trim();
          const className = String(row['Kelas'] || row['kelas'] || '1A').trim();
          const rawGender = String(row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || row['gender'] || 'L').trim().toUpperCase();
          const gender: Gender = rawGender.startsWith('P') ? 'P' : 'L';
          
          let birthDate = String(row['Tanggal Lahir (YYYY-MM-DD)'] || row['Tanggal Lahir'] || row['birthDate'] || '2018-01-01').trim();
          // If Excel date was parsed as number
          if (!isNaN(Number(birthDate)) && Number(birthDate) > 30000) {
            const excelDate = new Date(Math.round((Number(birthDate) - 25569) * 86400 * 1000));
            birthDate = excelDate.toISOString().split('T')[0];
          }

          const parentName = String(row['Nama Orang Tua'] || row['orang_tua'] || '-').trim();
          const parentPhone = String(row['No HP Ortu'] || row['telepon'] || '-').trim();
          
          // Generate pseudo RFID UID if not provided
          const rfidUid = String(row['RFID UID (Opsional)'] || row['rfid'] || `RF:${idx + 10}:${Math.floor(Math.random() * 89 + 10)}`).trim();

          const heightCm = row['Tinggi Awal (cm)'] || row['tinggi'] ? parseFloat(row['Tinggi Awal (cm)'] || row['tinggi']) : undefined;
          const weightKg = row['Berat Awal (kg)'] || row['berat'] ? parseFloat(row['Berat Awal (kg)'] || row['berat']) : undefined;

          let isValid = true;
          let validationError = '';

          if (!nisn) {
            isValid = false;
            validationError = 'NISN wajib diisi';
          } else if (!name) {
            isValid = false;
            validationError = 'Nama siswa wajib diisi';
          }

          return {
            nisn,
            name,
            className,
            gender,
            birthDate,
            parentName,
            parentPhone,
            rfidUid,
            heightCm,
            weightKg,
            isValid,
            validationError
          };
        });

        setParsedRows(rows);
        setIsProcessing(false);
      } catch (err) {
        console.error(err);
        setErrorMsg('Gagal membaca file Excel. Pastikan format file adalah .xlsx atau .csv yang valid.');
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Convert parsed rows into final Student models
  const handleCommitImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const newStudents: Student[] = validRows.map((r, i) => {
      const studentId = `std-import-${Date.now()}-${i}`;
      const measurements = [];

      // If initial measurements are provided, calculate initial WHO status
      if (r.heightCm && r.weightKg) {
        const ageMonths = calculateAgeInMonths(r.birthDate, todayStr);
        const heightM = r.heightCm / 100;
        const bmi = Number((r.weightKg / (heightM * heightM)).toFixed(2));
        const zScoreHFA = computeZScoreHFA(r.heightCm, ageMonths, r.gender);
        const zScoreBMI = computeZScoreBMI(bmi, ageMonths, r.gender);
        const stuntingStatus = classifyStunting(zScoreHFA);
        const nutritionStatus = classifyNutrition(zScoreBMI);

        measurements.push({
          id: `m-init-${studentId}`,
          studentId,
          date: todayStr,
          ageMonths,
          weightKg: r.weightKg,
          heightCm: r.heightCm,
          bmi,
          zScoreHFA,
          zScoreBMI,
          stuntingStatus,
          nutritionStatus,
          source: 'Manual-UKS' as const,
          deviceSerial: 'IMPORT-EXCEL',
          measuredBy: 'Import Data UKS',
          notes: 'Data awal pengukuran saat import Excel'
        });
      }

      return {
        id: studentId,
        nisn: r.nisn,
        name: r.name,
        gender: r.gender,
        birthDate: r.birthDate,
        className: r.className,
        parentName: r.parentName,
        parentPhone: r.parentPhone,
        rfidUid: r.rfidUid,
        measurements
      };
    });

    onImportSuccess(newStudents);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Import Data Siswa dari Format Excel (.xlsx / .csv)
              </h3>
              <p className="text-xs text-slate-500">
                SDN 1 Cempaka • Tambah data siswa secara massal untuk pendaftaran antropometri UKS
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

        {/* Action: Download Template & Upload Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Box 1: Download Template */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Langkah 1: Unduh Format Template</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Gunakan template resmi agar nama kolom sesuai dengan sistem antropometri UKS (NISN, Nama, Kelas, Tanggal Lahir, dll).
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Unduh Template Excel (.xlsx)
            </button>
          </div>

          {/* Box 2: Upload File */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-emerald-900 block">Langkah 2: Pilih File Excel Anda</span>
              <p className="text-[11px] text-emerald-800 mt-1">
                Dukungan file .xlsx, .xls, atau .csv dari komputer/laptop Anda.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Upload className="w-4 h-4" />
                {fileName ? 'Ganti File Excel' : 'Pilih File Excel / CSV'}
              </button>
            </div>
          </div>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preview parsed data */}
        {parsedRows.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Pratinjau Data: {validCount} dari {parsedRows.length} baris valid
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                File: {fileName}
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">NISN</th>
                    <th className="py-2 px-3">Nama Siswa</th>
                    <th className="py-2 px-3">Kelas</th>
                    <th className="py-2 px-3">JK</th>
                    <th className="py-2 px-3">Tgl Lahir</th>
                    <th className="py-2 px-3">Orang Tua</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                      <td className="py-2 px-3">
                        {row.isValid ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Valid
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded" title={row.validationError}>
                            {row.validationError}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono">{row.nisn || '-'}</td>
                      <td className="py-2 px-3 font-semibold">{row.name || '-'}</td>
                      <td className="py-2 px-3">{row.className}</td>
                      <td className="py-2 px-3">{row.gender}</td>
                      <td className="py-2 px-3 font-mono">{row.birthDate}</td>
                      <td className="py-2 px-3">{row.parentName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Batal
          </button>

          {parsedRows.length > 0 && (
            <button
              onClick={handleCommitImport}
              disabled={validCount === 0 || isProcessing}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan {validCount} Siswa ke Database UKS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
