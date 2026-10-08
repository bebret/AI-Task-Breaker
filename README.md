---
title: AI Task Breaker
emoji: 🦊
colorFrom: purple
colorTo: pink
sdk: docker
app_port: 7860
pinned: false
---

# 🦊 AI Task Breaker

> Pecah tugas besar jadi langkah mikro yang gampang dimulai.

Aplikasi web untuk membantu pengguna yang mengalami **task paralysis** — merasa
kewalahan saat melihat tugas besar. Pengguna menulis tugas mentah dengan bahasa
sehari-hari, lalu AI memecahnya menjadi **micro-steps** berdurasi singkat
(2–15 menit) yang terasa jauh lebih ringan untuk dimulai.

---

## ✨ Fitur

- **3 layar sesuai desain**: Welcome → Input → Hasil.
- **Pemecahan tugas otomatis** memakai **DeepSeek** (`deepseek-chat`).
- **Guardrails**: AI hanya boleh memecah tugas. Permintaan di luar cakupan
  (pertanyaan umum, curhat, minta kode, konten berbahaya, upaya ganti peran)
  akan **ditolak dengan sopan** dan diarahkan kembali.
- **Input suara** (Web Speech API, bahasa Indonesia) — opsional, hanya di
  Chrome/Edge.
- **Rate limiting** sederhana (20 request/menit/IP) untuk melindungi API key.
- **API key aman** — hanya ada di server, tidak pernah dikirim ke browser.

---

## 🧱 Tech Stack

| Bagian   | Teknologi                          |
| -------- | ---------------------------------- |
| Frontend | React 18 + Vite                    |
| Backend  | Node.js + Express (ESM)            |
| AI       | OpenRouter / DeepSeek / GLM (OpenAI-compatible) |
| Deploy   | Docker → Hugging Face Spaces (free)|

---

## 🔑 Konfigurasi AI Provider

Aplikasi ini memakai API yang **OpenAI-compatible**, jadi kamu bebas pilih
provider. Cukup atur 3 variabel di `.env`:

| Variabel      | Keterangan                          |
| ------------- | ----------------------------------- |
| `AI_API_KEY`  | API key provider                    |
| `AI_MODEL`    | Nama model                          |
| `AI_BASE_URL` | Base URL (harus diakhiri `/v1` untuk OpenRouter) |

### Opsi A — OpenRouter (disarankan, bisa akses banyak model)
```env
AI_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
AI_MODEL=deepseek/deepseek-chat
AI_BASE_URL=https://openrouter.ai/api/v1
```
Daftar model: <https://openrouter.ai/models> — mis. `deepseek/deepseek-chat`,
`z-ai/glm-4.5`, `google/gemini-flash-1.5`.

### Opsi B — DeepSeek langsung
```env
AI_API_KEY=sk-xxxxxxxxxxxxxxxx
AI_MODEL=deepseek-chat
AI_BASE_URL=https://api.deepseek.com
```

### Opsi C — GLM (Zhipu)
```env
AI_API_KEY=xxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx
AI_MODEL=glm-4-plus
AI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

> Nama env lama (`DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `DEEPSEEK_BASE_URL`)
> tetap didukung agar tidak breaking.

---

## 🚀 Menjalankan Secara Lokal

### 1. Prasyarat
- Node.js 20+
- API key dari provider pilihanmu (lihat bagian di atas)

### 2. Setup
```bash
cd ai-task-breaker
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

Buka `.env` dan isi `AI_API_KEY` (dan sesuaikan `AI_MODEL` / `AI_BASE_URL`
sesuai provider).

### 3. Mode development (hot reload)
```bash
npm run dev
```
- Frontend: <http://localhost:5173>
- Backend: <http://localhost:7860> (port mengikuti `PORT` di `.env`; Vite otomatis proxy `/api`)

### 4. Mode production (uji lokal)
```bash
npm run build
npm start
```
Buka <http://localhost:7860>.

---

## 🤗 Deploy ke Hugging Face Spaces (Gratis)

Hugging Face Spaces mendukung **Docker Spaces** secara gratis, jadi React +
Express bisa jalan dalam satu container.

### Langkah-langkah

1. **Buat akun** di <https://huggingface.co> (gratis).

2. **Buat Space baru**:
   - Buka <https://huggingface.co/new-space>
   - **Space name**: `ai-task-breaker`
   - **SDK**: pilih **Docker**
   - **Docker template**: pilih **Blank**
   - **Visibility**: Public atau Private
   - Klik **Create Space**

3. **Upload kode** ke Space. Pilih salah satu cara:

   **Cara A — lewat Git (disarankan):**
   ```bash
   cd ai-task-breaker
   git init
   git add .
   git commit -m "Initial commit"
   git remote add space https://huggingface.co/spaces/<USERNAME>/ai-task-breaker
   git push space main
   ```
   Saat diminta login, gunakan **username** HF dan **Access Token**
   (buat di <https://huggingface.co/settings/tokens>, role *write*).

   **Cara B — lewat web:** buka tab **Files** di Space → **Add file** →
   upload semua file (kecuali `node_modules` dan `dist`).

4. **Set API key sebagai Secret** (JANGAN taruh di kode!):
   - Buka Space → **Settings** → **Variables and secrets**
   - Klik **New secret**
   - Name: `AI_API_KEY`
   - Value: `sk-or-v1-xxxxxxxxxxxxxxxx`
   - Simpan.

   Opsional (kalau mau ganti model/provider):
   - `AI_MODEL` = `deepseek/deepseek-chat`
   - `AI_BASE_URL` = `https://openrouter.ai/api/v1`

5. **Tunggu build** selesai (beberapa menit). Space akan otomatis
   membangun Docker image dan menjalankan server di port `7860`.

6. **Selesai!** Aplikasi bisa diakses di:
   ```
   https://huggingface.co/spaces/<USERNAME>/ai-task-breaker
   ```

> 💡 **Catatan**: Space gratis akan "sleep" setelah tidak dipakai. Kunjungan
> pertama setelah sleep butuh beberapa detik untuk bangun.

---

## 📁 Struktur Proyek

```
ai-task-breaker/
├── server/
│   ├── index.js        # Express: /api/health, /api/breakdown, serve dist/
│   ├── deepseek.js     # Panggilan DeepSeek + parsing & normalisasi JSON
│   └── prompt.js       # System prompt (guardrails) + validasi input
├── src/
│   ├── App.jsx         # State machine 3 layar
│   ├── main.jsx
│   ├── styles.css
│   ├── hooks/
│   │   └── useSpeechRecognition.js
│   └── components/
│       ├── WelcomeScreen.jsx
│       ├── InputScreen.jsx
│       ├── ResultScreen.jsx
│       └── BackButton.jsx
├── Dockerfile          # Multi-stage build (Vite build → runtime Node)
├── vite.config.js
├── package.json
└── .env.example
```

---

## 🔌 API

### `GET /api/health`
```json
{ "ok": true, "model": "deepseek/deepseek-chat" }
```

### `POST /api/breakdown`
**Request**
```json
{ "task": "saya ingin pindah negara bagaimana caranya ?" }
```

**Response (berhasil)**
```json
{
  "allowed": true,
  "title": "Persiapan Pindah Negara",
  "steps": [
    { "title": "Cari tahu syarat visa negara tujuan", "duration": 10 },
    { "title": "Buat daftar dokumen yang dibutuhkan", "duration": 5 }
  ],
  "encouragement": "Kamu hebat! Satu langkah kecil dulu, ya."
}
```

**Response (ditolak / di luar cakupan)**
```json
{
  "allowed": false,
  "reason": "Aku cuma bisa bantu memecah tugas jadi langkah kecil. Coba tulis tugasmu, ya."
}
```

**Response (error)**
```json
{ "error": "Pesan error yang ramah pengguna" }
```

---

## 🛡️ Guardrails (Batasan AI)

Batasan diterapkan di **dua lapis**:

1. **System prompt** (`server/prompt.js`) — instruksi tegas bahwa AI hanya
   boleh memecah tugas, plus format JSON wajib dengan flag `allowed`.
2. **Validasi server** (`server/deepseek.js`) — hasil AI dinormalisasi:
   jumlah langkah dibatasi 3–8, durasi dikunci 2–15 menit, dan jika tidak ada
   langkah valid maka diubah menjadi penolakan.

Ditambah **validasi input** (`quickValidate`) dan **rate limiting** di
`server/index.js`.

---

## 🧪 Tips Pengembangan

- Ganti model/provider: ubah `AI_MODEL` dan `AI_BASE_URL` di `.env`.
- Ubah gaya bahasa AI: edit `SYSTEM_PROMPT` di `server/prompt.js`.
- Ubah warna tema: edit variabel CSS di bagian `:root` pada `src/styles.css`.

---

## 📄 Lisensi

MIT — bebas dipakai dan dimodifikasi.
"# AI-Task-Breaker" 
