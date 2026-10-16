import { useEffect, useState } from 'react';
import { AMBIENT_SOUNDS, useAmbientSound } from '../hooks/useAmbientSound.js';

const RING_RADIUS = 86;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const EXTRA_MINUTES = 5;

/**
 * Halaman timer mode fokus: background sesuai suara pilihan, timer bisa
 * dijeda, dan setelah selesai bisa balik ke dashboard.
 */
export default function FocusTimerScreen({ soundId, minutes, onExit }) {
  const [total, setTotal] = useState(Math.max(1, minutes) * 60);
  const [remaining, setRemaining] = useState(Math.max(1, minutes) * 60);
  const [running, setRunning] = useState(true);
  const [muted, setMuted] = useState(false);

  const sound = AMBIENT_SOUNDS.find((s) => s.id === soundId) ?? AMBIENT_SOUNDS[0];
  const hasSound = soundId !== 'none';
  const done = remaining === 0;

  // Suara ikut berhenti saat dijeda, dimute, atau sesi selesai.
  useAmbientSound(soundId, running && !muted && !done);

  useEffect(() => {
    if (!running || done) return undefined;
    const id = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running, done]);

  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  const progress = total > 0 ? remaining / total : 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - progress);

  const addTime = () => {
    setTotal((prev) => prev + EXTRA_MINUTES * 60);
    setRemaining(EXTRA_MINUTES * 60);
    setRunning(true);
  };

  const caption = done ? 'Sesi selesai' : running ? 'Berjalan' : 'Dijeda';

  return (
    <div className={`screen focus-timer ft-bg-${soundId}`}>
      <header className="ft-top">
        <button className="ft-icon-btn" onClick={onExit} aria-label="Kembali ke dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <span className="ft-sound-chip">
          <span aria-hidden="true">{sound.emoji}</span> {sound.label}
        </span>

        <button
          className="ft-icon-btn"
          onClick={() => setMuted((v) => !v)}
          disabled={!hasSound}
          aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
        >
          <span aria-hidden="true">{muted || !hasSound ? '🔇' : '🔊'}</span>
        </button>
      </header>

      <div className="ft-body">
        <div className="ft-ring">
          <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true">
            <circle
              cx="100"
              cy="100"
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(255, 255, 255, 0.22)"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r={RING_RADIUS}
              fill="none"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              transform="rotate(-90 100 100)"
              className="ft-ring-progress"
            />
          </svg>
          <div className="ft-ring-label">
            <span className="ft-time">{formatTime(remaining)}</span>
            <span className="ft-caption">{caption}</span>
          </div>
        </div>

        <p className="ft-meta">
          Sesi {minutes} menit{hasSound ? ` · ${sound.label}` : ' · tanpa suara'}
        </p>

        {done ? (
          <div className="ft-done">
            <p className="ft-done-title">Sesi fokus selesai! 🎉</p>
            <p className="ft-done-text">
              Kamu sudah duduk fokus selama {minutes} menit. Istirahat sebentar
              atau lanjut lagi?
            </p>
            <div className="ft-done-actions">
              <button className="ft-extra" onClick={addTime}>
                +{EXTRA_MINUTES} menit
              </button>
              <button className="ft-back" onClick={onExit}>
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="ft-actions">
            <button className="ft-toggle" onClick={() => setRunning((v) => !v)}>
              {running ? 'Jeda' : 'Lanjut'}
            </button>
            <button className="ft-stop" onClick={onExit}>
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
