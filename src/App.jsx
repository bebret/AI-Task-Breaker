import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import InputScreen from './components/InputScreen.jsx';
import ResultScreen from './components/ResultScreen.jsx';
import FocusScreen from './components/FocusScreen.jsx';

/**
 * Alur aplikasi (sesuai mockup):
 *  1. welcome  -> layar sambutan "Lagi Buntu / Bingung Mulai dari mana"
 *  2. input    -> pengguna menulis tugas mentah
 *  3. result   -> daftar langkah mikro dari AI
 *  4. focus    -> timer per langkah + checklist langkah yang sudah selesai
 */
export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [task, setTask] = useState('');
  const [result, setResult] = useState(null);
  const [autoListen, setAutoListen] = useState(false);

  const goInput = (listen = false) => {
    setAutoListen(listen);
    setScreen('input');
  };

  const goResult = (data, originalTask) => {
    setResult(data);
    setTask(originalTask);
    setAutoListen(false);
    setScreen('result');
  };

  const restart = () => {
    setResult(null);
    setTask('');
    setAutoListen(false);
    setScreen('welcome');
  };

  return (
    <div className="app-shell">
      <div className="phone">
        {screen === 'welcome' && <WelcomeScreen onStart={goInput} />}
        {screen === 'input' && (
          <InputScreen
            initialTask={task}
            autoListen={autoListen}
            onBack={restart}
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
          />
        )}
        {screen === 'focus' && (
          <FocusScreen
            task={task}
            result={result}
            onBack={() => setScreen('result')}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  );
}
