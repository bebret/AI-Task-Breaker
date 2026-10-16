import { useState } from 'react';
import { BackButton } from './BackButton.jsx';
import { AMBIENT_SOUNDS, useAmbientSound } from '../hooks/useAmbientSound.js';

const DURATION_PRESETS = [5, 15, 25, 45, 60];
const MIN_CUSTOM = 1;
const MAX_CUSTOM = 180;

/**
 * Pengaturan sesi mode fokus: pilih suara latar + durasi (preset atau kustom).
 * Bisa dibuka langsung dari dashboard tanpa perlu pecah tugas dulu.
 */
export default function FocusSetupScreen({ onBack, onStart }) {
  const [soundId, setSoundId] = useState('rain');
  const [preset, setPreset] = useState(25);
  const [custom, setCustom] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [previewOn, setPreviewOn] = useState(false);

  // Contoh suara sejenak saat memilih, biar pengguna tahu bunyinya.
  useAmbientSound(previewOn ? soundId : 'none', previewOn);

  const customValue = Number.parseInt(custom, 10);
  const customValid =
    Number.isFinite(customValue) &&
    customValue >= MIN_CUSTOM &&
    customValue <= MAX_CUSTOM;
  const minutes = useCustom ? customValue : preset;
  const ready = useCustom ? customValid : true;
  const selectedSound = AMBIENT_SOUNDS.find((s) => s.id === soundId);

  const pickSound = (id) => {
    setSoundId(id);
    setPreviewOn(false);
  };

  const start = () => {
    if (!ready) return;
    setPreviewOn(false);
    onStart({ sound: soundId, minutes });
  };

  return (
    <div className="screen focus-setup">
      <header className="topbar">
        <BackButton onClick={onBack} />
        <h2 className="topbar-title">Mode Fokus</h2>
        <span className="topbar-spacer" />
      </header>

      <div className="setup-body">
        <h1 className="setup-title">Atur sesi fokusmu</h1>
        <p className="setup-sub">
          Pilih suara latar dan durasinya. Fokus dulu, sisanya nanti.
        </p>

        <div className="setup-section-head">
          <h3 className="setup-section-title">Suara Latar</h3>
          <button
            type="button"
            className={`setup-preview ${previewOn ? 'on' : ''}`}
            onClick={() => setPreviewOn((v) => !v)}
            disabled={soundId === 'none'}
          >
            {previewOn ? '⏸ Hentikan' : '🔊 Coba suara'}
          </button>
        </div>

        <div className="sound-list">
          {AMBIENT_SOUNDS.map((s) => {
            const active = s.id === soundId;
            return (
              <button
                type="button"
                key={s.id}
                className={`sound-card ${active ? 'active' : ''}`}
                onClick={() => pickSound(s.id)}
                aria-pressed={active}
              >
                <span className="sound-emoji" aria-hidden="true">
                  {s.emoji}
                </span>
                <span className="sound-text">
                  <span className="sound-label">{s.label}</span>
                  <span className="sound-desc">{s.desc}</span>
                </span>
                <span className="sound-check" aria-hidden="true">
                  {active && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <h3 className="setup-section-title setup-section-title-spaced">Durasi</h3>
        <div className="duration-chips">
          {DURATION_PRESETS.map((m) => (
            <button
              type="button"
              key={m}
              className={`dur-chip ${!useCustom && preset === m ? 'active' : ''}`}
              onClick={() => {
                setUseCustom(false);
                setPreset(m);
              }}
            >
              {m} mnt
            </button>
          ))}
          <button
            type="button"
            className={`dur-chip ${useCustom ? 'active' : ''}`}
            onClick={() => setUseCustom(true)}
          >
            Kustom
          </button>
        </div>

        {useCustom && (
          <div className="duration-custom">
            <input
              className="duration-input"
              type="number"
              inputMode="numeric"
              min={MIN_CUSTOM}
              max={MAX_CUSTOM}
              placeholder="25"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              aria-label="Durasi kustom dalam menit"
            />
            <span className="duration-unit">menit</span>
          </div>
        )}

        {useCustom && custom !== '' && !customValid && (
          <p className="setup-error">
            Isi durasi {MIN_CUSTOM}-{MAX_CUSTOM} menit, ya.
          </p>
        )}

        <p className="setup-summary">
          {ready
            ? `Siap fokus ${minutes} menit dengan ${selectedSound?.label.toLowerCase()}.`
            : 'Pilih durasinya dulu, ya.'}
        </p>
      </div>

      <div className="setup-actions">
        <button className="btn-primary" onClick={start} disabled={!ready}>
          Mulai Fokus
        </button>
      </div>
    </div>
  );
}
