import { BackButton } from './BackButton.jsx';
import { FoxMascot } from './FoxMascot.jsx';

export default function ResultScreen({ task, result, onBack, onStartFocus, onRestart }) {
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
            <li className="step" key={i}>
              <span className="step-check" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="step-content">
                <p className="step-title">
                  Step {i + 1}: {step.title}
                </p>
                <p className="step-duration">{step.duration} Menit</p>
              </div>
            </li>
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
