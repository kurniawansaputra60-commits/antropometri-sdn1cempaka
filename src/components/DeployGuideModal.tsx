import React, { useState } from 'react';
import { 
  GitBranch, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Terminal, 
  Sparkles, 
  Globe, 
  CheckCircle2, 
  FileCode, 
  Server
} from 'lucide-react';

interface DeployGuideModalProps {
  onClose: () => void;
}

export function DeployGuideModal({ onClose }: DeployGuideModalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vercel' | 'github' | 'readme'>('vercel');

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const gitCommands = `# 1. Inisialisasi Git di direktori proyek
git init

# 2. Tambahkan seluruh berkas rancang bangun
git add .

# 3. Buat commit awal
git commit -m "feat: Sistem Antropometri Digital IoT SDN 1 Cempaka"

# 4. Ganti cabang utama ke main
git branch -M main

# 5. Hubungkan ke repositori GitHub Anda
git remote add origin https://github.com/USERNAME/sdn1-cempaka-antropometri-iot.git

# 6. Unggah (push) ke GitHub
git push -u origin main`;

  const readmeContent = `# RANCANG BANGUN SISTEM ANTROPOMETRI DIGITAL BERBASIS IoT
## UNTUK MONITORING STATUS PERTUMBUHAN SISWA SDN 1 CEMPAKA

Aplikasi web dashboard dan pipeline IoT untuk pengukuran antropometri otomatis siswa sekolah dasar berbasis mikrokontroler ESP32, sensor berat Load Cell HX711, sensor tinggi Laser ToF VL53L0X, dan RFID RC522 dengan kalkulasi baku WHO Reference 2007 (Permenkes No. 2 Tahun 2020).

### Fitur Utama
1. **IoT Live Data Sync:** Akuisisi instan pembacaan RFID siswa, berat badan, dan tinggi badan ke server secara real-time.
2. **Kalkulasi WHO Z-Score LMS:** Penentuan status stunting (TB/U) dan status gizi (IMT/U) secara otomatis.
3. **Pojok Gizi Cerdas:** Edukasi kesehatan kurasi otomatis berdasarkan profil gizi rata-rata siswa di kelas.
4. **Kirim WhatsApp:** Pengiriman rapor pertumbuhan anak ke nomor WhatsApp wali murid dalam 1-klik.
5. **Ekspor & Impor Excel (.xlsx) / PDF:** Unduh rekapitulasi data dan import massal data siswa baru.

### Cara Menjalankan Proyek Lokal
\`\`\`bash
# Install dependencies
npm install

# Jalankan server pengembangan
npm run dev

# Bangun untuk produksi
npm run build
\`\`\`

### Deployment ke Vercel
Proyek ini sudah dilengkapi file konfigurasi \`vercel.json\` untuk Single Page Application (SPA).
Cukup hubungkan repositori GitHub Anda ke Vercel.`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Panduan Integrasi GitHub &amp; Deployment ke Vercel.app
              </h3>
              <p className="text-xs text-slate-500">
                SDN 1 Cempaka • Siap online ke domain publik gratis (*.vercel.app)
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

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'vercel'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Deploy ke Vercel.app
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'github'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Upload ke GitHub
          </button>
          <button
            onClick={() => setActiveTab('readme')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'readme'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            README.md Proyek
          </button>
        </div>

        {/* TAB 1: VERCEL */}
        {activeTab === 'vercel' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <strong className="block font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Konfigurasi `vercel.json` Sudah Tersedia &amp; Aktif!
              </strong>
              <p>
                Aplikasi ini telah dikonfigurasi dengan aturan SPA routing (Single Page Application) sehingga rute tidak akan mengalami error 404 ketika pengguna me-refresh halaman di domain <code>*.vercel.app</code>.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wide">
                Langkah Cepat Deploy ke Vercel:
              </h4>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <div>
                    <strong className="text-slate-900">Buka Vercel Dashboard:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Masuk ke akun Vercel Anda di <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">vercel.com</a> (login gratis dengan akun GitHub).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <div>
                    <strong className="text-slate-900">Import Repositori Git:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Klik <strong>"Add New Project"</strong> $\rightarrow$ Pilih repositori GitHub proyek antropometri ini.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <div>
                    <strong className="text-slate-900">Konfirmasi Pengaturan Build:</strong>
                    <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-[11px]">
                      <div className="p-2 bg-white rounded border">Preset: <strong>Vite</strong></div>
                      <div className="p-2 bg-white rounded border">Build: <strong>npm run build</strong></div>
                      <div className="p-2 bg-white rounded border">Output: <strong>dist</strong></div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                  <div>
                    <strong className="text-slate-900">Klik "Deploy":</strong>
                    <p className="text-slate-600 mt-0.5">
                      Vercel akan mem-build aplikasi dalam ~30 detik dan memberikan URL publik gratis seperti:
                      <code className="block mt-1 p-1 bg-white border rounded text-emerald-700 font-bold">
                        https://antropometri-sdn1cempaka.vercel.app
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs"
              >
                <span>Buka Vercel New Project</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: GITHUB */}
        {activeTab === 'github' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Perintah Git CLI untuk Push ke GitHub:
              </span>
              <button
                onClick={() => copyText(gitCommands, 'git')}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                {copiedCode === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode === 'git' ? 'Tersalin!' : 'Salin Perintah'}
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <pre>{gitCommands}</pre>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs"
              >
                <span>Buat Repositori Baru di GitHub</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: README.MD */}
        {activeTab === 'readme' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Isi File README.md untuk Dokumentasi Repositori GitHub:
              </span>
              <button
                onClick={() => copyText(readmeContent, 'readme')}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                {copiedCode === 'readme' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode === 'readme' ? 'Tersalin!' : 'Salin README'}
              </button>
            </div>

            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
              <pre>{readmeContent}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
