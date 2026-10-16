import { useState } from 'react';
import SplashScreen from './components/SplashScreen.jsx';
import LandingScreen from './components/LandingScreen.jsx';
import DashboardScreen from './components/DashboardScreen.jsx';
import InputScreen from './components/InputScreen.jsx';
import ResultScreen from './components/ResultScreen.jsx';
import FocusScreen from './components/FocusScreen.jsx';
import FocusSetupScreen from './components/FocusSetupScreen.jsx';
import FocusTimerScreen from './components/FocusTimerScreen.jsx';

/**
 * Alur aplikasi (tanpa login, biar gampang didemokan):
 *  1. splash       -> logo + maskot (2 detik)
 *  2. dashboard    -> hub fitur: Task Breaker atau Mode Fokus
 *  3. landing      -> pengantar Task Breaker + tombol "Mulai Pecah Tugas"
 *  4. input        -> pengguna menulis tugas mentah
 *  5. result       -> daftar langkah mikro dari AI (dropdown sub-langkah)
 *  6. focus        -> timer per langkah + checklist + pecah sub-langkah
 *
 * Mode fokus mandiri (tanpa pecah tugas):
 *  7. focus-setup  -> pilih suara latar + durasi
 *  8. focus-timer  -> timer dengan background sesuai suara, bisa dijeda
 *
 * Layar login/register & beranda lama masih ada di src/components
 * (AuthScreen.jsx, HomeScreen.jsx) kalau nanti mau dipakai lagi.
 */
export default function App() {
  const [screen, setScreen] = useState('splash');
  const [task, setTask] = useState('');
  const [result, setResult] = useState(null);
  const [autoListen, setAutoListen] = useState(false);
  // State timer/checklist layar fokus, dipertahankan saat bolak-balik layar.
  const [focusState, setFocusState] = useState(null);
  // Pengaturan sesi mode fokus mandiri (suara + durasi).
  const [focusMode, setFocusMode] = useState({ sound: 'rain', minutes: 25 });

  const finishSplash = () => {
    setScreen('dashboard');
  };

  const goInput = (listen = false) => {
    setAutoListen(listen);
    setScreen('input');
  };

  // Dashboard: pilih fitur.
  const handleFeature = (feature) => {
    if (feature === 'break') setScreen('landing');
    if (feature === 'focus') setScreen('focus-setup');
  };

  const goResult = (data, originalTask) => {
    setResult(data);
    setTask(originalTask);
    setAutoListen(false);
    setFocusState(null);
    setScreen('result');
  };

  // Simpan sub-langkah hasil pecahan kedua ke langkah terkait agar bisa
  // dipakai juga di layar fokus.
  const saveSubSteps = (stepIndex, subSteps) => {
    setResult((prev) => {
      if (!prev || !Array.isArray(prev.steps)) return prev;
      const steps = prev.steps.map((s, i) =>
        i === stepIndex ? { ...s, subSteps } : s
      );
      return { ...prev, steps };
    });
  };

  const restart = () => {
    setResult(null);
    setTask('');
    setAutoListen(false);
    setFocusState(null);
    setScreen('dashboard');
  };

  return (
    <div className="app-shell">
      <div className="phone">
        {screen === 'splash' && <SplashScreen onFinish={finishSplash} />}
        {screen === 'landing' && (
          <LandingScreen
            onStart={() => goInput(false)}
            onBack={() => setScreen('dashboard')}
          />
        )}
        {screen === 'dashboard' && <DashboardScreen onSelect={handleFeature} />}
        {screen === 'input' && (
          <InputScreen
            initialTask={task}
            autoListen={autoListen}
            onBack={() => setScreen('landing')}
            onResult={goResult}
          />
        )}
        {screen === 'result' && (
          <ResultScreen
            task={task}
            result={result}
            onBack={() => setScreen('input')}
            onStartFocus={() => setScreen('focus')}
            onRestart={restart}
            onSubSteps={saveSubSteps}
          />
        )}
        {screen === 'focus' && (
          <FocusScreen
            task={task}
            result={result}
            focusState={focusState}
            onFocusStateChange={setFocusState}
            onSubSteps={saveSubSteps}
            onBack={() => setScreen('result')}
            onRestart={restart}
          />
        )}
        {screen === 'focus-setup' && (
          <FocusSetupScreen
            onBack={() => setScreen('dashboard')}
            onStart={(config) => {
              setFocusMode(config);
              setScreen('focus-timer');
            }}
          />
        )}
        {screen === 'focus-timer' && (
          <FocusTimerScreen
            soundId={focusMode.sound}
            minutes={focusMode.minutes}
            onExit={() => setScreen('dashboard')}
          />
        )}
      </div>
    </div>
  );
}
