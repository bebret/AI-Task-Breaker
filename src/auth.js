const KEY = 'atb_user';

/**
 * Auth demo sederhana berbasis localStorage (tanpa backend).
 * Cukup untuk alur UI splash -> landing -> login/register.
 */
export function getUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    /* abaikan: mode privat / storage penuh */
  }
}

export function clearUser() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* abaikan */
  }
}

/** Ambil nama tampilan dari email / nomor HP. */
export function nameFromIdentifier(value) {
  const v = (value ?? '').trim();
  if (v.includes('@')) {
    const name = v.split('@')[0].replace(/[._-]+/g, ' ').trim();
    return name
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return v;
}

/** Validasi longgar: email atau nomor HP. */
export function isValidIdentifier(value) {
  const v = (value ?? '').trim();
  if (v.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  return /^[+\d][\d\s-]{7,}$/.test(v);
}
