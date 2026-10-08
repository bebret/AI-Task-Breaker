/** Maskot rubah lucu (SVG inline, tanpa aset eksternal). */
export function FoxMascot() {
  return (
    <svg
      className="fox"
      width="96"
      height="96"
      viewBox="0 0 120 120"
      role="img"
      aria-label="Maskot rubah"
    >
      {/* ekor */}
      <path
        d="M18 92c-8-6-10-18-4-26 4 8 12 12 20 12-6 6-10 10-16 14z"
        fill="#f4a259"
      />
      <path d="M18 92c-4-3-6-8-6-13 3 5 8 8 13 9-2 2-5 3-7 4z" fill="#fff3e6" />
      {/* badan */}
      <ellipse cx="62" cy="86" rx="30" ry="24" fill="#f4a259" />
      <ellipse cx="62" cy="92" rx="20" ry="16" fill="#fff3e6" />
      {/* kepala */}
      <path d="M40 44l-6-22 20 12z" fill="#f4a259" />
      <path d="M84 44l6-22-20 12z" fill="#f4a259" />
      <path d="M42 42l-3-13 12 7z" fill="#3b2f2f" />
      <path d="M82 42l3-13-12 7z" fill="#3b2f2f" />
      <ellipse cx="62" cy="52" rx="26" ry="22" fill="#f4a259" />
      {/* pipi putih */}
      <path d="M62 74c-10 0-20-6-24-14 6 4 14 6 24 6s18-2 24-6c-4 8-14 14-24 14z" fill="#fff3e6" />
      {/* mata */}
      <circle cx="52" cy="50" r="3.4" fill="#3b2f2f" />
      <circle cx="72" cy="50" r="3.4" fill="#3b2f2f" />
      <circle cx="53" cy="49" r="1.1" fill="#fff" />
      <circle cx="73" cy="49" r="1.1" fill="#fff" />
      {/* hidung */}
      <ellipse cx="62" cy="62" rx="4" ry="3" fill="#3b2f2f" />
      {/* mulut */}
      <path
        d="M62 65v3M62 68c-2 3-6 3-8 1M62 68c2 3 6 3 8 1"
        stroke="#3b2f2f"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* blush */}
      <circle cx="44" cy="60" r="4" fill="#f7b7a3" opacity="0.8" />
      <circle cx="80" cy="60" r="4" fill="#f7b7a3" opacity="0.8" />
    </svg>
  );
}
