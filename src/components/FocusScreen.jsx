import { useEffect, useMemo, useState } from 'react';
import { BackButton } from './BackButton.jsx';
import { FoxMascot } from './FoxMascot.jsx';
import { postJson } from '../api.js';

const EXTRA_TIME_OPTIONS = [2, 5, 10];
const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Layar fokus: timer hitung mundur per langkah + checklist langkah selesai.
 * Langkah aktif bisa langsung dipecah jadi sub-langkah (tanpa pindah layar),
 * dan sub-langkahnya punya checkbox sendiri. Semua sub-langkah selesai ->
 * langkah induk otomatis selesai dan lanjut ke langkah berikutnya.
 */
export default function FocusScreen({ task, result, onBack, onRestart, focusState, onFocusStateChange, onSubSteps }) {
  const steps = useMemo(() => result?.steps ?? [], [result]);

  // State timer/checklist disimpan di App (focusState) supaya tidak hilang
  // saat pengguna bolak-balik ke layar hasil.
  const [currentIndex, setCurrentIndex] = useState(focusState?.currentIndex ?? 0);
  const [done, setDone] = useState(() => focusState?.done ?? steps.map(() => false));
  const [remaining, setRemaining] = useState(() => focusState?.remaining ?? (steps[0]?.duration ?? 5) * 60);
  const [running, setRunning] = useState(focusState?.running ?? true);
  const [dialog, setDialog] = useState(null);

  // Sub-langkah langkah aktif: daftar + status centang + status fetch.
  const [subSteps, setSubSteps] = useState(null);
  const [subDone, setSubDone] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');

  // Kirim perubahan state ke App setiap kali berubah.
  useEffect(() => {
    onFocusStateChange?.({ currentIndex, done, remaining, running });
  }, [currentIndex, done, remaining, running, onFocusStateChange]);

  const total = steps.length;
  const completedCount = done.filter(Boolean).length;
  const allDone = total > 0 && completedCount === total;
  const currentStep = steps[currentIndex];
  const subTotal = subSteps?.length ?? 0;
  const subCompleted = subDone.filter(Boolean).length;

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
    // Reset panel sub-langkah untuk langkah baru.
    setSubSteps(null);
    setSubDone([]);
    setSubError('');
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

  /**
   * Pecah langkah aktif jadi sub-langkah langsung dari layar fokus.
   * Kalau langkah ini sudah punya sub-langkah (dipecah di layar hasil),
   * pakai yang sudah ada.
   */
  const breakCurrentStep = async () => {
    if (Array.isArray(currentStep?.subSteps) && currentStep.subSteps.length > 0) {
      setSubSteps(currentStep.subSteps);
      setSubDone(currentStep.subSteps.map(() => false));
      return;
    }
    if (subLoading) return;
    setSubLoading(true);
    setSubError('');
    try {
      const prevStep = currentIndex > 0 ? steps[currentIndex - 1]?.title : undefined;
      const data = await postJson('/api/breakdown/sub', {
        task,
        step: currentStep.title,
        prevStep,
      });
      if (data.allowed === false) {
        setSubError(data.reason || 'Langkah ini tidak bisa dipecah lebih kecil.');
      } else {
        const subs = data.subSteps ?? [];
        setSubSteps(subs);
        setSubDone(subs.map(() => false));
        onSubSteps?.(currentIndex, subs);
      }
    } catch (e) {
      setSubError(e.message || 'Gagal memecah langkah. Coba lagi, ya.');
    } finally {
      setSubLoading(false);
    }
  };

  /**
   * Centang satu sub-langkah. Kalau semua sub-langkah selesai, langkah
   * induk otomatis ditandai selesai dan lanjut ke langkah berikutnya.
   */
  const toggleSub = (j) => {
    const next = subDone.map((v, i) => (i === j ? !v : v));
    setSubDone(next);
    if (next.every(Boolean) && next.length > 0) {
      // Semua sub-langkah selesai -> selesaikan langkah induk.
      markDone(currentIndex);
    }
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
  const hasSubs = subSteps !== null && subSteps.length > 0;

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

        {/* Panel pecah langkah aktif jadi sub-langkah, langsung di sini. */}
        <div className="focus-subpanel">
          {!hasSubs && !subLoading && !subError && (
            <button type="button" className="btn-ghost focus-sub-break" onClick={breakCurrentStep}>
              🔪 Pecah Step Ini Jadi Lebih Kecil
            </button>
          )}

          {subLoading && (
            <div className="substeps-loading">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}

          {subError && (
            <div className="substeps-error">
              <p>{subError}</p>
              <button type="button" className="substeps-retry" onClick={breakCurrentStep}>
                Coba Lagi
              </button>
            </div>
          )}

          {hasSubs && !subLoading && (
            <>
              <div className="focus-sub-head">
                <span className="focus-sub-label">Sub-langkah Step {currentIndex + 1}</span>
                <span className="focus-sub-count">{subCompleted}/{subTotal}</span>
              </div>
              <ul className="focus-substeps">
                {subSteps.map((sub, j) => (
                  <li className={`focus-substep ${subDone[j] ? 'done' : ''}`} key={j}>
                    <button
                      type="button"
                      className="check-box"
                      onClick={() => toggleSub(j)}
                      aria-pressed={subDone[j]}
                      aria-label={`Tandai sub-langkah ${j + 1} ${subDone[j] ? 'belum selesai' : 'selesai'}`}
                    >
                      {subDone[j] && (
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
                    <div className="substep-content">
                      <p className="substep-title">{sub.title}</p>
                      <p className="substep-duration">{sub.duration} Menit</p>
                    </div>
                  </li>
                ))}
              </ul>
              {subCompleted < subTotal && (
                <p className="focus-sub-hint">
                  Selesaikan semua sub-langkah untuk lanjut ke step berikutnya.
                </p>
              )}
            </>
          )}
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
                  {Array.isArray(step.subSteps) && step.subSteps.length > 0 && (
                    <ul className="check-substeps">
                      {step.subSteps.map((sub, j) => (
                        <li className="check-substep" key={j}>
                          <span className="check-substep-dot" aria-hidden="true" />
                          <span className="check-substep-text">
                            {sub.title}
                            <span className="check-substep-duration"> · {sub.duration} mnt</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
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
