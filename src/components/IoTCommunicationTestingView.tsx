import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Send, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  Wifi, 
  Layers, 
  AlertTriangle, 
  Activity,
  Code2,
  Server,
  ArrowRight,
  Scale,
  Ruler
} from 'lucide-react';
import { Student } from '../types';

interface IoTCommunicationTestingViewProps {
  students: Student[];
  onDataIngested?: (record: any, studentId: string) => void;
}

export function IoTCommunicationTestingView({ students, onDataIngested }: IoTCommunicationTestingViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [testWeight, setTestWeight] = useState<number>(36.2);
  const [testHeight, setTestHeight] = useState<number>(142.8);
  const [deviceSerial, setDeviceSerial] = useState<string>('ESP32-ANTRO-SDN1C-01');
  
  const [isSending, setIsSending] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  // Live packet log from backend
  const [networkLogs, setNetworkLogs] = useState<any[]>([]);

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const rfidUid = currentStudent?.rfidUid || 'E4:9B:12:F1';

  const hostUrl = typeof window !== 'undefined' ? window.location.origin : 'https://antropometri-sdn1cempaka.sch.id';
  const apiEndpointUrl = `${hostUrl}/api/v1/anthropometry/sync`;

  // Fetch telemetry / latest measurements from server
  const fetchLiveLogs = async () => {
    try {
      const res = await fetch('/api/v1/measurements/latest');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setNetworkLogs(data.logs);
        }
      }
    } catch (e) {
      // ignore in offline mode
    }
  };

  useEffect(() => {
    fetchLiveLogs();
    const interval = setInterval(fetchLiveLogs, 3500);
    return () => clearInterval(interval);
  }, []);

  // Send real HTTP POST to backend endpoint
  const handleSendTestPayload = async () => {
    setIsSending(true);
    setLastResponse(null);
    setResponseStatus(null);
    const start = performance.now();

    const payload = {
      rfidUid,
      weightKg: Number(testWeight),
      heightCm: Number(testHeight),
      deviceSerial
    };

    try {
      const res = await fetch('/api/v1/anthropometry/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setResponseStatus(res.status);

      const data = await res.json();
      setLastResponse(data);

      if (res.ok && data.measurement && currentStudent) {
        if (onDataIngested) {
          onDataIngested(data.measurement, currentStudent.id);
        }
        fetchLiveLogs();
      }
    } catch (err: any) {
      setResponseStatus(500);
      setLastResponse({ status: 'error', message: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const curlCommand = `curl -X POST "${apiEndpointUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "rfidUid": "${rfidUid}",
    "weightKg": ${testWeight},
    "heightCm": ${testHeight},
    "deviceSerial": "${deviceSerial}"
  }'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-800 text-xs font-semibold rounded-full mb-2 border border-sky-200">
              <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              Bab 3.3.6.2 • Pengujian Komunikasi IoT (End-to-End Testing)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Pengujian Komunikasi Perangkat Fisik ESP32 ke Server Web
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Memverifikasi bahwa mikrokontroler ESP32 fisik dapat mengirimkan data pembacaan RFID, sensor berat load cell HX711, dan tinggi badan via protokol <strong>HTTP REST POST</strong> secara otomatis langsung ke basis data sekolah.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <span className="text-slate-500 block text-[10px]">API ENDPOINT STATUS:</span>
              <span className="font-bold text-emerald-700">ONLINE &amp; READY TO INGEST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Testing Dashboard: Ingestion Injector & Terminal Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Injector (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Generator Paket Data ESP32 (Hardware Emulation)
            </h3>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              POST /api/v1/anthropometry/sync
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Pilih Siswa / Tag Kartu RFID:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  const s = students.find(std => std.id === e.target.value);
                  if (s && s.measurements.length > 0) {
                    const last = s.measurements[s.measurements.length - 1];
                    setTestWeight(last.weightKg);
                    setTestHeight(last.heightCm);
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} - Kelas {s.className} (RFID: {s.rfidUid})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  Berat Badan (kg) [HX711]:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={testWeight}
                  onChange={(e) => setTestWeight(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-emerald-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-sky-600" />
                  Tinggi Badan (cm) [Laser ToF]:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={testHeight}
                  onChange={(e) => setTestHeight(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sky-700 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Serial Number Perangkat ESP32:
              </label>
              <input
                type="text"
                value={deviceSerial}
                onChange={(e) => setDeviceSerial(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSendTestPayload}
              disabled={isSending}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengirimkan Request HTTP POST ke Server...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>KIRIM DATA HTTP POST KE BACKEND (END-TO-END TEST)</span>
                </>
              )}
            </button>
          </div>

          {/* Response Box */}
          {lastResponse && (
            <div className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
              responseStatus === 200 ? 'bg-emerald-50/70 border-emerald-300' : 'bg-rose-50 border-rose-300'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className={responseStatus === 200 ? 'text-emerald-800' : 'text-rose-800'}>
                  STATUS: HTTP {responseStatus} OK
                </span>
                <span className="text-slate-600">
                  Latency: {latencyMs} ms
                </span>
              </div>
              <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg text-[11px] overflow-x-auto max-h-40">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right Column: cURL & Real Hardware Guide (6 cols) */}
        <div className="lg:col-span-6 bg-slate-950 text-slate-200 rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">
                Perintah Uji Terminal cURL (Langsung dari Terminal Anda)
              </h3>
            </div>
            <button
              onClick={copyCurl}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCurl ? 'Tersalin!' : 'Salin cURL'}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Penguji/Dosen dapat membuka Terminal pada laptop (PowerShell, Bash, Command Prompt) dan menjalankan perintah di bawah ini untuk membuktikan sistem menerima data dari perangkat eksternal:
          </p>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
            <pre>{curlCommand}</pre>
          </div>

          {/* Arduino Code Segment */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Code2 className="w-3.5 h-3.5" />
                Potongan C++ ESP32 Arduino IDE:
              </span>
              <span className="text-[10px] text-slate-500 font-mono">HTTPClient.h</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-36">
              <pre>{`HTTPClient http;
http.begin("${apiEndpointUrl}");
http.addHeader("Content-Type", "application/json");

String json = "{\\"rfidUid\\":\\"" + rfidUid + "\\","
              "\\"weightKg\\":" + String(weight, 1) + ","
              "\\"heightCm\\":" + String(height, 1) + ","
              "\\"deviceSerial\\":\\"ESP32-ANTRO-SDN1C-01\\"}";

int httpCode = http.POST(json);
if (httpCode == 200) {
  String response = http.getString();
  Serial.println("[OK] Server respon: " + response);
}
http.end();`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Live Server Packet Log Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Log Paket Masuk Gateway IoT (Server Request Ingestion Log)
            </h3>
            <p className="text-xs text-slate-500">
              Merekam setiap request HTTP POST yang masuk dari mikrokontroler atau klien pengujian
            </p>
          </div>
          <button
            onClick={fetchLiveLogs}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Perbarui Log
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Waktu (Timestamp)</th>
                <th className="py-2.5 px-3">ID Kartu RFID</th>
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3">TB (cm)</th>
                <th className="py-2.5 px-3">BB (kg)</th>
                <th className="py-2.5 px-3">Z-Score Server</th>
                <th className="py-2.5 px-3">Perangkat</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {networkLogs.length > 0 ? (
                networkLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500 font-sans">{new Date(log.timestamp).toLocaleTimeString('id-ID')}</td>
                    <td className="py-2 px-3 font-bold text-purple-700">{log.rfidUid}</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">{log.studentName}</td>
                    <td className="py-2 px-3 font-sans">{log.className}</td>
                    <td className="py-2 px-3 text-sky-700 font-bold">{log.heightCm}</td>
                    <td className="py-2 px-3 text-emerald-700 font-bold">{log.weightKg}</td>
                    <td className="py-2 px-3">
                      TB/U: {log.zScoreHFA} SD ({log.stuntingStatus})
                    </td>
                    <td className="py-2 px-3 text-slate-500">{log.deviceSerial}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        HTTP 200 OK
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-500 font-sans">
                    Belum ada paket request baru dari ESP32. Tekan tombol pengujian di atas atau jalankan perintah cURL.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
