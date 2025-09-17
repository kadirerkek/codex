const LoadingScreen = ({ message = 'Yükleniyor...' }) => (
  <div
    style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'radial-gradient(circle at 20% 20%, #f0f9ff 0%, #e0e7ff 30%, #fef9c3 70%, #e0f2fe 100%)'
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '32px 40px',
        borderRadius: '28px',
        background: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(148,163,184,0.2)',
        boxShadow: '0 30px 60px rgba(15,23,42,0.16)'
      }}
    >
      <div className="loading-spinner" style={{ width: 48, height: 48 }}>
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(37,99,235,0.2)" strokeWidth="6" />
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="31.4 188.4"
            transform="rotate(-90 25 25)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: 8, fontSize: '1.25rem', color: '#0f172a' }}>NovaFlow</h2>
        <p style={{ margin: 0, color: '#64748b', maxWidth: 320 }}>{message}</p>
      </div>
    </div>
  </div>
);

export default LoadingScreen;
