export default function WelcomeScreen({ onStart }) {
  return (
    <div className="screen welcome">
      <div className="welcome-top">
        <button className="back-btn" aria-label="Kembali" onClick={() => {}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="welcome-body">
        <div className="question-badge" aria-hidden="true">
          <span>?</span>
        </div>
        <h1 className="welcome-title">
          Lagi Buntu /
          <br />
          Bingung Mulai dari mana
        </h1>
        <p className="welcome-sub">
          Ceritain yang bikin kamu pusing di sini
          <br />
          nanti aku bantuin pecahin
        </p>
      </div>

      <div className="welcome-actions">
        <button className="btn-primary" onClick={() => onStart(false)}>
          Mulai
        </button>
        <button
          className="mic-btn"
          aria-label="Mulai dengan input suara"
          onClick={() => onStart(true)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
            <path
              d="M5 11a7 7 0 0 0 14 0M12 18v3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
