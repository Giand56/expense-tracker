import { eur } from './data.js';

export function Donut({ data, size = 168, thickness = 18, label, sublabel }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth={thickness} opacity="0.5" />
        {data.map((d, i) => {
          const frac = d.value / total;
          if (frac === 0) return null;
          const dash = c * frac;
          const gap = c - dash;
          const seg = (
            <circle key={d.id} cx={cx} cy={cy} r={r} fill="none"
              stroke={i === 0 ? 'var(--accent)' : `oklch(var(--cat-l) var(--cat-c) ${d.hue})`}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return seg;
        })}
        {label && (
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="var(--ink-2)"
            style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {label}
          </text>
        )}
        {sublabel && (
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize="20" fill="var(--ink-1)"
            style={{ fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
            {sublabel}
          </text>
        )}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
        {data.map((d, i) => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 8, height: 8, borderRadius: 2,
              background: i === 0 ? 'var(--accent)' : `oklch(var(--cat-l) var(--cat-c) ${d.hue})`,
            }} />
            <span style={{ color: 'var(--ink-2)', minWidth: 90 }}>{d.label}</span>
            <span style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Bars({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '92px 1fr 80px', alignItems: 'center', gap: 12, fontSize: 12 }}>
          <span style={{ color: 'var(--ink-2)' }}>{d.label}</span>
          <div style={{ height: 8, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              width: `${(d.value / max) * 100}%`, height: '100%',
              background: i === 0 ? 'var(--accent)' : `oklch(var(--cat-l) var(--cat-c) ${d.hue})`,
              transition: 'width .35s cubic-bezier(.2,.7,.3,1)',
            }} />
          </div>
          <span style={{ textAlign: 'right', color: 'var(--ink-1)', fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>
            {eur(d.value, { compact: true })}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Area({ series, width = 540, height = 140 }) {
  if (!series.length) return null;
  const max = Math.max(...series.map(s => s.total), 1);
  const padX = 8, padY = 14;
  const w = width - padX * 2, h = height - padY * 2;
  const x = (i) => padX + (series.length === 1 ? w / 2 : (i / (series.length - 1)) * w);
  const y = (v) => padY + h - (v / max) * h;
  const pts = series.map((s, i) => [x(i), y(s.total)]);
  const d = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p[0]} ${p[1]}`;
    const prev = pts[i - 1];
    const cx = (prev[0] + p[0]) / 2;
    return acc + ` C ${cx} ${prev[1]}, ${cx} ${p[1]}, ${p[0]} ${p[1]}`;
  }, '');
  const area = d + ` L ${pts[pts.length - 1][0]} ${padY + h} L ${pts[0][0]} ${padY + h} Z`;

  return (
    <svg width={width} height={height} style={{ display: 'block', width: '100%', height }}>
      <defs>
        <linearGradient id="area-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t, i) => (
        <line key={i} x1={padX} x2={width - padX} y1={padY + h - t * h} y2={padY + h - t * h}
          stroke="var(--line)" strokeWidth="1" strokeDasharray={i === 1 ? '2 3' : ''} opacity={i === 1 ? 0.7 : 0.5} />
      ))}
      <path d={area} fill="url(#area-g)" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="var(--bg)" stroke="var(--accent)" strokeWidth="1.5" />
      ))}
    </svg>
  );
}
