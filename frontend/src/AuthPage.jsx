import { useState } from 'react';

export function AuthPage({ onLogin, onRegister, error, loading }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin(email, password);
    } else {
      onRegister(email, password);
    }
  };

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        {/* Logo / wordmark */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="1" y="1" width="20" height="20" rx="5" stroke="var(--accent)" strokeWidth="1.5"/>
              <path d="M6 11h10M11 6v10" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--ink-1)',
              letterSpacing: '-0.02em',
            }}>Ledger</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            color: 'var(--ink-3)',
            margin: 0,
          }}>Personal finance tracker</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-card)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* Mode tabs */}
          <div style={{
            display: 'flex',
            gap: 4,
            background: 'var(--bg)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            padding: 3,
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  appearance: 'none',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 0',
                  fontSize: 12,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all .12s',
                  background: mode === m ? 'var(--surface)' : 'transparent',
                  color: mode === m ? 'var(--ink-1)' : 'var(--ink-3)',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,.12)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={mode === 'register' ? 'Choose a password' : 'Your password'}
              required
            />

            {error && (
              <div style={{
                fontSize: 12,
                color: '#e05252',
                background: 'rgba(224,82,82,.08)',
                border: '1px solid rgba(224,82,82,.2)',
                borderRadius: 6,
                padding: '8px 10px',
                fontFamily: 'var(--font-ui)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                appearance: 'none',
                border: 'none',
                borderRadius: 8,
                padding: '10px 0',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-ui)',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                opacity: loading ? 0.6 : 1,
                transition: 'opacity .12s',
              }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-ui)',
        letterSpacing: '0.03em',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          appearance: 'none',
          border: '1px solid var(--line)',
          borderRadius: 7,
          padding: '8px 10px',
          fontSize: 13,
          fontFamily: 'var(--font-ui)',
          background: 'var(--bg)',
          color: 'var(--ink-1)',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--line)')}
      />
    </div>
  );
}
