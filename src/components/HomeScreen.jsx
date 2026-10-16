import shiba from '../assets/shiba.png';

/**
 * Home / landing page: sapaan personal, maskot, dan tombol mulai.
 */
export default function HomeScreen({ user, onStart, onLogout }) {
  const firstName = (user?.name || 'Kamu').split(' ')[0];

  return (
    <div className="screen home">
      <header className="home-top">
        <div className="home-brand">
          <span className="home-brand-dot" aria-hidden="true" />
          Pacefuly
        </div>
        <button className="home-avatar" onClick={onLogout} aria-label="Keluar">
          {(user?.name || 'A').charAt(0).toUpperCase()}
        </button>
      </header>

      <div className="home-body">
        <h1 className="home-greeting">
          Halo, {firstName}! 👋
          <br />
          Lagi buntu mau mulai dari mana?
        </h1>
        <p className="home-sub">
          Ceritain tugasmu, nanti aku pecahin jadi langkah-langkah kecil yang
          gampang dimulai.
        </p>

        <div className="home-mascot-wrap">
          <div className="home-mascot-ring" aria-hidden="true" />
          <img className="home-mascot" src={shiba} alt="Maskot Pacefuly" />
        </div>
      </div>

      <div className="home-actions">
        <button className="btn-primary" onClick={onStart}>
          Mulai Pecah Tugas
        </button>
      </div>
    </div>
  );
}
