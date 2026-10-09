import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const distPath = path.resolve(__dirname, 'dist');

// Serve static assets from built Vite bundle
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback to index.html
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
