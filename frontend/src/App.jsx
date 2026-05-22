import { useState, useEffect } from 'react';
import { useExpenseStore } from './useExpenseStore.js';
import { useSubscriptionStore } from './useSubscriptionStore.js';
import { useAuthStore } from './useAuthStore.js';
import { DesktopApp } from './DesktopApp.jsx';
import { MobileApp } from './MobileApp.jsx';
import { AuthPage } from './AuthPage.jsx';
import { Icons } from './ui.jsx';

const ACCENT_PRESETS = [
  { id: 'green',  hex: '#3a8c5f' },
  { id: 'cobalt', hex: '#3457d5' },
  { id: 'plum',   hex: '#7a4296' },
  { id: 'amber',  hex: '#c97a18' },
  { id: 'ink',    hex: '#1f1f1f' },
];

function hexToAccentVars(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const lum = 0.2126*r + 0.7152*g + 0.0722*b;
  return {
    '--accent': hex,
    '--accent-ink': lum > 0.6 ? '#1a1a1a' : '#fafaf7',
    '--accent-shadow': hex + '66',
  };
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return mobile;
}

export default function App() {
  const auth = useAuthStore();
  const store = useExpenseStore();
  const subStore = useSubscriptionStore();
  const isMobile = useIsMobile();
  const [budget, setBudgetState] = useState(() => {
    const saved = localStorage.getItem('ledger-budget');
    return saved ? Number(saved) : 1800;
  });
  const setBudget = (val) => {
    const n = Math.max(0, Number(val));
    localStorage.setItem('ledger-budget', String(n));
    setBudgetState(n);
  };
  const [tweaks, setTweaks] = useState({
    theme: 'dark',
    accent: '#c97a18',
    density: 'compact',
    chartType: 'donut',
    fontPair: 'inter',
    radius: 'soft',
  });
  const [tweakOpen, setTweakOpen] = useState(false);

  const set = (key, val) => setTweaks(t => ({ ...t, [key]: val }));

  const cls = [
    'exp-app',
    tweaks.theme === 'dark' ? 't-dark' : 't-light',
    `density-${tweaks.density}`,
    `radius-${tweaks.radius}`,
    tweaks.fontPair !== 'inter' ? `font-${tweaks.fontPair}` : '',
  ].filter(Boolean).join(' ');

  const styleVars = {
    height: '100%',
    ...hexToAccentVars(tweaks.accent),
  };

  if (!auth.isAuthenticated) {
    return (
      <div className={cls} style={styleVars}>
        <AuthPage
          onLogin={auth.login}
          onRegister={auth.register}
          error={auth.error}
          loading={auth.loading}
        />
      </div>
    );
  }

  return (
    <div className={cls} style={styleVars}>
      {isMobile
        ? <MobileApp store={store} subStore={subStore} tweaks={tweaks} budget={budget} setBudget={setBudget} onLogout={auth.logout} />
        : <DesktopApp store={store} subStore={subStore} tweaks={tweaks} budget={budget} setBudget={setBudget} onLogout={auth.logout} />}

      {/* Theme toggle */}
      <button
        onClick={() => set('theme', tweaks.theme === 'dark' ? 'light' : 'dark')}
        title="Toggle theme"
        style={{
          position: 'fixed', top: 14, right: tweakOpen ? 268 : 14, zIndex: 200,
          appearance: 'none', border: '1px solid var(--line)',
          background: 'var(--surface)', color: 'var(--ink-2)',
          width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'right .2s',
        }}>
        {tweaks.theme === 'dark' ? Icons.sun : Icons.moon}
      </button>

      {/* Tweaks panel toggle */}
      <button
        onClick={() => setTweakOpen(o => !o)}
        title="Tweaks"
        style={{
          position: 'fixed', top: 54, right: tweakOpen ? 268 : 14, zIndex: 200,
          appearance: 'none', border: '1px solid var(--line)',
          background: 'var(--surface)', color: 'var(--ink-2)',
          width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'right .2s', fontSize: 14,
        }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="4" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M1 4h1.5M5.5 4H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="10" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M1 10h7M11.5 10H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Tweaks panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 190,
        width: 252, background: 'var(--surface)', borderLeft: '1px solid var(--line)',
        padding: '16px 16px 24px', overflowY: 'auto',
        transform: tweakOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .2s cubic-bezier(.2,.7,.3,1)',
        display: 'flex', flexDirection: 'column', gap: 16,
        fontFamily: 'var(--font-ui)', color: 'var(--ink-1)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)', paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
          Tweaks
        </div>

        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={tweaks.theme} options={['light','dark']} onChange={v => set('theme', v)} />
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 8 }}>Accent</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ACCENT_PRESETS.map(p => (
              <button key={p.id} onClick={() => set('accent', p.hex)} style={{
                width: 24, height: 24, borderRadius: 6, padding: 0, cursor: 'pointer',
                border: tweaks.accent === p.hex ? '2px solid var(--ink-1)' : '1px solid rgba(128,128,128,.3)',
                background: p.hex,
              }} />
            ))}
            <input type="color" value={tweaks.accent} onChange={(e) => set('accent', e.target.value)}
              style={{ width: 24, height: 24, border: '1px solid rgba(128,128,128,.3)', borderRadius: 6, padding: 0, background: 'none', cursor: 'pointer' }} />
          </div>
        </div>

        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={tweaks.density} options={['compact','regular','comfy']} onChange={v => set('density', v)} />
        <TweakRadio label="Roundness" value={tweaks.radius} options={['sharp','regular','soft']} onChange={v => set('radius', v)} />

        <TweakSection label="Charts" />
        <TweakRadio label="Type" value={tweaks.chartType} options={['donut','bars']} onChange={v => set('chartType', v)} />

        <TweakSection label="Typography" />
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>Font pair</div>
          <select value={tweaks.fontPair} onChange={(e) => set('fontPair', e.target.value)} style={{
            appearance: 'none', border: '1px solid var(--line)', borderRadius: 6,
            background: 'var(--bg)', color: 'var(--ink-1)', font: 'inherit',
            padding: '6px 10px', width: '100%', cursor: 'pointer',
          }}>
            <option value="inter">Inter + JetBrains Mono</option>
            <option value="geist">Geist + Geist Mono</option>
            <option value="editorial">Instrument Serif + Plex</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function TweakSection({ label }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600, borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 4 }}>
      {label}
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)} style={{
            appearance: 'none', cursor: 'pointer', font: 'inherit',
            flex: 1, padding: '5px 4px', fontSize: 11, borderRadius: 5,
            border: '1px solid',
            borderColor: value === o ? 'var(--ink-1)' : 'var(--line)',
            background: value === o ? 'var(--ink-1)' : 'transparent',
            color: value === o ? 'var(--bg)' : 'var(--ink-2)',
            transition: 'all .12s',
          }}>{o}</button>
        ))}
      </div>
    </div>
  );
}
