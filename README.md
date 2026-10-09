# RANCANG BANGUN SISTEM ANTROPOMETRI DIGITAL BERBASIS IoT
## UNTUK MONITORING STATUS PERTUMBUHAN SISWA SDN 1 CEMPAKA

Aplikasi web dashboard dan pipeline IoT untuk pengukuran antropometri otomatis siswa sekolah dasar berbasis mikrokontroler ESP32, sensor berat Load Cell HX711, sensor tinggi Laser ToF VL53L0X, dan RFID RC522 dengan kalkulasi baku WHO Reference 2007 (Permenkes No. 2 Tahun 2020).

### Fitur Utama
1. **IoT Live Data Sync:** Akuisisi instan pembacaan RFID siswa, berat badan, dan tinggi badan ke server secara real-time.
2. **Kalkulasi WHO Z-Score LMS:** Penentuan status stunting (TB/U) dan status gizi (IMT/U) secara otomatis.
3. **Pojok Gizi Cerdas:** Edukasi kesehatan kurasi otomatis berdasarkan profil gizi rata-rata siswa di kelas.
4. **Kirim WhatsApp:** Pengiriman rapor pertumbuhan anak ke nomor WhatsApp wali murid dalam 1-klik.
5. **Ekspor & Impor Excel (.xlsx) / PDF:** Unduh rekapitulasi data dan import massal data siswa baru.

### Cara Menjalankan Proyek Lokal
```bash
# Install dependencies
npm install

# Jalankan server pengembangan
npm run dev

# Bangun untuk produksi
npm run build
```

### Deployment ke Vercel
Proyek ini sudah dilengkapi file konfigurasi `vercel.json` untuk Single Page Application (SPA).
Cukup hubungkan repositori GitHub Anda ke Vercel.
