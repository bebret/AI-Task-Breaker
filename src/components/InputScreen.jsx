import { useEffect, useState } from 'react';
import { BackButton } from './BackButton.jsx';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

/** Baca body sebagai JSON tanpa melempar error saat body kosong/bukan JSON. */
async function readJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function InputScreen({ initialTask, autoListen, onBack, onResult }) {
  const [task, setTask] = useState(initialTask || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { supported, listening, start } = useSpeechRecognition({
    lang: 'id-ID',
    onResult: (said) => {
      if (said) setTask((prev) => (prev ? `${prev} ${said}` : said));
    },
  });

  // Jika pengguna menekan tombol mic di layar sambutan, langsung mulai dengar.
  useEffect(() => {
    if (autoListen && supported) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoListen, supported]);

  const submit = async () => {
    const value = task.trim();
    if (!value) {
      setError('Tulis dulu tugasmu, ya.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: value }),
      });
      // Respons bisa kosong / bukan JSON (mis. proxy gagal), jadi jangan
      // langsung res.json() — itu memicu "Unexpected end of JSON input".
      const data = await readJson(res);
      if (!res.ok) {
        throw new Error(data?.error || 'Gagal memproses tugas.');
      }
      if (!data) {
        throw new Error('Server tidak mengirim data. Coba lagi, ya.');
      }
      onResult(data, value);
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan. Coba lagi, ya.');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      submit();
    }
  };

  return (
    <div className="screen input-screen">
      <header className="topbar">
        <BackButton onClick={onBack} />
        <h2 className="topbar-title">AI Task Breaker</h2>
        <span className="topbar-spacer" />
      </header>

      <div className="chat-area">
        {task.trim() && (
          <div className="bubble-user">{task.trim()}</div>
        )}
        {loading && (
          <div className="bubble-ai">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}
        {error && <div className="error-text">{error}</div>}
      </div>

      <div className="composer">
        <textarea
          className="composer-input"
          placeholder="Ceritakan tugasmu disini"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          maxLength={1000}
          disabled={loading}
        />
        <div className="composer-actions">
          {supported && (
            <button
              type="button"
              className={`mic-inline ${listening ? 'listening' : ''}`}
              onClick={start}
              disabled={loading || listening}
              aria-label="Input suara"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
                <path
                  d="M5 11a7 7 0 0 0 14 0M12 18v3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>{listening ? 'Mendengarkan...' : 'Bicara'}</span>
            </button>
          )}
          <button
            className="send-btn"
            onClick={submit}
            disabled={loading || !task.trim()}
            aria-label="Kirim"
          >
            {loading ? '...' : 'Kirim'}
          </button>
        </div>
      </div>
    </div>
  );
}
