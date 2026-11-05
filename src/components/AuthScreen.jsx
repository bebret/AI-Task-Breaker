import { useState } from 'react';
import { BackButton } from './BackButton.jsx';
import { isValidIdentifier, nameFromIdentifier } from '../auth.js';

/**
 * Layar login & register (satu komponen, mode diganti via prop).
 * Login: email + password. Register: nama, email, password, preferensi visual.
 */
export default function AuthScreen({ mode, onBack, onSwitch, onSuccess, onGuest }) {
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sensoryFriendly, setSensoryFriendly] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const id = email.trim();

    if (isRegister && !name.trim()) {
      setError('Nama panggilan belum diisi.');
      return;
    }
    if (!isValidIdentifier(id)) {
      setError('Isi email yang valid, ya.');
      return;
    }
    if (isRegister && password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (!isRegister && !password) {
      setError('Password belum diisi.');
      return;
    }

    setError('');
    setNotice('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);

    onSuccess({
      name: isRegister ? name.trim() : nameFromIdentifier(id),
      identifier: id,
      ...(isRegister ? { sensoryFriendly } : {}),
    });
  };

  const selectMode = (nextMode) => {
    setError('');
    setNotice('');
    onSwitch(nextMode);
  };

  const forgotPassword = () => {
    setError('');
    setNotice('Reset password belum tersedia di versi demo ini.');
  };

  const socialLogin = (provider) => {
    setError('');
    setNotice(`Login dengan ${provider} belum tersambung di versi demo ini.`);
  };

  return (
    <div className="screen auth">
      <div className="auth-back">
        <BackButton onClick={onBack} label={isRegister ? 'Kembali ke login' : 'Kembali'} />
      </div>

      <div className="auth-body">
        <header className="auth-header">
          <h1 className="auth-title">
            {isRegister ? 'Daftar Akun' : 'Selamat datang kembali!'}
          </h1>
          <p className="auth-sub">
            {isRegister
              ? 'Yuk, mulai perjalanan produktifmu!'
              : 'Senang melihatmu lagi. 🤍'}
          </p>
        </header>

        <form className="auth-form" onSubmit={submit} noValidate>
          {isRegister && (
            <label className="auth-field">
              <span className="auth-label">Nama Panggilan</span>
              <input
                className="auth-input"
                type="text"
                placeholder="Contoh : Lily"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                autoComplete="nickname"
              />
            </label>
          )}

          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              className="auth-input"
              type="email"
              placeholder="nama@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={80}
              autoComplete="email"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <div className="auth-password">
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                placeholder={isRegister ? 'Minimal 8 karakter' : '••••••••'}
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

          {!isRegister && (
            <button type="button" className="auth-forgot" onClick={forgotPassword}>
              Lupa password?
            </button>
          )}

          {isRegister && (
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={sensoryFriendly}
                onChange={(e) => setSensoryFriendly(e.target.checked)}
              />
              <span>
                Apakah kamu lebih nyaman dengan pengaturan visual yang ramah
                sensorik?
              </span>
            </label>
          )}

          {error && <p className="auth-error">{error}</p>}
          {notice && <p className="auth-notice">{notice}</p>}

          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Sebentar...' : isRegister ? 'Buat Akun' : 'Masuk'}
          </button>
        </form>

        {!isRegister && (
          <>
            <div className="auth-divider">
              <span>atau</span>
            </div>

            <div className="auth-social">
              <button
                type="button"
                className="auth-social-btn google"
                onClick={() => socialLogin('Google')}
              >
                <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                className="auth-social-btn apple"
                onClick={() => socialLogin('Apple')}
              >
                <svg width="18" height="20" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                Continue with Apple
              </button>
            </div>
          </>
        )}

        <p className="auth-switch">
          {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => selectMode(isRegister ? 'login' : 'register')}
          >
            {isRegister ? 'Masuk' : 'Daftar'}
          </button>
        </p>
      </div>

      <div className="auth-guest">
        <button type="button" className="auth-guest-btn" onClick={onGuest}>
          Masuk sebagai tamu
        </button>
      </div>
    </div>
  );
}
