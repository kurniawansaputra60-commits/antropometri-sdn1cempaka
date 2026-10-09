import React, { useState } from 'react';
import { 
  GitCommit, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  FileText, 
  HelpCircle, 
  Download, 
  Info, 
  Activity, 
  Database, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export function DiagramViewer() {
  const [activeTab, setActiveTab] = useState<'usulan' | 'kerangka' | 'penelitian' | 'komparasi'>('usulan');
  const [selectedNode, setSelectedNode] = useState<string | null>('who-engine');

  // Node details dictionary for interactive clicks
  const nodeDetails: Record<string, {
    title: string;
    category: string;
    description: string;
    components?: string;
    io: { input: string; output: string };
    researchNotes: string;
  }> = {
    // Sistem Berjalan (Manual)
    'manual-ukur': {
      title: 'Siswa Diukur Manual',
      category: 'Sistem Manual (Berjalan)',
      description: 'Pengukuran dilakukan petugas UKS SDN 1 Cempaka menggunakan timbangan jarum pegas mekanis dan pita ukur/microtoise manual.',
      io: { input: 'Fisik siswa di UKS', output: 'Angka analog (terbaca mata)' },
      researchNotes: 'Kelemahan: Kesalahan paralaks pembacaan jarum timbangan (human error 0.5 - 2 kg) dan pembacaan mikrotoise yang rentan bergeser.'
    },
    'manual-catat': {
      title: 'Tinggi & Berat Dicatat',
      category: 'Sistem Manual (Berjalan)',
      description: 'Petugas menuliskan nama siswa, tanggal lahir, berat badan, dan tinggi badan ke dalam buku agenda fisik UKS.',
      io: { input: 'Angka terbaca', output: 'Tulisan pena pada buku UKS' },
      researchNotes: 'Kelemahan: Risiko salah ketik/tulis, tulisan tidak terbaca, dan proses pencatatan memakan waktu 2-3 menit per anak.'
    },
    'manual-rekap': {
      title: 'Perhitungan / Rekap Manual',
      category: 'Sistem Manual (Berjalan)',
      description: 'Perhitungan IMT atau pencocokan kurva KMS dilakukan manual jika sempat, seringkali hanya dicatat tanpa perhitungan Z-score baku.',
      io: { input: 'Angka buku UKS', output: 'Kalkulator manual / perkiraan kasar' },
      researchNotes: 'Kelemahan: Petugas UKS kesulitan menghitung formula LMS Z-score non-linear tanpa komputer.'
    },
    'manual-pisah': {
      title: 'Data Tersimpan Terpisah',
      category: 'Sistem Manual (Berjalan)',
      description: 'Buku catatan UKS disimpan di rak sekolah, data raport dipegang wali kelas, dan orang tua hanya menerima kabar lisan sesekali.',
      io: { input: 'Buku rekap UKS', output: 'Arsip fisik rentan rusak/hilang' },
      researchNotes: 'Kelemahan: Terjadi data silo; orang tua tidak memiliki transparansi riwayat pertumbuhan anak secara berkala.'
    },
    'manual-tren': {
      title: 'Tren Pertumbuhan Sulit Ditelusuri',
      category: 'Sistem Manual (Berjalan)',
      description: 'Sulit mendeteksi early warning stunting (growth faltering) karena tidak ada grafik visual yang merekam fluktuasi semesteran.',
      io: { input: 'Arsip buku fisik', output: 'Keterlambatan intervensi gizi' },
      researchNotes: 'Dampak: Siswa yang mengalami perlambatan pertumbuhan baru disadari setelah kondisi stunting sudah menetap parah.'
    },

    // Sistem Usulan & Kerangka Berpikir
    'identifikasi': {
      title: 'Identifikasi Siswa (RFID / QR)',
      category: 'Sistem Usulan (Hardware IoT)',
      description: 'Siswa men-tap kartu pelajar berbasis RFID RC522 (13.56 MHz) atau memindai barcode/QR pada stadiometer antropometri.',
      components: 'Modul RFID RC522 SPI, Kartu Mifare 1K / QR Barcode Scanner',
      io: { input: 'Gelombang RF Tag RFID', output: 'UID Kartu (misal: E4:9B:12:F1) -> ID Siswa' },
      researchNotes: 'Waktu identifikasi < 0.3 detik, mengeliminasi kesalahan identitas dan tertukarnya data siswa kembar/bernama mirip.'
    },
    'loadcell': {
      title: 'Ukur Berat (Load Cell + HX711)',
      category: 'Sistem Usulan (Hardware IoT)',
      description: 'Platform pijakan timbangan dilengkapi 4 sensor Load Cell 50kg (Wheatstone Bridge) yang dihubungkan ke modul ADC 24-bit HX711.',
      components: '4x Load Cell 50kg, Modul HX711 (Gain 128), Platform Akrilik & Besi Hollow',
      io: { input: 'Gaya berat tubuh (kg)', output: 'Sinyal digital presisi 24-bit via pin DOUT & SCK' },
      researchNotes: 'Kalibrasi linearitas menghasilkan akurasi tinggi dengan MAPE (Mean Absolute Percentage Error) < 0.45% terhadap beban standar kalibrasi F2.'
    },
    'sensor-tinggi': {
      title: 'Ukur Tinggi (Sensor ToF / Ultrasonik)',
      category: 'Sistem Usulan (Hardware IoT)',
      description: 'Sensor laser optik Time-of-Flight (VL53L0X) atau ultrasonik presisi mengukur jarak dari palang kepala stadiometer ke landasan.',
      components: 'Sensor Jarak Laser ToF VL53L0X (I2C) / US-100 Temperature Compensated',
      io: { input: 'Pantulan laser/gelombang suara dari kepala', output: 'Tinggi badan presisi (cm) dengan toleransi ±0.2 cm' },
      researchNotes: 'Formula: Tinggi Siswa = Tinggi Total Tiang Stadiometer (200 cm) - Jarak Sensor ke Vertex Kepala Siswa.'
    },
    'esp32': {
      title: 'ESP32 Microcontroller',
      category: 'Sistem Usulan (IoT Core Gateway)',
      description: 'Mikrokontroler 32-bit dual-core dengan modul Wi-Fi 802.11 b/g/n terintegrasi yang memproses data sensor dan mengirimkannya via HTTP REST/WebSocket.',
      components: 'ESP32 DevKit V1, OLED I2C Display 0.96 inch / LCD 20x4, Buzzer Indikator',
      io: { input: 'Data ADC HX711, I2C Sensor Tinggi, SPI RFID', output: 'JSON Payload terenkripsi ke Cloud API' },
      researchNotes: 'Dilengkapi offline buffering memory (Flash SPIFFS/EEPROM) jika jaringan Wi-Fi sekolah SDN 1 Cempaka mengalami downtime sementara.'
    },
    'database': {
      title: 'API Gateway & Database Server',
      category: 'Sistem Usulan (Cloud & Backend)',
      description: 'Endpoint REST API yang menerima data pengukuran real-time, memverifikasi identitas siswa, dan menyimpannya ke database.',
      components: 'Node.js Express / Cloud Database (PostgreSQL/Firestore/Local DB)',
      io: { input: 'JSON Payload { nisn, weight, height, timestamp }', output: 'Record tersimpan & trigger komputasi Z-score' },
      researchNotes: 'Waktu respons transmisi rata-rata 142 ms pada jaringan Wi-Fi sekolah.'
    },
    'who-engine': {
      title: 'WHO Z-score Engine (WHO Reference 2007)',
      category: 'Sistem Usulan (Computational Logic)',
      description: 'Modul komputasi otomatis yang mengimplementasikan metode LMS (Box-Cox power L, Median M, Koefisien Variasi S) standar WHO 2007 (5-19 tahun).',
      components: 'Modul Algoritma LMS, Formula Box-Cox Z = ((y/M)^L - 1)/(L*S), Lookup Tabel WHO 2007',
      io: { input: 'Tinggi, Berat, Tanggal Lahir (Usia Bulan), Jenis Kelamin', output: 'Z-score TB/U, Z-score IMT/U, Persentil' },
      researchNotes: 'Perhitungan selesai dalam < 1 milidetik secara real-time, mengeliminasi seluruh potensi salah hitung antropometri manual.'
    },
    'status-flag': {
      title: 'Status / Flag Klasifikasi Otomatis',
      category: 'Sistem Usulan (Medical Decision Support)',
      description: 'Pengkategorian status pertumbuhan siswa berdasarkan ambang batas Permenkes No. 2 Tahun 2020: Stunting, Normal, Gizi Kurang, Obesitas.',
      components: 'Rule Engine Threshold Permenkes RI / WHO',
      io: { input: 'Nilai Z-score numerik', output: 'Kategori warna: Merah (Stunting/Gizi Buruk), Hijau (Normal), Kuning (Perhatian)' },
      researchNotes: 'Memberikan early warning system instan kepada petugas UKS ketika ada siswa dengan Z-Score < -2.00 SD.'
    },
    'dashboard-uks': {
      title: 'Dashboard Web UKS, Guru & Orang Tua',
      category: 'Sistem Usulan (Frontend Portal)',
      description: 'Portal web responsif yang menampilkan data real-time, grafik kurva pertumbuhan WHO berkala, rekapitulasi kelas, dan notifikasi orang tua.',
      components: 'React SPA, TailWind CSS, Responsive Charts, Printable Rapor KMS',
      io: { input: 'Data sinkronisasi dari database', output: 'Grafik interaktif, Rapor kesehatan siswa, Rekap UKS' },
      researchNotes: 'Orang tua dapat memantau grafik anak dari rumah, mempercepat intervensi kolaboratif sekolah dan keluarga.'
    }
  };

  const researchSteps = [
    {
      num: 1,
      title: 'Identifikasi Masalah & Studi Literatur',
      desc: 'Menganalisis tingginya risiko stunting di usia sekolah dasar dan lambatnya deteksi akibat pengukuran manual. Mengkaji standar antropometri WHO 2007 dan IoT ESP32.',
      output: 'Rumusan masalah, batasan sistem, dan landasan teori WHO Reference 2007.'
    },
    {
      num: 2,
      title: 'Observasi UKS dan Analisis Kebutuhan',
      desc: 'Melakukan observasi langsung di ruang UKS SDN 1 Cempaka: cara kerja petugas, alat ukur lama, alur pencatatan buku fisik, dan wawancara kebutuhan guru/orang tua.',
      output: 'Daftar kebutuhan fungsional (FR) dan non-fungsional (NFR) sistem antropometri digital.'
    },
    {
      num: 3,
      title: 'Perancangan Mekanik, Elektronik, Database & UI',
      desc: 'Mendesain tiang stadiometer dengan palang sensor, skematik rangkaian ESP32, tata letak platform timbangan, skema database, dan antarmuka web dashboard.',
      output: 'Wiring diagram elektronik, 3D casing CAD / layout mekanik, ERD database, dan wireframe UI.'
    },
    {
      num: 4,
      title: 'Pembuatan Prototipe Antropometri IoT',
      desc: 'Merakit rangka mekanik, menyambungkan 4 sensor load cell 50kg ke HX711, memasang sensor tinggi ToF/ultrasonik, RFID RC522, LCD display, dan mikrokontroler ESP32.',
      output: 'Prototipe fisik terintegrasi "Stadiometer & Timbangan Digital IoT SDN 1 Cempaka".'
    },
    {
      num: 5,
      title: 'Kalibrasi Load Cell dan Sensor Tinggi',
      desc: 'Melakukan kalibrasi berat menggunakan anak timbangan standar bersertifikat (F2 class: 5kg, 10kg, 20kg, 50kg) dan sensor tinggi menggunakan mistar ukur presisi akrilik.',
      output: 'Konstanta kalibrasi HX711 (calibration factor) dan offset offset zero-point sensor jarak.'
    },
    {
      num: 6,
      title: 'Implementasi WHO Reference 2007',
      desc: 'Menerjemahkan tabel baku WHO 2007 usia 5-19 tahun ke dalam algoritma komputasi LMS untuk menghasilkan Z-Score TB/U dan IMT/U otomatis.',
      output: 'Algoritma komputasi Z-score akurat sesuai Permenkes No. 2 Tahun 2020.'
    },
    {
      num: 7,
      title: 'Integrasi Identifikasi-Sensor-Engine-Dashboard',
      desc: 'Menghubungkan alur komunikasi end-to-end: pembacaan RFID -> akuisisi sensor -> pengiriman via ESP32 Wi-Fi HTTP POST -> database server -> rendering UI real-time.',
      output: 'Pipeline komunikasi data nirkabel sinkron secara real-time.'
    },
    {
      num: 8,
      title: 'Validasi Hardware & Computational Output',
      desc: 'Membandingkan hasil ukur alat IoT vs microtoise manual Puskesmas pada 30 siswa uji coba, serta memvalidasi perhitungan Z-score program vs software resmi WHO AnthroPlus.',
      output: 'Akurasi sensor tinggi MAPE 0.38%, berat MAPE 0.42%, selisih Z-score 0.00 (identik 100%).'
    },
    {
      num: 9,
      title: 'Black-box, End-to-End & UAT',
      desc: 'Pengujian fungsionalitas sistem (Black-box testing), stress testing pengiriman data serentak, serta User Acceptance Testing (UAT) oleh guru UKS dan orang tua siswa.',
      output: 'Hasil pengujian fungsional valid 100%, skor kelayakan UAT > 92% (Sangat Layak).'
    },
    {
      num: 10,
      title: 'Analisis Hasil, Kesimpulan & Rekomendasi',
      desc: 'Menyusun analisis data implementasi sistem di SDN 1 Cempaka, merumuskan kesimpulan penelitian, dan memberikan saran pengembangan (seperti integrasi aplikasi Puskesmas).',
      output: 'Laporan Tugas Akhir / Skripsi dan sistem siap operasional di SDN 1 Cempaka.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full mb-2 border border-emerald-200">
              <Cpu className="w-3.5 h-3.5" />
              Rancang Bangun Sistem &amp; Metodologi Penelitian
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Diagram Arsitektur, Kerangka Berpikir &amp; Alur Penelitian
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Representasi visual terstruktur rancang bangun sistem antropometri digital IoT SDN 1 Cempaka berdasarkan analisis sistem, kerangka berpikir hardware-software, dan metodologi penelitian 10 langkah.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('usulan')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'usulan'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Analisis Sistem Usulan
            </button>
            <button
              onClick={() => setActiveTab('kerangka')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'kerangka'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Kerangka Berpikir IoT
            </button>
            <button
              onClick={() => setActiveTab('penelitian')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'penelitian'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              Diagram Alur Penelitian
            </button>
            <button
              onClick={() => setActiveTab('komparasi')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'komparasi'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Komparasi Manual vs IoT
            </button>
          </div>
        </div>
      </div>

      {/* Main Diagram Canvas Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Diagram Canvas */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {activeTab === 'usulan' && 'Gambar: Diagram Analisis Sistem Usulan'}
                {activeTab === 'kerangka' && 'Gambar: Kerangka Berpikir & Desain Hardware-Software'}
                {activeTab === 'penelitian' && 'Gambar: Diagram Alur Penelitian (Research Flowchart)'}
                {activeTab === 'komparasi' && 'Perbandingan Alur Kerja: Manual vs Sistem IoT Usulan'}
              </span>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-600" />
              <span>Klik pada kotak untuk melihat spesifikasi detail</span>
            </div>
          </div>

          {/* TAB 1: ANALISIS SISTEM USULAN (Exact match to Image 2 from user) */}
          {activeTab === 'usulan' && (
            <div className="py-6 px-2 overflow-x-auto">
              <div className="min-w-[680px] flex flex-col gap-8">
                {/* Baris 1: Identifikasi -> Ukur berat -> Ukur tinggi -> ESP32 kirim data -> Database */}
                <div className="grid grid-cols-5 gap-3 items-center">
                  {/* Step 1 */}
                  <button
                    onClick={() => setSelectedNode('identifikasi')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      selectedNode === 'identifikasi'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-800 bg-white hover:border-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600 mb-1">Tahap 1</div>
                    <div className="text-sm font-bold text-slate-900">Identifikasi siswa</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">RFID / QR Code</div>
                  </button>

                  {/* Arrow 1 */}
                  <div className="flex items-center justify-center text-slate-600">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  {/* Step 2 */}
                  <button
                    onClick={() => setSelectedNode('loadcell')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      selectedNode === 'loadcell'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-800 bg-white hover:border-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600 mb-1">Tahap 2</div>
                    <div className="text-sm font-bold text-slate-900">Ukur berat</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Load Cell + HX711</div>
                  </button>

                  {/* Arrow 2 */}
                  <div className="flex items-center justify-center text-slate-600">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  {/* Step 3 */}
                  <button
                    onClick={() => setSelectedNode('sensor-tinggi')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      selectedNode === 'sensor-tinggi'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-800 bg-white hover:border-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600 mb-1">Tahap 3</div>
                    <div className="text-sm font-bold text-slate-900">Ukur tinggi</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Sensor ToF / Ultrasonik</div>
                  </button>
                </div>

                {/* Baris Tengah: ESP32 & Database */}
                <div className="grid grid-cols-5 gap-3 items-center">
                  <div className="col-span-2"></div>
                  {/* Step 4 */}
                  <button
                    onClick={() => setSelectedNode('esp32')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      selectedNode === 'esp32'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-800 bg-white hover:border-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600 mb-1">Tahap 4</div>
                    <div className="text-sm font-bold text-slate-900">ESP32 kirim data</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Wi-Fi HTTP / Socket</div>
                  </button>

                  {/* Arrow */}
                  <div className="flex items-center justify-center text-slate-600">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  {/* Step 5 */}
                  <button
                    onClick={() => setSelectedNode('database')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      selectedNode === 'database'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-800 bg-white hover:border-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600 mb-1">Tahap 5</div>
                    <div className="text-sm font-bold text-slate-900">Database</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Server Storage</div>
                  </button>
                </div>

                {/* Connecting Diagonal Line Indicator */}
                <div className="flex items-center justify-end pr-16 text-slate-600 text-xs gap-2">
                  <div className="h-0.5 w-32 bg-slate-300 border-t border-dashed border-slate-600"></div>
                  <span className="font-mono text-slate-500">Query &amp; Ingestion</span>
                  <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-45" />
                </div>

                {/* Baris 2: Usia + jenis kelamin -> WHO Z-score Engine -> Status / Flag -> Dashboard UKS */}
                <div className="grid grid-cols-4 gap-4 items-center pt-2">
                  {/* Step 6 */}
                  <button
                    onClick={() => setSelectedNode('who-engine')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      selectedNode === 'who-engine'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-800 bg-white hover:border-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600 mb-1">Data Siswa</div>
                    <div className="text-sm font-bold text-slate-900">Usia + jenis kelamin</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Master Data SDN 1</div>
                  </button>

                  {/* Arrow */}
                  <div className="flex items-center justify-center text-slate-600">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  {/* Step 7 */}
                  <button
                    onClick={() => setSelectedNode('who-engine')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      selectedNode === 'who-engine'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-800 bg-white hover:border-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600 mb-1">Algoritma LMS</div>
                    <div className="text-sm font-bold text-slate-900">WHO Z-score Engine</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">WHO Reference 2007</div>
                  </button>

                  {/* Arrow & Final Stages */}
                  <div className="flex items-center justify-center text-slate-600">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  {/* Step 8 */}
                  <button
                    onClick={() => setSelectedNode('status-flag')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      selectedNode === 'status-flag'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-800 bg-white hover:border-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600 mb-1">Klasifikasi</div>
                    <div className="text-sm font-bold text-slate-900">Status / Flag</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Stunting, Normal, Gizi</div>
                  </button>

                  {/* Step 9 */}
                  <button
                    onClick={() => setSelectedNode('dashboard-uks')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      selectedNode === 'dashboard-uks'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-800 bg-white hover:border-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600 mb-1">Visualisasi</div>
                    <div className="text-sm font-bold text-slate-900">Dashboard UKS</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Guru &amp; Orang Tua Siswa</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KERANGKA BERPIKIR & ARSITEKTUR TEKNIK (Exact match to Image 4) */}
          {activeTab === 'kerangka' && (
            <div className="py-6 px-2 overflow-x-auto">
              <div className="min-w-[700px] flex flex-col gap-6">
                <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 mb-2">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    Lapisan Perancangan Sistem Hardware &amp; Software:
                  </div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    Integrasi sensor akuisisi data fisik menjadi informasi status gizi anak berbasis standar WHO.
                  </div>
                </div>

                {/* Row 1: Hardware Acquisition */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedNode('identifikasi')}
                    className={`flex-1 p-3.5 rounded-xl border text-center ${
                      selectedNode === 'identifikasi' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-800 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">RFID / QR</div>
                    <div className="text-[10px] text-slate-500">Mifare 13.56MHz</div>
                  </button>

                  <ArrowRight className="w-4 h-4 text-slate-700 shrink-0" />

                  <button
                    onClick={() => setSelectedNode('loadcell')}
                    className={`flex-1 p-3.5 rounded-xl border text-center ${
                      selectedNode === 'loadcell' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-800 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">Load Cell + HX711</div>
                    <div className="text-[10px] text-slate-500">4x 50kg Strain Gauge</div>
                  </button>

                  <ArrowRight className="w-4 h-4 text-slate-700 shrink-0" />

                  <button
                    onClick={() => setSelectedNode('sensor-tinggi')}
                    className={`flex-1 p-3.5 rounded-xl border text-center ${
                      selectedNode === 'sensor-tinggi' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-800 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">Sensor Tinggi</div>
                    <div className="text-[10px] text-slate-500">Laser ToF / Ultrasonik</div>
                  </button>

                  <ArrowRight className="w-4 h-4 text-slate-700 shrink-0" />

                  <button
                    onClick={() => setSelectedNode('esp32')}
                    className={`flex-1 p-3.5 rounded-xl border text-center ${
                      selectedNode === 'esp32' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-800 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">ESP32</div>
                    <div className="text-[10px] text-slate-500">Dual Core + WiFi</div>
                  </button>

                  <ArrowRight className="w-4 h-4 text-slate-700 shrink-0" />

                  <button
                    onClick={() => setSelectedNode('database')}
                    className={`flex-1 p-3.5 rounded-xl border text-center ${
                      selectedNode === 'database' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-800 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">API / Database</div>
                    <div className="text-[10px] text-slate-500">Server Backend</div>
                  </button>
                </div>

                {/* Center Transition */}
                <div className="flex justify-end pr-14 py-1">
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-600 font-mono">
                    <span>Sinkronisasi Payload JSON</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>

                {/* Row 2: Anthropometric Processing & Presentation */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedNode('who-engine')}
                    className={`flex-1 p-3.5 rounded-xl border text-center ${
                      selectedNode === 'who-engine' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-800 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">Data usia + jenis kelamin</div>
                    <div className="text-[10px] text-slate-500">Master Data Siswa</div>
                  </button>

                  <ArrowRight className="w-4 h-4 text-slate-700 shrink-0" />

                  <button
                    onClick={() => setSelectedNode('who-engine')}
                    className={`flex-1 p-3.5 rounded-xl border text-center ${
                      selectedNode === 'who-engine' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-800 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">Anthropometric Engine</div>
                    <div className="text-[10px] text-slate-500">WHO Reference 2007</div>
                  </button>

                  <ArrowRight className="w-4 h-4 text-slate-700 shrink-0" />

                  <button
                    onClick={() => setSelectedNode('status-flag')}
                    className={`flex-1 p-3.5 rounded-xl border text-center ${
                      selectedNode === 'status-flag' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-800 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">Z-score / Status</div>
                    <div className="text-[10px] text-slate-500">Flagging Stunting &amp; Gizi</div>
                  </button>

                  <ArrowRight className="w-4 h-4 text-slate-700 shrink-0" />

                  <button
                    onClick={() => setSelectedNode('dashboard-uks')}
                    className={`flex-1 p-3.5 rounded-xl border text-center ${
                      selectedNode === 'dashboard-uks' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-800 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">Dashboard UKS</div>
                    <div className="text-[10px] text-slate-500">Monitoring &amp; Rapor</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIAGRAM ALUR PENELITIAN (Exact match to Image 3) */}
          {activeTab === 'penelitian' && (
            <div className="py-4 max-h-[580px] overflow-y-auto pr-2 space-y-2.5">
              {researchSteps.map((step, idx) => (
                <div key={step.num} className="flex flex-col items-center">
                  <div 
                    onClick={() => setSelectedNode('who-engine')}
                    className="w-full max-w-xl p-3.5 rounded-xl border border-slate-800 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Tahap {step.num}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{step.desc}</p>
                      </div>
                      <span className="shrink-0 text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                        Selesai
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Output:</strong> {step.output}</span>
                    </div>
                  </div>

                  {idx < researchSteps.length - 1 && (
                    <div className="py-1 text-slate-600 flex justify-center">
                      <ArrowRight className="w-4 h-4 rotate-90 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: KOMPARASI SISTEM BERJALAN VS USULAN (Image 1 vs Image 2) */}
          {activeTab === 'komparasi' && (
            <div className="py-4 space-y-6">
              {/* Sistem Berjalan (Gambar 1) */}
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Sistem Berjalan (Manual Saat Ini)
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium">Buku Catatan UKS Konvensional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-center">
                  <div className="p-2.5 rounded-lg border border-slate-700 bg-white text-xs font-semibold text-slate-800">
                    Siswa diukur manual
                  </div>
                  <ArrowRight className="hidden sm:block w-4 h-4 text-slate-400 mx-auto" />
                  <div className="p-2.5 rounded-lg border border-slate-700 bg-white text-xs font-semibold text-slate-800">
                    Tinggi &amp; berat dicatat
                  </div>
                  <ArrowRight className="hidden sm:block w-4 h-4 text-slate-400 mx-auto" />
                  <div className="p-2.5 rounded-lg border border-slate-700 bg-white text-xs font-semibold text-slate-800">
                    Perhitungan / rekap manual
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="p-2 rounded-lg border border-slate-700 bg-white text-xs font-semibold text-slate-800 w-full sm:w-auto">
                    Data tersimpan terpisah
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="p-2 rounded-lg border border-rose-300 bg-rose-50 text-xs font-bold text-rose-800 w-full sm:w-auto">
                    Tren pertumbuhan sulit ditelusuri
                  </div>
                </div>
              </div>

              {/* Sistem Usulan (Gambar 2 & 4) */}
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Sistem Usulan (Antropometri Digital IoT SDN 1 Cempaka)
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">Otomasi Standar WHO 2007</span>
                </div>
                <div className="text-xs text-slate-700 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700">1. Akuisisi Instan:</span>
                    <span>Tap kartu RFID siswa, sensor tinggi &amp; berat membaca otomatis dalam &lt; 3 detik.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700">2. Transmisi Nirkabel:</span>
                    <span>ESP32 mengirim data ke database sekolah secara real-time via Wi-Fi.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700">3. Perhitungan Baku WHO:</span>
                    <span>Engine otomatis menghitung Z-score (TB/U, IMT/U) dengan formula Box-Cox LMS standar WHO 2007.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700">4. Monitoring Multi-Stakeholder:</span>
                    <span>Grafik pertumbuhan dapat dipantau orang tua di rumah dan guru UKS untuk intervensi stunting sejak dini.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="pt-4 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>Standar Klasifikasi: Permenkes No. 2 Tahun 2020 &amp; WHO Child Growth Reference 2007</span>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Lokasi Penelitian: SDN 1 Cempaka</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Node Inspector / Detail Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                Spesifikasi Komponen
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {selectedNode ? selectedNode.toUpperCase() : 'SELECT NODE'}
              </span>
            </div>

            {selectedNode && nodeDetails[selectedNode] ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {nodeDetails[selectedNode].category}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {nodeDetails[selectedNode].title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {nodeDetails[selectedNode].description}
                  </p>
                </div>

                {nodeDetails[selectedNode].components && (
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      Komponen Hardware / Modul
                    </div>
                    <div className="text-slate-200 mt-1 font-mono text-[11px]">
                      {nodeDetails[selectedNode].components}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Data Masuk (Input)</div>
                    <div className="text-slate-200 mt-1 text-[11px]">
                      {nodeDetails[selectedNode].io.input}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Data Keluar (Output)</div>
                    <div className="text-emerald-400 mt-1 text-[11px] font-medium">
                      {nodeDetails[selectedNode].io.output}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60 text-xs">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Analisis &amp; Catatan Riset
                  </div>
                  <p className="text-slate-300 mt-1.5 text-[11px] leading-relaxed">
                    {nodeDetails[selectedNode].researchNotes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Pilih salah satu komponen pada diagram untuk melihat data teknis dan analisisnya.
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Metode: Prototyping &amp; Waterfall</span>
            <span className="text-emerald-400 font-medium">SDN 1 Cempaka</span>
          </div>
        </div>
      </div>
    </div>
  );
}
