import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Wifi, 
  CreditCard, 
  Scale, 
  Ruler, 
  Send, 
  RotateCcw, 
  Terminal, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Zap,
  Activity,
  Sliders
} from 'lucide-react';
import { Student, MeasurementRecord } from '../types';
import { computeZScoreHFA, computeZScoreBMI, classifyStunting, classifyNutrition, calculateAgeInMonths } from '../data/whoReference';

interface IoTSimulatorProps {
  students: Student[];
  onSyncMeasurement: (record: MeasurementRecord, studentId: string) => void;
}

export function IoTSimulator({ students, onSyncMeasurement }: IoTSimulatorProps) {
  // Device state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [weight, setWeight] = useState<number>(36.2);
  const [height, setHeight] = useState<number>(142.8);
  const [isTare, setIsTare] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [autoSync, setAutoSync] = useState<boolean>(true);

  // Serial logs
  const [logs, setLogs] = useState<string[]>([
    '[BOOT] ESP32-WROOM-32 booting firmware v2.4-SDN1C...',
    '[INIT] Sensor HX711 Load Cell 24-bit initialized on GPIO 4 & 5',
    '[INIT] Sensor Laser ToF VL53L0X / HC-SR04 I2C bus initialized (0x29)',
    '[INIT] RFID MFRC522 SPI initialized (SDA:21, SCK:18, MOSI:23, MISO:19)',
    '[WIFI] Connecting to SSID "SDN1_CEMPAKA_AP"...',
    '[WIFI] Connected! IP: 192.168.1.145 RSSI: -54 dBm',
    '[READY] Sistem Antropometri IoT SDN 1 Cempaka SIAP DIGUNAKAN.'
  ]);

  const currentStudent = students.find(s => s.id === selectedStudentId);

  // When student changes, adjust default realistic sliders
  useEffect(() => {
    if (currentStudent && currentStudent.measurements.length > 0) {
      const lastMeas = currentStudent.measurements[currentStudent.measurements.length - 1];
      setWeight(lastMeas.weightKg);
      setHeight(lastMeas.heightCm);

      addLog(`[RFID] Card Scanned! UID: ${currentStudent.rfidUid}`);
      addLog(`[STUDENT] Identified: ${currentStudent.name} (${currentStudent.className}) NISN: ${currentStudent.nisn}`);
    }
  }, [selectedStudentId]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID');
    setLogs(prev => [...prev.slice(-30), `[${timestamp}] ${message}`]);
  };

  const handleTare = () => {
    setIsTare(true);
    addLog('[HX711] Tare command issued. Zero-point calibration offset reset to 0.00 kg');
    setTimeout(() => {
      setIsTare(false);
      addLog('[HX711] Tare complete. Timbangan siap.');
    }, 600);
  };

  const handleSimulateSync = () => {
    if (!currentStudent) return;
    setIsSending(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const ageMonths = calculateAgeInMonths(currentStudent.birthDate, todayStr);
    const heightM = height / 100;
    const bmi = Number((weight / (heightM * heightM)).toFixed(2));
    const zScoreHFA = computeZScoreHFA(heightCm, ageMonths, currentStudent.gender);
    const zScoreBMI = computeZScoreBMI(bmi, ageMonths, currentStudent.gender);
    const stuntingStatus = classifyStunting(zScoreHFA);
    const nutritionStatus = classifyNutrition(zScoreBMI);

    const record: MeasurementRecord = {
      id: `m-iot-${Date.now()}`,
      studentId: currentStudent.id,
      date: todayStr,
      ageMonths,
      weightKg: Number(weight.toFixed(1)),
      heightCm: Number(height.toFixed(1)),
      bmi,
      zScoreHFA,
      zScoreBMI,
      stuntingStatus,
      nutritionStatus,
      source: 'IoT-Device',
      deviceSerial: 'ESP32-ANTRO-SDN1C-01',
      measuredBy: 'Alat Antropometri IoT UKS',
      notes: `Pengukuran digital otomatis via RFID ${currentStudent.rfidUid}`
    };

    addLog(`[SENSOR] Akuisisi data: BB=${weight} kg, TB=${height} cm, IMT=${bmi}`);
    addLog(`[HTTP] Mengirim POST /api/v1/anthropometry/sync ...`);

    setTimeout(() => {
      onSyncMeasurement(record, currentStudent.id);
      setIsSending(false);
      setSendSuccess(true);
      addLog(`[SERVER] HTTP 200 OK! Data berhasil disimpan ke database sekolah.`);
      addLog(`[WHO ENGINE] Z-Score TB/U: ${zScoreHFA} (${stuntingStatus}), IMT/U: ${zScoreBMI} (${nutritionStatus})`);
      addLog(`[DASHBOARD] Real-time sinkronisasi tersiar ke layar UKS & Portal Orang Tua.`);

      setTimeout(() => {
        setSendSuccess(false);
      }, 4000);
    }, 850);
  };

  const heightCm = height;
  const bmiVal = Number((weight / ((height / 100) * (height / 100))).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full mb-2 border border-sky-200">
              <Zap className="w-3.5 h-3.5" />
              Simulator Hardware Antropometri IoT UKS
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Stadiometer &amp; Timbangan Digital IoT ESP32
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Simulator interaktif unit alat ukur antropometri digital SDN 1 Cempaka. Menguji alur pembacaan RFID, sensor load cell HX711, sensor jarak ToF, dan pengiriman nirkabel ke web dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-800">
              ESP32 ONLINE (192.168.1.145)
            </span>
          </div>
        </div>
      </div>

      {/* Hardware Panel & Serial Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Physical Device Unit Mockup (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Fisik Perangkat: Stadiometer IoT SDN 1 Cempaka
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wi-Fi UKS OK</span>
            </div>
          </div>

          {/* OLED / LCD Display Screen 20x4 Mockup */}
          <div className="bg-emerald-950/80 p-4 rounded-xl border-2 border-emerald-500/80 font-mono text-emerald-400 shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-emerald-400/80 pb-1 mb-2 border-b border-emerald-800/60">
              <span>LCD 20x4 I2C DISPLAY (0x27)</span>
              <span>● LIVE READING</span>
            </div>
            <div className="space-y-1 text-xs sm:text-sm font-bold tracking-wider leading-relaxed">
              <div className="text-emerald-300">
                SDN 1 CEMPAKA - UKS IoT
              </div>
              <div className="truncate">
                SISWA: {currentStudent ? `${currentStudent.name} (${currentStudent.className})` : 'MENUNGGU KARTU...'}
              </div>
              <div className="flex justify-between">
                <span>BB: {weight.toFixed(1)} kg</span>
                <span>TB: {height.toFixed(1)} cm</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 text-emerald-300">
                <span>IMT: {bmiVal}</span>
                <span>STATUS: {isSending ? 'SENDING...' : sendSuccess ? 'TERKIRIM OK!' : 'SIAP SYNC'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Controls & Sensors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sensor 1: Load Cell Berat */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  Load Cell 4x50kg + HX711
                </span>
                <button
                  onClick={handleTare}
                  disabled={isTare}
                  className="px-2 py-0.5 text-[10px] bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  {isTare ? 'Taring...' : 'Tare (0.0)'}
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Berat Badan:</span>
                  <span className="font-mono text-emerald-400 font-bold">{weight.toFixed(1)} kg</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="70"
                  step="0.1"
                  value={weight}
                  onChange={(e) => {
                    setWeight(parseFloat(e.target.value));
                    addLog(`[HX711] Dynamic weight read: ${parseFloat(e.target.value).toFixed(1)} kg`);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>15.0 kg</span>
                  <span>70.0 kg</span>
                </div>
              </div>
            </div>

            {/* Sensor 2: ToF / Ultrasonik Tinggi */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-sky-400" />
                  Sensor Laser ToF VL53L0X
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Top: 200 cm</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Tinggi Badan:</span>
                  <span className="font-mono text-sky-400 font-bold">{height.toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="175"
                  step="0.1"
                  value={height}
                  onChange={(e) => {
                    setHeight(parseFloat(e.target.value));
                    addLog(`[VL53L0X] Stadiometer distance read: ${(200 - parseFloat(e.target.value)).toFixed(1)}cm -> Height: ${parseFloat(e.target.value).toFixed(1)} cm`);
                  }}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>90.0 cm</span>
                  <span>175.0 cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* RFID Scanner Module */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-purple-400" />
                Modul RFID RC522 (Pindai Kartu Siswa)
              </span>
              <span className="text-[10px] font-mono text-purple-300">
                UID: {currentStudent?.rfidUid || '-'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {students.map(std => (
                <button
                  key={std.id}
                  onClick={() => setSelectedStudentId(std.id)}
                  className={`p-2 rounded-lg text-left text-xs transition-all border ${
                    selectedStudentId === std.id
                      ? 'bg-purple-900/60 border-purple-400 text-purple-100 shadow-xs'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  <div className="font-bold truncate">{std.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                    <span>Kelas {std.className}</span>
                    <span className="font-mono">{std.gender === 'L' ? 'Lk' : 'Pr'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Sync Button */}
          <div className="pt-2">
            <button
              onClick={handleSimulateSync}
              disabled={isSending}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isSending
                  ? 'bg-slate-700 text-slate-400 cursor-wait'
                  : sendSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Mentransmisikan data ke Server SDN 1 Cempaka...</span>
                </>
              ) : sendSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Berhasil Tersinkronisasi ke Dashboard Sekolah!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>KIRIM PENGUKURAN KE DASHBOARD (SINKRONISASI REAL-TIME)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Live Serial Monitor Terminal (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-300">ESP32 Serial Monitor (115200 Baud)</span>
              </div>
              <button
                onClick={() => setLogs(['[RESET] Terminal cleared. Waiting for serial events...'])}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear Log
              </button>
            </div>

            {/* Terminal Window */}
            <div className="h-[380px] overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px] leading-relaxed">
              {logs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`py-0.5 ${
                    log.includes('ERROR') 
                      ? 'text-rose-400' 
                      : log.includes('200 OK') || log.includes('Berhasil')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('WHO')
                      ? 'text-amber-300'
                      : log.includes('RFID')
                      ? 'text-purple-300'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              WebSocket / REST Endpoint Connected
            </span>
            <span>UKS SDN 1 Cempaka</span>
          </div>
        </div>
      </div>
    </div>
  );
}
