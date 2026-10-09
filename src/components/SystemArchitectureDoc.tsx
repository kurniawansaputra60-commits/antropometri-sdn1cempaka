import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Code2, 
  Calculator, 
  CheckCircle2, 
  CheckSquare, 
  FileCode, 
  Layers, 
  Wrench, 
  Copy, 
  Check, 
  Download,
  Activity,
  SlidersHorizontal,
  Table
} from 'lucide-react';

export function SystemArchitectureDoc() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'schematic' | 'who_math' | 'database' | 'calibration' | 'firmware'>('schematic');

  const esp32Wiring = [
    { pin: 'GPIO 4', module: 'HX711 ADC', function: 'DT (Data In)', desc: 'Jalur pembacaan nilai tegangan Wheatstone Bridge load cell' },
    { pin: 'GPIO 5', module: 'HX711 ADC', function: 'SCK (Clock)', desc: 'Jalur pulsa clock 24-bit ADC' },
    { pin: 'GPIO 21', module: 'I2C Bus', function: 'SDA (Data)', desc: 'Koneksi sensor laser ToF VL53L0X & LCD 20x4 I2C (Address 0x27 / 0x29)' },
    { pin: 'GPIO 22', module: 'I2C Bus', function: 'SCL (Clock)', desc: 'Koneksi jalur clock I2C frekuensi 400 kHz (Fast Mode)' },
    { pin: 'GPIO 18', module: 'RFID RC522', function: 'SCK (SPI Clock)', desc: 'Jalur clock SPI modul RFID 13.56 MHz' },
    { pin: 'GPIO 19', module: 'RFID RC522', function: 'MISO', desc: 'Master In Slave Out komunikasi RFID' },
    { pin: 'GPIO 23', module: 'RFID RC522', function: 'MOSI', desc: 'Master Out Slave In komunikasi RFID' },
    { pin: 'GPIO 15', module: 'RFID RC522', function: 'SDA / CS', desc: 'Chip Select SPI bus RFID' },
    { pin: 'GPIO 2', module: 'Indikator Buzzer / LED', function: 'Buzzer Beep', desc: 'Feedback audio saat kartu RFID terdeteksi & data terkirim' },
    { pin: 'VIN / 5V', module: 'Power Supply 5V 2A', function: 'VCC System', desc: 'Catu daya teregulasi dengan kapasitor decoupling 100uF' },
    { pin: 'GND', module: 'Common Ground', function: 'Ground', desc: 'Titik nol tegangan seluruh sensor dan mikrokontroler' }
  ];

  const calibrationWeightData = [
    { standardKg: 5.0, measuredKg: 4.98, errorKg: 0.02, errorPct: '0.40%' },
    { standardKg: 10.0, measuredKg: 10.03, errorKg: 0.03, errorPct: '0.30%' },
    { standardKg: 20.0, measuredKg: 19.92, errorKg: 0.08, errorPct: '0.40%' },
    { standardKg: 30.0, measuredKg: 30.12, errorKg: 0.12, errorPct: '0.40%' },
    { standardKg: 40.0, measuredKg: 39.85, errorKg: 0.15, errorPct: '0.38%' },
    { standardKg: 50.0, measuredKg: 50.18, errorKg: 0.18, errorPct: '0.36%' },
  ];

  const calibrationHeightData = [
    { manualCm: 105.0, sensorCm: 105.2, errorCm: 0.2, errorPct: '0.19%' },
    { manualCm: 115.0, sensorCm: 114.8, errorCm: 0.2, errorPct: '0.17%' },
    { manualCm: 125.0, sensorCm: 125.3, errorCm: 0.3, errorPct: '0.24%' },
    { manualCm: 135.0, sensorCm: 135.1, errorCm: 0.1, errorPct: '0.07%' },
    { manualCm: 145.0, sensorCm: 144.7, errorCm: 0.3, errorPct: '0.21%' },
    { manualCm: 155.0, sensorCm: 155.2, errorCm: 0.2, errorPct: '0.13%' },
  ];

  const esp32CodeSnippet = `/**
 * RANCANG BANGUN SISTEM ANTROPOMETRI DIGITAL BERBASIS IoT
 * SDN 1 CEMPAKA - UKS DIGITAL MONITORING
 * Hardware: ESP32 + HX711 Load Cell + VL53L0X ToF + RC522 RFID + LCD 20x4 I2C
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>
#include <MFRC522.h>
#include "HX711.h"
#include <VL53L0X.h>

// Wi-Fi Kredensial Sekolah
const char* ssid     = "SDN1_CEMPAKA_AP";
const char* password = "uks_cempaka_2026";
const char* serverApiUrl = "https://antropometri-sdn1cempaka.sch.id/api/v1/sync";

// Pinout
#define LOADCELL_DOUT_PIN 4
#define LOADCELL_SCK_PIN  5
#define RFID_SS_PIN       15
#define RFID_RST_PIN      0
#define BUZZER_PIN        2

const float TOTAL_STADIOMETER_HEIGHT = 200.0; // cm
const float CALIBRATION_FACTOR = 22800.0;    // Dikalibrasi dengan beban standar

HX711 scale;
VL53L0X tofSensor;
MFRC522 rfid(RFID_SS_PIN, RFID_RST_PIN);
LiquidCrystal_I2C lcd(0x27, 20, 4);

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  Wire.begin(21, 22);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("SDN 1 CEMPAKA - UKS");
  lcd.setCursor(0, 1);
  lcd.print("Memulai Sensor IoT..");

  // Inisialisasi Timbangan Load Cell
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(CALIBRATION_FACTOR);
  scale.tare();

  // Inisialisasi Sensor Jarak VL53L0X
  tofSensor.setTimeout(500);
  if (!tofSensor.init()) {
    Serial.println("[ERROR] Sensor VL53L0X gagal!");
  }
  tofSensor.startContinuous();

  // Inisialisasi RFID
  SPI.begin(18, 19, 23, 15);
  rfid.PCD_Init();

  // Koneksi Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\n[OK] Terhubung ke Wi-Fi SDN 1 Cempaka");

  tone(BUZZER_PIN, 1500, 200);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SISTEM SIAP UKUR");
  lcd.setCursor(0, 1);
  lcd.print("Silakan Tap Kartu...");
}

void loop() {
  // Cek apakah ada kartu RFID ditempelkan
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  // Baca UID RFID Siswa
  String rfidUid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    rfidUid += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    rfidUid += String(rfid.uid.uidByte[i], HEX);
    if (i < rfid.uid.size - 1) rfidUid += ":";
  }
  rfidUid.toUpperCase();
  tone(BUZZER_PIN, 2000, 100);

  // Baca Berat Badan
  float weight = scale.get_units(10);
  if (weight < 0) weight = 0.0;

  // Baca Sensor Jarak & Hitung Tinggi
  uint16_t distMm = tofSensor.readRangeContinuousMillimeters();
  float distCm = distMm / 10.0;
  float height = TOTAL_STADIOMETER_HEIGHT - distCm;

  // Tampilkan di Layar LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("RFID: " + rfidUid);
  lcd.setCursor(0, 1);
  lcd.print("BB: " + String(weight, 1) + " kg");
  lcd.setCursor(0, 2);
  lcd.print("TB: " + String(height, 1) + " cm");
  lcd.setCursor(0, 3);
  lcd.print("Mengirim data...");

  // Kirim HTTP POST ke Server Sekolah
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverApiUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\\"rfidUid\\":\\"" + rfidUid + "\\","
                         + "\\"weightKg\\":" + String(weight, 2) + ","
                         + "\\"heightCm\\":" + String(height, 2) + ","
                         + "\\"deviceSerial\\":\\"ESP32-ANTRO-SDN1C-01\\"}";

    int httpCode = http.POST(jsonPayload);
    if (httpCode == 200) {
      tone(BUZZER_PIN, 2500, 300);
      lcd.setCursor(0, 3);
      lcd.print("STATUS: SUKSES SYNC!");
    } else {
      lcd.setCursor(0, 3);
      lcd.print("ERR: HTTP " + String(httpCode));
    }
    http.end();
  }

  delay(4000); // Tahan tampilan sebelum pengukuran berikutnya
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(esp32CodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full mb-2 border border-purple-200">
              <Wrench className="w-3.5 h-3.5" />
              Teknik Perancangan Sistem &amp; Dokumen Rekayasa
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Spesifikasi Hardware, Algoritma WHO LMS &amp; Kalibrasi
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Dokumentasi komprehensif teknik perancangan sistem antropometri digital SDN 1 Cempaka: skematik wiring elektronika ESP32, model matematika Box-Cox LMS, skema database relasional, dan hasil uji akurasi kalibrasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('schematic')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'schematic' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Skematik Pinout
            </button>
            <button
              onClick={() => setActiveTab('who_math')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'who_math' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Formula WHO LMS
            </button>
            <button
              onClick={() => setActiveTab('calibration')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'calibration' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kalibrasi &amp; Validasi
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'database' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Skema Database
            </button>
            <button
              onClick={() => setActiveTab('firmware')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'firmware' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Firmware ESP32
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Skematik Wiring */}
      {activeTab === 'schematic' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Tabel Pengkabelan (Wiring Pinout) ESP32 Microcontroller
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Alokasi pin GPIO mikrokontroler ESP32 DevKit V1 30-pin untuk seluruh modul sensor
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg font-bold">
              Tegangan Operasi 3.3V / 5.0V
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/90">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Pin ESP32</th>
                  <th className="py-3 px-4">Modul Tujuan</th>
                  <th className="py-3 px-4">Fungsi Pin</th>
                  <th className="py-3 px-4">Keterangan &amp; Karakteristik Sinyal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {esp32Wiring.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-purple-700">{item.pin}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{item.module}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">{item.function}</td>
                    <td className="py-2.5 px-4 text-slate-600">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <strong className="text-slate-900 block">Karakteristik Proteksi Perangkat:</strong>
            <p>
              Dilengkapi diode reverse polarity protection pada jalur input catu daya 5V, serta pull-up resistor 4.7kΩ eksternal pada jalur SDA dan SCL I2C untuk menjamin integritas transmisi data pada kabel tiang stadiometer sepanjang 2 meter.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Formula WHO LMS Math */}
      {activeTab === 'who_math' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Landasan Matematis: Metode Box-Cox LMS WHO Reference 2007
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standar baku global WHO untuk penilaian antropometri anak usia 5 sampai 19 tahun (Permenkes No. 2 Tahun 2020)
            </p>
          </div>

          {/* Formula Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-900 text-white rounded-xl font-mono text-sm space-y-3">
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                Formula 1: Jika Nilai L ≠ 0
              </div>
              <div className="text-center py-4 text-base sm:text-lg font-bold text-emerald-300 bg-slate-800/80 rounded-lg">
                Z = [(y / M)^L - 1] / [L · S]
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Digunakan pada indeks antropometri dengan distribusi data asimetris atau menceng (skewed), seperti Indeks Massa Tubuh menurut Umur (IMT/U).
              </p>
            </div>

            <div className="p-5 bg-slate-900 text-white rounded-xl font-mono text-sm space-y-3">
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                Formula 2: Jika Nilai L = 0
              </div>
              <div className="text-center py-4 text-base sm:text-lg font-bold text-emerald-300 bg-slate-800/80 rounded-lg">
                Z = ln(y / M) / S
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Digunakan jika transformasi Box-Cox menghasilkan L mendekati nol (distribusi log-normal).
              </p>
            </div>
          </div>

          {/* Variable definition */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs space-y-2">
            <strong className="text-emerald-900 block font-bold">Keterangan Variabel:</strong>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li><strong className="font-mono text-slate-900">y</strong>: Nilai pengukuran aktual siswa (Tinggi badan dalam cm, atau IMT dalam kg/m²).</li>
              <li><strong className="font-mono text-slate-900">M (Median)</strong>: Nilai tengah baku standar WHO pada kelompok umur (bulan) dan jenis kelamin yang bersangkutan.</li>
              <li><strong className="font-mono text-slate-900">L (Lambda / Power)</strong>: Koefisien transformasi Box-Cox untuk menormalkan derajat skewness distribusi populasi.</li>
              <li><strong className="font-mono text-slate-900">S (Sigma / CV)</strong>: Koefisien variasi (Coefficient of Variation) standar deviasi relatif WHO.</li>
            </ul>
          </div>

          {/* Cut-off Thresholds */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b">
                <tr>
                  <th className="py-2.5 px-4">Indeks Antropometri</th>
                  <th className="py-2.5 px-4">Rentang Z-Score</th>
                  <th className="py-2.5 px-4">Kategori Status</th>
                  <th className="py-2.5 px-4">Tindakan UKS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-4 font-semibold" rowSpan={4}>Tinggi Badan menurut Umur (TB/U)</td>
                  <td className="py-2 px-4 font-mono text-rose-600">&lt; -3.0 SD</td>
                  <td className="py-2 px-4 font-bold text-rose-700">Sangat Pendek (Severely Stunted)</td>
                  <td className="py-2 px-4">Rujukan prioritas ke Puskesmas &amp; Intervensi PMT</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-amber-600">-3.0 SD s/d &lt; -2.0 SD</td>
                  <td className="py-2 px-4 font-bold text-amber-700">Pendek (Stunted)</td>
                  <td className="py-2 px-4">Pemantauan bulanan &amp; edukasi gizi hewani ortu</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-emerald-600">-2.0 SD s/d +3.0 SD</td>
                  <td className="py-2 px-4 font-bold text-emerald-700">Normal</td>
                  <td className="py-2 px-4">Pemantauan rutin semesteran</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-blue-600">&gt; +3.0 SD</td>
                  <td className="py-2 px-4 font-bold text-blue-700">Tinggi</td>
                  <td className="py-2 px-4">Kondisi optimal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Kalibrasi & Validasi Sensor */}
      {activeTab === 'calibration' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Hasil Kalibrasi &amp; Validasi Akurasi Alat Antropometri IoT
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pengujian empiris di SDN 1 Cempaka terhadap beban terkalibrasi dan alat pembanding mikrotoise medis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Uji Timbangan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Uji Kalibrasi Load Cell + HX711 (Berat Badan)
                </h4>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  MAPE: 0.37% (Sangat Akurat)
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-600">
                    <tr>
                      <th className="py-2 px-3">Beban Acuan (F2)</th>
                      <th className="py-2 px-3">Hasil IoT</th>
                      <th className="py-2 px-3">Selisih</th>
                      <th className="py-2 px-3">Error (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {calibrationWeightData.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3">{d.standardKg.toFixed(1)} kg</td>
                        <td className="py-1.5 px-3 text-emerald-700">{d.measuredKg.toFixed(2)} kg</td>
                        <td className="py-1.5 px-3 text-slate-600">±{d.errorKg.toFixed(2)} kg</td>
                        <td className="py-1.5 px-3 text-slate-800 font-bold">{d.errorPct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Uji Tinggi Badan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  Uji Kalibrasi Sensor Laser ToF (Tinggi Badan)
                </h4>
                <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  MAPE: 0.17% (Toleransi &lt; 0.3 cm)
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-600">
                    <tr>
                      <th className="py-2 px-3">Mistar Manual</th>
                      <th className="py-2 px-3">Hasil IoT</th>
                      <th className="py-2 px-3">Selisih</th>
                      <th className="py-2 px-3">Error (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {calibrationHeightData.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3">{d.manualCm.toFixed(1)} cm</td>
                        <td className="py-1.5 px-3 text-sky-700">{d.sensorCm.toFixed(1)} cm</td>
                        <td className="py-1.5 px-3 text-slate-600">±{d.errorCm.toFixed(1)} cm</td>
                        <td className="py-1.5 px-3 text-slate-800 font-bold">{d.errorPct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Database Schema */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Skema Basis Data Relasional (Entity Relationship)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Struktur tabel penyimpanan identitas siswa, log telemetri sensor, dan hasil kalkulasi Z-score
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Tabel Siswa */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400 pb-1 border-b border-slate-800 flex justify-between">
                <span>TABLE: students</span>
                <span className="text-[10px] text-slate-400">Master Siswa</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div><span className="text-yellow-400">id</span>: VARCHAR(36) PRIMARY KEY</div>
                <div><span className="text-yellow-400">nisn</span>: VARCHAR(10) UNIQUE</div>
                <div><span className="text-blue-300">name</span>: VARCHAR(100) NOT NULL</div>
                <div><span className="text-blue-300">gender</span>: ENUM('L', 'P')</div>
                <div><span className="text-blue-300">birth_date</span>: DATE NOT NULL</div>
                <div><span className="text-blue-300">class_name</span>: VARCHAR(10)</div>
                <div><span className="text-blue-300">parent_name</span>: VARCHAR(100)</div>
                <div><span className="text-purple-300">rfid_uid</span>: VARCHAR(20) UNIQUE INDEX</div>
              </div>
            </div>

            {/* Tabel Pengukuran */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-sky-400 pb-1 border-b border-slate-800 flex justify-between">
                <span>TABLE: measurement_records</span>
                <span className="text-[10px] text-slate-400">Transaksi Antropometri</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div><span className="text-yellow-400">id</span>: VARCHAR(36) PRIMARY KEY</div>
                <div><span className="text-yellow-400">student_id</span>: FK -&gt; students(id)</div>
                <div><span className="text-blue-300">date</span>: DATE NOT NULL</div>
                <div><span className="text-blue-300">weight_kg</span>: DECIMAL(5,2)</div>
                <div><span className="text-blue-300">height_cm</span>: DECIMAL(5,2)</div>
                <div><span className="text-blue-300">bmi</span>: DECIMAL(5,2)</div>
                <div><span className="text-emerald-400">zscore_hfa</span>: DECIMAL(4,2)</div>
                <div><span className="text-emerald-400">zscore_bmi</span>: DECIMAL(4,2)</div>
                <div><span className="text-pink-400">stunting_status</span>: VARCHAR(30)</div>
                <div><span className="text-slate-400">device_serial</span>: VARCHAR(50)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Firmware ESP32 */}
      {activeTab === 'firmware' && (
        <div className="bg-slate-950 text-slate-200 rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Firmware ESP32 Arduino C++ (Source Code Siap Flash)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Program mikrokontroler untuk akuisisi sensor, layar LCD 20x4, dan pengiriman HTTP POST Wi-Fi
              </p>
            </div>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'Tersalin!' : 'Salin Kode'}
            </button>
          </div>

          <div className="max-h-[480px] overflow-y-auto bg-slate-900 p-4 rounded-xl border border-slate-800/80 font-mono text-xs leading-relaxed text-slate-300">
            <pre>{esp32CodeSnippet}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
