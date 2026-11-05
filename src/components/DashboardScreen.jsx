import shiba from '../assets/shiba.png';

const FEATURES = [
  {
    id: 'break',
    eyebrow: 'Task Breaker',
    title: 'Pecah Tugas',
    text: 'Tulis tugas besar, AI pecahin jadi langkah kecil 2-15 menit.',
    cta: 'Mulai Pecah Tugas',
    tone: 'purple',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 6h10M4 12h16M4 18h7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'focus',
    eyebrow: 'Mode Fokus',
    title: 'Timer Fokus',
    text: 'Timer santai dengan suara latar, tanpa perlu pecah tugas dulu.',
    cta: 'Mulai Fokus',
    tone: 'pink',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 9.5V13l2.5 1.5M9 2h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

/**
 * Dashboard: hub fitur. Pengguna pilih mau pecah tugas atau mode fokus.
 */
export default function DashboardScreen({ user, onSelect, onLogout }) {
  const firstName = (user?.name || '').split(' ')[0];

  return (
    <div className="screen dashboard">
      <header className="dashboard-top">
        <div className="dashboard-brand">
          <span className="dashboard-brand-dot" aria-hidden="true" />
          Pacefuly
        </div>
        <div className="dashboard-user">
          <span className="dashboard-pill">
            {firstName ? `Hai, ${firstName}! 👋` : 'Hai! 👋'}
          </span>
          {onLogout && (
            <button
              type="button"
              className="dashboard-logout"
              onClick={onLogout}
              aria-label="Keluar"
              title="Keluar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M15 8l4 4-4 4M19 12H9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </header>

      <div className="dashboard-body">
        <h1 className="dashboard-title">Mau mulai dari mana?</h1>
        <p className="dashboard-sub">
          Pilih fitur yang kamu butuh. Dua-duanya bisa dipakai kapan aja.
        </p>

        <div className="dashboard-features">
          {FEATURES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`feature-card ${f.tone} ${f.soon ? 'soon' : ''}`}
              onClick={() => !f.soon && onSelect(f.id)}
              disabled={f.soon}
            >
              <span className="feature-icon" aria-hidden="true">
                {f.icon}
              </span>
              <span className="feature-body">
                <span className="feature-eyebrow">{f.eyebrow}</span>
                <span className="feature-title">{f.title}</span>
                <span className="feature-text">{f.text}</span>
                <span className="feature-cta">{f.cta}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="dashboard-tip">
          <img className="dashboard-tip-mascot" src={shiba} alt="" aria-hidden="true" />
          <p className="dashboard-tip-text">
            Satu langkah kecil hari ini lebih berguna daripada rencana besar
            besok.
          </p>
        </div>
      </div>
    </div>
  );
}
