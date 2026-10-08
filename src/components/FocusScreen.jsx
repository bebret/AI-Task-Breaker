import { useEffect, useMemo, useState } from 'react';
import { BackButton } from './BackButton.jsx';
import { FoxMascot } from './FoxMascot.jsx';

const EXTRA_TIME_OPTIONS = [2, 5, 10];
const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Layar fokus: timer hitung mundur per langkah + checklist langkah selesai.
 * Timer berjalan untuk langkah aktif, dan otomatis pindah ke langkah
 * berikutnya yang belum selesai saat dicentang.
 */
export default function FocusScreen({ task, result, onBack, onRestart }) {
  const steps = useMemo(() => result?.steps ?? [], [result]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [done, setDone] = useState(() => steps.map(() => false));
  const [remaining, setRemaining] = useState(() => (steps[0]?.duration ?? 5) * 60);
  const [running, setRunning] = useState(true);
  const [dialog, setDialog] = useState(null);

  const total = steps.length;
  const completedCount = done.filter(Boolean).length;
  const allDone = total > 0 && completedCount === total;
  const currentStep = steps[currentIndex];

  // Hitung mundur satu detik selama timer berjalan.
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Waktu habis: hentikan timer lalu tanya pengguna mau tambah waktu atau tidak.
  useEffect(() => {
    if (running && remaining === 0) {
      setRunning(false);
      setDialog('timeup');
    }
  }, [running, remaining]);

  const goToStep = (index) => {
    setCurrentIndex(index);
    setRemaining((steps[index]?.duration ?? 5) * 60);
    setRunning(true);
  };

  const markDone = (index) => {
    const nextDone = done.map((value, i) => (i === index ? true : value));
    setDone(nextDone);
    setDialog(null);

    const nextIndex = nextDone.findIndex((value) => !value);
    if (nextIndex === -1) {
      setRunning(false);
      setRemaining(0);
      return;
    }
    goToStep(nextIndex);
  };

  const toggleStep = (index) => {
    if (done[index]) {
      setDone((prev) => prev.map((value, i) => (i === index ? false : value)));
      return;
    }
    markDone(index);
  };

  const addTime = (minutes) => {
    setRemaining((prev) => prev + minutes * 60);
    setDialog(null);
    setRunning(true);
  };

  if (allDone) {
    return (
      <div className="screen focus-screen">
        <header className="topbar">
          <BackButton onClick={onBack} />
          <h2 className="topbar-title">Selesai!</h2>
          <span className="topbar-spacer" />
        </header>

        <div className="focus-complete">
          <FoxMascot />
          <h3 className="focus-complete-title">Semua Langkah Beres!</h3>
          <p className="focus-complete-sub">
            {result?.encouragement || 'Kamu hebat! Tugas ini sudah kamu selesaikan.'}
          </p>
          <div className="focus-complete-stats">
            {total} langkah selesai
          </div>
        </div>

        <button className="btn-ghost" onClick={onRestart}>
          Pecah Tugas Lain
        </button>
      </div>
    );
  }

  const progress = total > 0 ? completedCount / total : 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - progress);
  const isTimeUp = remaining === 0;

  return (
    <div className="screen focus-screen">
      <header className="topbar">
        <BackButton onClick={onBack} />
        <h2 className="topbar-title">Waktunya Fokus</h2>
        <span className="topbar-spacer" />
      </header>

      <div className="focus-body">
        <p className="focus-task">{result?.title || task}</p>

        <div className="timer-card">
          <div className="timer-ring">
            <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
              <circle
                cx="66"
                cy="66"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--purple-soft)"
                strokeWidth="10"
              />
              <circle
                cx="66"
                cy="66"
                r={RING_RADIUS}
                fill="none"
                stroke={isTimeUp ? '#e08a8a' : 'var(--purple)'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 66 66)"
                className="timer-ring-progress"
              />
            </svg>
            <div className="timer-ring-label">
              <span className={`timer-time ${isTimeUp ? 'timeup' : ''}`}>
                {formatTime(remaining)}
              </span>
              <span className="timer-caption">
                {isTimeUp ? 'Waktu habis' : running ? 'Berjalan' : 'Dijeda'}
              </span>
            </div>
          </div>

          <p className="timer-step-label">
            Step {currentIndex + 1} dari {total}
          </p>
          <p className="timer-step-title">{currentStep?.title}</p>

          <div className="timer-actions">
            <button
              className="btn-primary timer-toggle"
              onClick={() => setRunning((prev) => !prev)}
              disabled={isTimeUp}
            >
              {running ? 'Jeda' : 'Lanjut'}
            </button>
            <button
              className="btn-ghost timer-add"
              onClick={() => setDialog('add')}
            >
              + Tambah Waktu
            </button>
          </div>
        </div>

        <div className="checklist-head">
          <h3 className="checklist-title">Checklist Langkah</h3>
          <span className="checklist-count">
            {completedCount}/{total}
          </span>
        </div>

        <ul className="checklist">
          {steps.map((step, i) => {
            const isDone = done[i];
            const isActive = i === currentIndex && !isDone;
            return (
              <li
                key={i}
                className={`check-item ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
              >
                <button
                  className="check-box"
                  onClick={() => toggleStep(i)}
                  aria-pressed={isDone}
                  aria-label={`Tandai step ${i + 1} ${isDone ? 'belum selesai' : 'selesai'}`}
                >
                  {isDone && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <div className="check-content">
                  <p className="check-title">
                    Step {i + 1}: {step.title}
                  </p>
                  <p className="check-duration">{step.duration} Menit</p>
                </div>
                {isActive && <span className="check-badge">Sekarang</span>}
              </li>
            );
          })}
        </ul>
      </div>

      {dialog && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            {dialog === 'timeup' ? (
              <>
                <div className="modal-icon" aria-hidden="true">⏰</div>
                <h3 className="modal-title">Waktunya Habis</h3>
                <p className="modal-text">
                  Mau tambah waktu untuk menyelesaikan step ini?
                </p>
                <div className="modal-options">
                  {EXTRA_TIME_OPTIONS.map((minutes) => (
                    <button
                      key={minutes}
                      className="chip"
                      onClick={() => addTime(minutes)}
                    >
                      +{minutes} menit
                    </button>
                  ))}
                </div>
                <button className="btn-ghost modal-cancel" onClick={() => setDialog(null)}>
                  Nanti Saja
                </button>
              </>
            ) : (
              <>
                <div className="modal-icon" aria-hidden="true">⏳</div>
                <h3 className="modal-title">Tambah Waktu</h3>
                <p className="modal-text">
                  Berapa menit tambahan yang kamu butuhkan?
                </p>
                <div className="modal-options">
                  {EXTRA_TIME_OPTIONS.map((minutes) => (
                    <button
                      key={minutes}
                      className="chip"
                      onClick={() => addTime(minutes)}
                    >
                      +{minutes} menit
                    </button>
                  ))}
                </div>
                <button className="btn-ghost modal-cancel" onClick={() => setDialog(null)}>
                  Batal
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
