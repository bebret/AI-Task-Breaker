import { useState } from 'react';
import { BackButton } from './BackButton.jsx';
import { FoxMascot } from './FoxMascot.jsx';
import { postJson } from '../api.js';

/**
 * Layar hasil: daftar langkah mikro dari AI. Setiap langkah bisa dibuka
 * (dropdown) untuk memecahnya lagi menjadi sub-langkah yang lebih kecil
 * dan lebih spesifik.
 */
export default function ResultScreen({ task, result, onBack, onStartFocus, onRestart, onSubSteps }) {
  // Kasus: AI menolak karena permintaan di luar cakupan.
  if (result && result.allowed === false) {
    return (
      <div className="screen result-screen">
        <header className="topbar">
          <BackButton onClick={onBack} />
          <h2 className="topbar-title">Hmm, sebentar</h2>
          <span className="topbar-spacer" />
        </header>
        <div className="refusal">
          <div className="refusal-icon" aria-hidden="true">🤔</div>
          <p className="refusal-text">{result.reason}</p>
          <button className="btn-primary" onClick={onBack}>
            Coba Tulis Tugas
          </button>
        </div>
      </div>
    );
  }

  const steps = result?.steps ?? [];

  return (
    <div className="screen result-screen">
      <header className="topbar">
        <BackButton onClick={onBack} />
        <h2 className="topbar-title">Hasil AI Response</h2>
        <span className="topbar-spacer" />
      </header>

      <div className="result-body">
        <h3 className="result-heading">
          Langkah - Langkah untuk
          <br />
          {result?.title || 'Menyusun Rencana'}
        </h3>

        <ol className="steps">
          {steps.map((step, i) => (
            <StepDropdown key={i} index={i} step={step} task={task} onSubSteps={onSubSteps} />
          ))}
        </ol>
      </div>

      <div className="mascot-card">
        <FoxMascot />
        <div className="mascot-text">
          <p className="mascot-title">Kamu Hebat!</p>
          <p className="mascot-sub">
            {result?.encouragement || 'Satu Langkah Lagi Kamu Selesai'}
          </p>
        </div>
      </div>

      <button className="btn-primary result-cta" onClick={onStartFocus}>
        Mulai Kerjakan
      </button>

      <button className="btn-ghost" onClick={onRestart}>
        Pecah Tugas Lain
      </button>
    </div>
  );
}

/**
 * Satu langkah yang bisa dibuka jadi dropdown berisi sub-langkah.
 * Sub-langkah diambil dari AI saat dropdown pertama kali dibuka.
 */
function StepDropdown({ index, step, task, onSubSteps }) {
  const [open, setOpen] = useState(false);
  const [subSteps, setSubSteps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSub = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await postJson('/api/breakdown/sub', {
        task,
        step: step.title,
      });
      if (data.allowed === false) {
        setError(data.reason || 'Langkah ini tidak bisa dipecah lebih kecil.');
      } else {
        setSubSteps(data.subSteps ?? []);
        onSubSteps?.(index, data.subSteps ?? []);
      }
    } catch (e) {
      setError(e.message || 'Gagal memecah langkah. Coba lagi, ya.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Ambil sub-langkah sekali saja, saat dropdown pertama kali dibuka.
    if (next && !subSteps && !loading && !error) {
      fetchSub();
    }
  };

  const retry = () => {
    setSubSteps(null);
    fetchSub();
  };

  return (
    <li className={`step step-dropdown ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="step-head"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`substeps-${index}`}
      >
        <span className="step-check" aria-hidden="true">
          {index + 1}
        </span>
        <div className="step-content">
          <p className="step-title">{step.title}</p>
          <p className="step-duration">{step.duration} Menit</p>
        </div>
        <span className="step-chevron" aria-hidden="true">
          {loading ? (
            <span className="dot-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </button>

      {open && (
        <div className="substeps" id={`substeps-${index}`}>
          {error && (
            <div className="substeps-error">
              <p>{error}</p>
              <button type="button" className="substeps-retry" onClick={retry}>
                Coba Lagi
              </button>
            </div>
          )}
          {!error && loading && (
            <div className="substeps-loading">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}
          {!error && !loading && subSteps && subSteps.length > 0 && (
            <ul className="substeps-list">
              {subSteps.map((sub, j) => (
                <li className="substep" key={j}>
                  <span className="substep-dot" aria-hidden="true" />
                  <div className="substep-content">
                    <p className="substep-title">{sub.title}</p>
                    <p className="substep-duration">{sub.duration} Menit</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
