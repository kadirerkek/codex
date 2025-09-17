import { useState } from 'react';
import { Google } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext.jsx';

const SignIn = () => {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError('Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: 'radial-gradient(circle at 10% 20%, #dbeafe 0%, #e0e7ff 30%, #fef9c3 70%, #e0f2fe 100%)'
      }}
    >
      <div
        style={{
          width: 'min(480px, 92vw)',
          padding: '48px',
          borderRadius: '36px',
          background: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 40px 80px rgba(15, 23, 42, 0.15)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="brand-badge" style={{ width: 'fit-content' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 12C4 7.58172 7.58172 4 12 4"
                stroke="#2563eb"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M12 20C16.4183 20 20 16.4183 20 12"
                stroke="#7c3aed"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="2.5" fill="#2563eb" />
            </svg>
            NovaFlow AI
          </div>
          <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Yeni nesil proje yönetimi</h1>
          <p style={{ fontSize: '1rem', color: '#64748b', margin: 0 }}>
            Google hesabınız ile birkaç saniye içinde güvenli giriş yapın ve projelerinizi tek bir yerde yönetin.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            borderRadius: '18px',
            padding: '14px 18px',
            fontSize: '1rem',
            fontWeight: 600,
            border: '1px solid rgba(15,23,42,0.06)',
            background: 'white',
            cursor: 'pointer',
            color: '#0f172a',
            boxShadow: '0 18px 38px rgba(15,23,42,0.12)',
            transition: 'all 220ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        >
          <Google style={{ width: 22, height: 22 }} />
          {loading ? 'Google ile bağlanılıyor...' : 'Google ile giriş yap'}
        </button>
        <div style={{ display: 'grid', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
          <span>• Kurumsal SSO ve iki faktörlü doğrulama desteklenir.</span>
          <span>• Tüm veriler Firebase üzerinde şifrelenmiş olarak saklanır.</span>
          <span>• Giriş yaparak kullanım şartlarını kabul etmiş olursunuz.</span>
        </div>
        {error && (
          <div
            style={{
              borderRadius: '16px',
              padding: '14px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#b91c1c'
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;
