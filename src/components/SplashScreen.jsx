import { useEffect } from 'react';
import shiba from '../assets/shiba.png';

/**
 * Splash screen: logo + maskot shiba, otomatis lanjut setelah 2 detik.
 */
export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const id = setTimeout(onFinish, 2000);
    return () => clearTimeout(id);
  }, [onFinish]);

  return (
    <div className="screen splash">
      <div className="splash-logo">
        <span className="splash-logo-text">Pacefuly</span>
      </div>
      <img className="splash-mascot" src={shiba} alt="Maskot Pacefuly" />
      <p className="splash-tagline">Pecah tugas besar jadi langkah kecil</p>
      <span className="splash-loader" aria-hidden="true" />
    </div>
  );
}
