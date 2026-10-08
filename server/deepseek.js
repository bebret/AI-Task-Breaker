import { SYSTEM_PROMPT, buildUserMessage } from './prompt.js';

// Mendukung OpenRouter (default) maupun DeepSeek langsung.
// Nama env lama (DEEPSEEK_*) tetap didukung agar tidak breaking.
const BASE_URL =
  process.env.AI_BASE_URL ||
  process.env.DEEPSEEK_BASE_URL ||
  'https://openrouter.ai/api/v1';
const MODEL =
  process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-chat';
const API_KEY = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY;

/**
 * Panggil API chat completions (OpenAI-compatible) dan minta output JSON.
 * @param {string} task - tugas mentah dari pengguna
 * @returns {Promise<object>} objek hasil yang sudah diparse
 */
export async function breakDownTask(task) {
  if (!API_KEY) {
    const err = new Error('AI_API_KEY belum diatur di environment.');
    err.status = 500;
    throw err;
  }

  let res;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    res = await requestCompletion(task);
    // 429 (rate limit upstream) dan 5xx biasanya sementara, jadi coba lagi
    // sebelum menyerah ke pengguna.
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt === MAX_ATTEMPTS - 1) break;
    await sleep(RETRY_DELAYS_MS[attempt] ?? 2000);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const err = new Error(
      res.status === 429
        ? 'Layanan AI sedang sibuk. Tunggu sebentar lalu coba lagi, ya.'
        : `Layanan AI mengembalikan error (${res.status}).`
    );
    err.status = res.status === 401 ? 401 : 502;
    err.detail = detail.slice(0, 500);
    throw err;
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    const err = new Error('AI tidak mengembalikan jawaban.');
    err.status = 502;
    throw err;
  }

  return normalize(parseJson(content));
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [800, 2000];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Satu percobaan request ke provider AI (dengan timeout sendiri). */
async function requestCompletion(task) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    return await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        // Header opsional yang direkomendasikan OpenRouter untuk atribusi.
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:7860',
        'X-Title': 'AI Task Breaker',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserMessage(task) },
        ],
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') {
      const err = new Error('AI terlalu lama merespons. Coba lagi, ya.');
      err.status = 504;
      throw err;
    }
    const err = new Error('Gagal menghubungi layanan AI.');
    err.status = 502;
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * DeepSeek kadang membungkus JSON dalam code fence. Bersihkan dulu.
 */
function parseJson(content) {
  let text = content.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fallthrough */
      }
    }
    const err = new Error('Format jawaban AI tidak valid.');
    err.status = 502;
    throw err;
  }
}

/**
 * Pastikan bentuk data konsisten sebelum dikirim ke frontend.
 */
function normalize(obj) {
  if (obj && obj.allowed === false) {
    return {
      allowed: false,
      reason:
        obj.reason ||
        'Aku cuma bisa bantu memecah tugas jadi langkah kecil. Coba tulis tugasmu, ya.',
    };
  }

  const steps = Array.isArray(obj?.steps) ? obj.steps : [];
  const cleanSteps = steps
    .map((s) => ({
      title: String(s?.title ?? '').trim(),
      duration: clampDuration(s?.duration),
    }))
    .filter((s) => s.title.length > 0)
    .slice(0, 8);

  if (cleanSteps.length === 0) {
    return {
      allowed: false,
      reason:
        'Aku belum bisa memecah itu jadi langkah tugas. Coba tulis tugas yang lebih konkret, ya.',
    };
  }

  return {
    allowed: true,
    title: String(obj?.title ?? 'Rencana Tugas').trim().slice(0, 80),
    steps: cleanSteps,
    encouragement:
      String(obj?.encouragement ?? 'Kamu hebat! Satu langkah kecil dulu, ya.').trim(),
  };
}

function clampDuration(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n <= 0) return 5;
  return Math.min(15, Math.max(2, n));
}
