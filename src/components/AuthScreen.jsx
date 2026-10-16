import { useState } from 'react';
import { BackButton } from './BackButton.jsx';
import shiba from '../assets/shiba.png';
import { isValidIdentifier, nameFromIdentifier } from '../auth.js';

/**
 * Layar login & register (satu komponen, mode diganti via prop).
 * Register: nama + email/HP + password. Login: email/HP + password.
 */
export default function AuthScreen({ mode, onBack, onSuccess }) {
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const id = identifier.trim();
    if (!isRegister && !name.trim()) {
      // Login tanpa daftar: pakai nama dari identifier.
    }
    if (!isValidIdentifier(id)) {
      setError('Isi email yang valid atau nomor HP, ya.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    setError('');
    setLoading(true);
    // Simulasi proses singkat agar terasa seperti request asli.
    await new Promise((r) => setTimeout(r, 400));
    const displayName =
      (isRegister ? name.trim() : '') || nameFromIdentifier(id);
    setLoading(false);
    onSuccess({ name: displayName, identifier: id });
  };

  return (
    <div className="screen auth">
      <header className="topbar">
        <BackButton onClick={onBack} />
        <h2 className="topbar-title">{isRegister ? 'Daftar' : 'Masuk'}</h2>
        <span className="topbar-spacer" />
      </header>

      <div className="auth-body">
        <img className="auth-mascot" src={shiba} alt="" aria-hidden="true" />
        <h1 className="auth-title">
          {isRegister ? 'Ayo Bergabung!' : 'Selamat Datang Kembali!'}
        </h1>
        <p className="auth-sub">
          {isRegister
            ? 'Buat akun dulu, biar tugasmu tersimpan rapi.'
            : 'Senang kamu balik lagi. Ayo lanjut pecah tugasmu!'}
        </p>

        <form className="auth-form" onSubmit={submit}>
          {isRegister && (
            <label className="auth-field">
              <span className="auth-label">Nama</span>
              <input
                className="auth-input"
                type="text"
                placeholder="Nama kamu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                autoComplete="name"
              />
            </label>
          )}

          <label className="auth-field">
            <span className="auth-label">Email / No. HP</span>
            <input
              className="auth-input"
              type="text"
              placeholder="contoh: nama@email.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              maxLength={80}
              autoComplete="username"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <div className="auth-password">
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={72}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M7 7.2A9.6 9.6 0 0 0 4 12s3 6 8 6a9 9 0 0 0 3.2-.6M12 6c4.5 0 7.6 4.6 8 6-.2.7-1 2.2-2.4 3.6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 12s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Sebentar...' : isRegister ? 'Daftar' : 'Masuk'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => {
              setError('');
              onBack(isRegister ? 'login' : 'register');
            }}
          >
            {isRegister ? 'Masuk' : 'Daftar'}
          </button>
        </p>
      </div>
    </div>
  );
}
