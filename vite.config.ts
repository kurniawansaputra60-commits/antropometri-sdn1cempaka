import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, Plugin} from 'vite';
import { handleIoTSyncRequest, getLiveMeasurementLogs } from './src/server/apiHandler.ts';
import { runAnthroPlusAudit } from './src/data/anthroPlusValidationData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle POST /api/v1/anthropometry/sync
        if (req.url === '/api/v1/anthropometry/sync' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', chunk => { bodyStr += chunk; });
          req.on('end', () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const result = handleIoTSyncRequest(body, req.headers['x-forwarded-for'] as string || '127.0.0.1');
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = result.status;
              res.end(JSON.stringify(result.body));
            } catch (err: any) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'error', message: err.message }));
            }
          });
          return;
        }

        // Handle GET /api/v1/measurements/latest
        if (req.url === '/api/v1/measurements/latest' && req.method === 'GET') {
          const logs = getLiveMeasurementLogs();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'success',
            timestamp: new Date().toISOString(),
            total: logs.length,
            latest: logs[0] || null,
            logs: logs.slice(0, 20)
          }));
          return;
        }

        // Handle GET /api/v1/validate-anthroplus
        if (req.url === '/api/v1/validate-anthroplus' && req.method === 'GET') {
          const audit = runAnthroPlusAudit();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'success',
            benchmark: 'WHO Reference 2007 (AnthroPlus v3.2.2)',
            auditSummary: audit.summary,
            totalCases: audit.results.length,
            timestamp: new Date().toISOString()
          }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
