import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { handleIoTSyncRequest, getLiveStudents, getLiveMeasurementLogs } from './src/server/apiHandler.ts';
import { runAnthroPlusAudit } from './src/data/anthroPlusValidationData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// In AI Studio / Cloud Run, Nginx binds to process.env.PORT (8080) and reverse-proxies
// all requests to localhost:3000 (DEFAULT_APP_PORT).
// The Node backend must bind to port 3000 to avoid EADDRINUSE conflict on port 8080.
const PORT = Number(
  process.env.DEFAULT_APP_PORT ||
  (process.env.PORT && process.env.PORT !== '8080' ? process.env.PORT : 3000)
);

app.use(express.json());

// Enable CORS for external IoT devices & cross-origin test clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
// 1. END-TO-END IoT GATEWAY REST ENDPOINTS
// ==========================================

// Endpoint for physical ESP32 or HTTP client
app.post('/api/v1/anthropometry/sync', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const result = handleIoTSyncRequest(req.body, String(clientIp));
  return res.status(result.status).json(result.body);
});

// Endpoint to fetch latest measurements for real-time frontend syncing
app.get('/api/v1/measurements/latest', (_req, res) => {
  const logs = getLiveMeasurementLogs();
  return res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    total: logs.length,
    latest: logs[0] || null,
    logs: logs.slice(0, 20)
  });
});

// Telemetry status
app.get('/api/v1/iot/telemetry', (_req, res) => {
  const logs = getLiveMeasurementLogs();
  return res.json({
    status: 'online',
    device: 'ESP32-ANTRO-SDN1C-01',
    serverTime: new Date().toISOString(),
    totalPacketsReceived: logs.length,
    lastIngestion: logs[0]?.timestamp || null,
    supportedEndpoints: [
      'POST /api/v1/anthropometry/sync',
      'GET /api/v1/measurements/latest',
      'GET /api/v1/iot/telemetry',
      'POST /api/v1/validate-anthroplus'
    ]
  });
});

// ==========================================
// 2. COMPUTATION VALIDATION ENDPOINT
// ==========================================
app.get('/api/v1/validate-anthroplus', (_req, res) => {
  const audit = runAnthroPlusAudit();
  return res.json({
    status: 'success',
    benchmark: 'WHO Reference 2007 (AnthroPlus v3.2.2)',
    auditSummary: audit.summary,
    totalCases: audit.results.length,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 3. RBAC AUTHENTICATION ENDPOINT
// ==========================================
app.post('/api/v1/auth/login', (req, res) => {
  const { role, pin, nisn, birthDate } = req.body || {};

  if (role === 'TEACHER_UKS') {
    // Default PIN: 1234
    if (pin === '1234' || pin === 'uks123') {
      return res.json({
        success: true,
        session: {
          role: 'TEACHER_UKS',
          name: 'Siti Rohmah, S.Pd',
          identifier: '19850412 201001 2 021',
          loginTime: new Date().toISOString()
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'PIN Petugas UKS tidak sesuai. Gunakan PIN: 1234' });
    }
  }

  if (role === 'AUDITOR') {
    return res.json({
      success: true,
      session: {
        role: 'AUDITOR',
        name: 'Dosen Pembimbing / Auditor Penelitian',
        identifier: 'AUDIT-RESEARCH-2026',
        loginTime: new Date().toISOString()
      }
    });
  }

  if (role === 'PARENT') {
    const students = getLiveStudents();
    const student = students.find(s => s.nisn === String(nisn).trim());
    if (student) {
      return res.json({
        success: true,
        session: {
          role: 'PARENT',
          name: student.parentName,
          identifier: student.nisn,
          verifiedChildId: student.id,
          loginTime: new Date().toISOString()
        }
      });
    } else {
      return res.status(404).json({ success: false, message: 'NISN siswa tidak terdaftar di database UKS.' });
    }
  }

  return res.status(400).json({ success: false, message: 'Invalid role request' });
});

// ==========================================
// 4. STATIC FRONTEND SPA SERVING
// ==========================================
const distPath = path.resolve(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res.status(200).send('Aplikasi Antropometri IoT SDN 1 Cempaka sedang berjalan.');
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[SERVER] Antropometri IoT Server running on http://0.0.0.0:${PORT}`);
});
