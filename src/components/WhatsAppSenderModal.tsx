import React, { useState } from 'react';
import { Send, MessageSquare, Phone, Copy, Check, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Student } from '../types';

interface WhatsAppSenderModalProps {
  student: Student;
  onClose: () => void;
}

export function WhatsAppSenderModal({ student, onClose }: WhatsAppSenderModalProps) {
  const lastMeas = student.measurements[student.measurements.length - 1];
  
  // Format phone to international (e.g. 08123... -> 628123...)
  const formatPhone = (phone: string) => {
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '628' + cleaned.slice(1);
    }
    return cleaned;
  };

  const [phone, setPhone] = useState(student.parentPhone || '081234567890');
  const [copied, setCopied] = useState(false);

  // Generate standardized, polite school message
  const defaultMessage = `Yth. Bapak/Ibu ${student.parentName || 'Orang Tua / Wali'},
Wali Murid dari ananda *${student.name}* (Kelas ${student.className}, NISN: ${student.nisn}).

Berikut kami sampaikan *Laporan Hasil Pemeriksaan Pertumbuhan Fisik & Antropometri Digital IoT* dari Unit Kesehatan Sekolah (UKS) SDN 1 Cempaka:

📅 Tanggal Pengukuran: ${lastMeas?.date || '-'}
📏 Tinggi Badan: *${lastMeas?.heightCm || '-'} cm* (Z-Score TB/U: ${lastMeas?.zScoreHFA || '-'} SD)
⚖️ Berat Badan: *${lastMeas?.weightKg || '-'} kg*
📊 Indeks Massa Tubuh (IMT): *${lastMeas?.bmi || '-'}*
🩺 Status Pertumbuhan: *${lastMeas?.stuntingStatus || '-'}*
🥗 Status Gizi: *${lastMeas?.nutritionStatus || '-'}*

Catatan Petugas UKS:
"${lastMeas?.stuntingStatus === 'Normal' 
  ? 'Pertumbuhan ananda sangat baik dan sesuai kurva normal WHO. Pertahankan pola makan bergizi seimbang (Isi Piringku) dan tidur cukup.' 
  : 'Ananda memiliki indikasi tinggi badan di bawah rata-rata usianya. Disarankan untuk menambah asupan protein hewani (2 butir telur/hari, susu, ikan) dan konsultasi lanjutan bersama tim gizi Puskesmas Cempaka.'}"

Grafik tumbuh kembang lengkap dapat dipantau orang tua kapan saja secara online melalui Portal UKS SDN 1 Cempaka.

Terima kasih atas kerjasama Bapak/Ibu dalam mendukung tumbuh kembang optimal generasi sehat Indonesia.

Salam hangat,
*Unit Kesehatan Sekolah (UKS) SDN 1 Cempaka*
Jl. Raya Cempaka No. 01, Cempaka`;

  const [message, setMessage] = useState(defaultMessage);

  const formattedPhone = formatPhone(phone);
  const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kirim Laporan Pengukuran ke WhatsApp Orang Tua
              </h3>
              <p className="text-xs text-slate-500">
                Siswa: <strong>{student.name}</strong> • Kelas {student.className}
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

        {/* Input Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nomor WhatsApp Orang Tua / Wali
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-emerald-500 font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Otomatis dikonversi ke kode negara Indonesia (+62) saat dikirim.
          </p>
        </div>

        {/* Message preview / edit */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">
              Pratinjau Isi Pesan WhatsApp
            </label>
            <button
              onClick={handleCopy}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin' : 'Salin Teks'}
            </button>
          </div>
          <textarea
            rows={10}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-sans text-slate-800 leading-relaxed focus:outline-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Batal
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Buka WhatsApp &amp; Kirim Pesan
          </a>
        </div>
      </div>
    </div>
  );
}
