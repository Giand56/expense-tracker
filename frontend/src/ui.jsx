import { CAT_BY_ID, eur } from './data.js';

export function Stat({ label, value, sub, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums',
        fontSize: 'var(--stat-size, 22px)', color: accent || 'var(--ink-1)', fontWeight: 500,
        letterSpacing: '-0.01em',
      }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{sub}</span>}
    </div>
  );
}

export function CategoryDot({ id, size = 8 }) {
  const cat = CAT_BY_ID[id];
  if (!cat) return null;
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: 2,
      background: `oklch(var(--cat-l) var(--cat-c) ${cat.hue})`,
      flexShrink: 0,
    }} />
  );
}

export function CategoryChip({ id, active, onClick, count }) {
  const cat = id === 'all' ? { label: 'All' } : CAT_BY_ID[id];
  return (
    <button type="button" onClick={onClick}
      style={{
        appearance: 'none', cursor: 'pointer', font: 'inherit',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 12px', borderRadius: 'var(--chip-radius)',
        border: '1px solid', borderColor: active ? 'var(--ink-1)' : 'var(--line)',
        background: active ? 'var(--ink-1)' : 'transparent',
        color: active ? 'var(--bg)' : 'var(--ink-2)',
        fontSize: 12, lineHeight: 1, transition: 'all .15s', whiteSpace: 'nowrap',
      }}>
      {id !== 'all' && <CategoryDot id={id} />}
      <span>{cat?.label}</span>
      {count != null && (
        <span style={{ color: active ? 'var(--bg)' : 'var(--ink-3)', opacity: 0.7, fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>
          {count}
        </span>
      )}
    </button>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>
        {label}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', prefix, autoFocus, inputMode, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      border: '1px solid var(--line)', borderRadius: 'var(--input-radius)',
      padding: 'var(--input-pad)', background: 'var(--surface)',
      transition: 'border-color .15s', ...style,
    }}>
      {prefix && <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>{prefix}</span>}
      <input
        type={type} value={value ?? ''} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus} inputMode={inputMode}
        style={{
          appearance: 'none', border: 0, outline: 0, background: 'transparent',
          font: 'inherit', color: 'var(--ink-1)', flex: 1, width: '100%',
          fontFamily: (type === 'number' || inputMode === 'decimal') ? 'var(--font-num)' : 'inherit',
          fontVariantNumeric: 'tabular-nums',
        }}
      />
    </div>
  );
}

export function SelectInput({ value, onChange, options }) {
  return (
    <div style={{ position: 'relative', border: '1px solid var(--line)', borderRadius: 'var(--input-radius)', background: 'var(--surface)' }}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: 'none', border: 0, outline: 0, background: 'transparent',
          font: 'inherit', color: 'var(--ink-1)', width: '100%',
          padding: 'var(--input-pad)', paddingRight: 32, cursor: 'pointer',
        }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg width="10" height="10" viewBox="0 0 10 10" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}>
        <path d="M2 4 L5 7 L8 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', type = 'button', style }) {
  const sizes = {
    sm: { padding: '6px 10px', fontSize: 12, height: 28 },
    md: { padding: '8px 14px', fontSize: 13, height: 36 },
    lg: { padding: '10px 18px', fontSize: 14, height: 44 },
  };
  const variants = {
    primary:   { background: 'var(--ink-1)',     color: 'var(--bg)',         border: '1px solid var(--ink-1)' },
    secondary: { background: 'transparent',      color: 'var(--ink-1)',      border: '1px solid var(--line-strong)' },
    accent:    { background: 'var(--accent)',     color: 'var(--accent-ink)', border: '1px solid var(--accent)' },
    ghost:     { background: 'transparent',      color: 'var(--ink-2)',      border: '1px solid transparent' },
  };
  return (
    <button type={type} onClick={onClick}
      style={{
        appearance: 'none', cursor: 'pointer', font: 'inherit',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        borderRadius: 'var(--btn-radius)', lineHeight: 1, transition: 'all .15s',
        ...sizes[size], ...variants[variant], ...style,
      }}>
      {children}
    </button>
  );
}

export function IconBtn({ children, onClick, title, style }) {
  return (
    <button type="button" onClick={onClick} title={title}
      style={{
        appearance: 'none', cursor: 'pointer', font: 'inherit',
        width: 28, height: 28, borderRadius: 7,
        border: '1px solid transparent', background: 'transparent',
        color: 'var(--ink-3)', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s', ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--ink-1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-3)'; }}
    >
      {children}
    </button>
  );
}

export const Icons = {
  plus:   <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  trash:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 4h9M5 4V2.5h4V4M3.5 4l.5 8h6l.5-8M6 6.5v3.5M8 6.5v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit:   <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2.5l2.5 2.5M2 12l1-3.5L9.5 2 12 4.5 5.5 11 2 12z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  close:  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  check:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L6 11l5.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrowR: <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 6h6M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  moon:   <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 8a4.5 4.5 0 01-5.5-5.5A5 5 0 1011.5 8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  sun:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1.5v1.5M7 11v1.5M1.5 7H3M11 7h1.5M3 3l1 1M10 10l1 1M3 11l1-1M10 4l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
};

export function BudgetBar({ spent, budget }) {
  const pct = Math.min((spent / budget) * 100, 100);
  const over = spent > budget;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
          Monthly budget
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>
          {eur(spent, { compact: true })} / {eur(budget, { compact: true })}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: over ? '#d24a3d' : 'var(--accent)',
          transition: 'width .4s cubic-bezier(.2,.7,.3,1)',
        }} />
      </div>
    </div>
  );
}
