import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { breakDownTask } from './deepseek.js';
import { quickValidate } from './prompt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '16kb' }));

// Simple in-memory rate limit: max 20 request / menit / IP.
const hits = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60_000;
  const max = 20;
  const entry = hits.get(ip) ?? { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > max) {
    return res
      .status(429)
      .json({ error: 'Terlalu banyak permintaan. Tunggu sebentar, ya.' });
  }
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    model: process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-chat',
  });
});

app.post('/api/breakdown', rateLimit, async (req, res) => {
  const check = quickValidate(req.body?.task);
  if (!check.ok) {
    return res.status(400).json({ error: check.message });
  }

  try {
    const result = await breakDownTask(check.task);
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) {
      console.error('[breakdown]', err.message, err.detail ?? '');
    }
    return res.status(status).json({
      error:
        status === 401
          ? 'API key AI tidak valid. Periksa konfigurasi server.'
          : err.message || 'Terjadi kesalahan. Coba lagi, ya.',
    });
  }
});

// Serve hasil build frontend (production / Hugging Face Spaces).
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Task Breaker server jalan di http://0.0.0.0:${PORT}`);
});
