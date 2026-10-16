import { BackButton } from './BackButton.jsx';
import shiba from '../assets/shiba.png';

const FEATURES = [
  {
    title: 'Langkah mikro',
    text: 'Tiap langkah cuma 2-15 menit, jadi ringan untuk dimulai.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M13 2 5 13h5l-1 9 8-11h-5l1-9z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Input suara',
    text: 'Ceritain pakai mikrofon, tanpa perlu ngetik.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M5 11a7 7 0 0 0 14 0M12 18v3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Timer fokus',
    text: 'Kerjakan satu langkah dulu, sisanya nanti saja.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

const STEPS = [
  { n: '1', title: 'Tulis tugasmu', text: 'Pakai bahasa sehari-hari, seadanya aja.' },
  { n: '2', title: 'AI pecahin jadi langkah', text: 'Dapat 3-8 langkah kecil yang jelas.' },
  { n: '3', title: 'Mulai satu langkah', text: 'Selesai satu, lanjut yang berikutnya.' },
];

/**
 * Pengantar Task Breaker: kenalan produk, cara kerja, lalu CTA "Mulai Pecah
 * Tugas". Dibuka dari dashboard, jadi ada tombol kembali.
 */
export default function LandingScreen({ onStart, onBack }) {
  return (
    <div className="screen landing">
      <header className="topbar">
        <BackButton onClick={onBack} />
        <h2 className="topbar-title">Pacefuly</h2>
        <span className="topbar-spacer" />
      </header>

      <div className="landing-scroll">
        <section className="landing-hero">
          <span className="landing-pill">Buntu mau mulai dari mana?</span>
          <h1 className="landing-title">
            Tugas besar jadi
            <br />
            langkah <span className="landing-title-accent">mikro</span>
          </h1>
          <p className="landing-sub">
            Tulis tugasmu seadanya, lalu AI bantu pecah jadi langkah kecil yang
            gampang dimulai.
          </p>

          <div className="landing-mascot-wrap">
            <div className="landing-mascot-ring" aria-hidden="true" />
            <img
              className="landing-mascot"
              src={shiba}
              alt="Maskot Pacefuly"
            />
          </div>
        </section>

        <section className="landing-features">
          {FEATURES.map((f) => (
            <article className="landing-card" key={f.title}>
              <span className="landing-card-icon" aria-hidden="true">
                {f.icon}
              </span>
              <h2 className="landing-card-title">{f.title}</h2>
              <p className="landing-card-text">{f.text}</p>
            </article>
          ))}
        </section>

        <section className="landing-steps">
          <h2 className="landing-section-title">Cara kerjanya gampang</h2>
          <ol className="landing-step-list">
            {STEPS.map((s) => (
              <li className="landing-step" key={s.n}>
                <span className="landing-step-num" aria-hidden="true">
                  {s.n}
                </span>
                <div>
                  <h3 className="landing-step-title">{s.title}</h3>
                  <p className="landing-step-text">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="landing-actions">
        <button className="btn-primary" onClick={onStart}>
          Mulai Pecah Tugas
        </button>
        <p className="landing-note">
          Tulis tugasmu, nanti AI pecahin jadi langkah kecil.
        </p>
      </div>
    </div>
  );
}
