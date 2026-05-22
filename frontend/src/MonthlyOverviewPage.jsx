import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { CATEGORIES, CAT_BY_ID, eur, fmtDate } from './data.js';
import { CategoryDot } from './ui.jsx';
import * as api from './api.js';

export function MonthlyOverviewPage({ store, subStore, mobile }) {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [includeSubs, setIncludeSubs] = useState(true);

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [catFilter, setCatFilter] = useState(null);

  useEffect(() => {
    api.fetchMonthlySummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const subMonthlyCats = useMemo(() => {
    const cats = {};
    for (const sub of subStore.items) {
      const monthly = sub.billing_cycle === 'yearly' ? sub.amount / 12 : sub.amount;
      cats[sub.category] = (cats[sub.category] || 0) + monthly;
    }
    return cats;
  }, [subStore.items]);

  const chartData = useMemo(() => {
    return summary.map(m => {
      const cats = { ...m.categories };
      let total = m.total;
      if (includeSubs) {
        for (const [cat, amt] of Object.entries(subMonthlyCats)) {
          cats[cat] = (cats[cat] || 0) + amt;
          total += amt;
        }
      }
      return {
        label: new Date(m.year, m.month - 1).toLocaleDateString('en-GB', { month: 'short' }),
        monthKey: `${m.year}-${String(m.month).padStart(2, '0')}`,
        total,
        ...cats,
      };
    });
  }, [summary, includeSubs, subMonthlyCats]);

  const avg = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((s, m) => s + (m.total || 0), 0) / chartData.length;
  }, [chartData]);

  const vsLastMonth = useMemo(() => {
    if (chartData.length < 2) return null;
    const curr = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];
    return (curr.total || 0) - (prev.total || 0);
  }, [chartData]);

  const selectedData = useMemo(
    () => chartData.find(m => m.monthKey === selectedMonth),
    [chartData, selectedMonth],
  );

  const monthExpenses = useMemo(
    () => store.items.filter(e => e.date.startsWith(selectedMonth)),
    [store.items, selectedMonth],
  );

  const filteredExpenses = useMemo(
    () => (catFilter ? monthExpenses.filter(e => e.category === catFilter) : monthExpenses),
    [monthExpenses, catFilter],
  );

  const top3 = useMemo(() => {
    if (!selectedData) return [];
    return CATEGORIES
      .map(c => ({ ...c, value: selectedData[c.id] || 0 }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [selectedData]);

  const monthOptions = useMemo(
    () => summary.map(m => ({
      value: `${m.year}-${String(m.month).padStart(2, '0')}`,
      label: new Date(m.year, m.month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    })).reverse(),
    [summary],
  );

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--ink-3)', fontSize: 13 }}>Loading...</div>;
  }

  const pad = mobile ? '20px 20px 24px' : '0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 920, padding: pad }}>
      <header>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Analytics</div>
        <h1 style={{ margin: 0, fontSize: mobile ? 26 : 32, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
          Monthly Overview
        </h1>
      </header>

      {/* Year Overview */}
      <section style={{ border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-1)' }}>Year at a glance</div>
            {vsLastMonth !== null && (
              <div style={{ fontSize: 12, marginTop: 3, color: vsLastMonth > 0 ? '#d24a3d' : '#3a8c5f', fontFamily: 'var(--font-num)' }}>
                {vsLastMonth > 0 ? '↑' : '↓'} {eur(Math.abs(vsLastMonth))} vs last month
              </div>
            )}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={includeSubs}
              onChange={e => setIncludeSubs(e.target.checked)}
              style={{ accentColor: 'var(--accent)', width: 14, height: 14 }}
            />
            Include subscriptions
          </label>
        </div>

        <div style={{ overflowX: mobile ? 'auto' : 'visible' }}>
          <div style={{ minWidth: mobile ? 560 : 'auto' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={18} margin={{ top: 4, right: 24, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--ink-3)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--ink-3)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `€${v}`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--line)', opacity: 0.5 }} />
                <ReferenceLine
                  y={avg}
                  stroke="var(--ink-3)"
                  strokeDasharray="4 3"
                  label={{ value: 'avg', position: 'right', fontSize: 10, fill: 'var(--ink-3)' }}
                />
                {CATEGORIES.map((cat, i) => (
                  <Bar
                    key={cat.id}
                    dataKey={cat.id}
                    stackId="a"
                    name={cat.label}
                    fill={`oklch(0.58 0.14 ${cat.hue})`}
                    radius={i === CATEGORIES.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: `oklch(0.58 0.14 ${cat.hue})`, flexShrink: 0 }} />
              {cat.label}
            </div>
          ))}
        </div>
      </section>

      {/* Month Detail */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em' }}>Month detail</h2>
          <select
            value={selectedMonth}
            onChange={e => { setSelectedMonth(e.target.value); setCatFilter(null); }}
            style={{
              appearance: 'none', border: '1px solid var(--line)', borderRadius: 6,
              background: 'var(--surface)', color: 'var(--ink-1)', font: 'inherit',
              padding: '6px 10px', cursor: 'pointer', fontSize: 12,
            }}
          >
            {monthOptions.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {selectedData && (
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
            <StatCard label="Total" value={eur(selectedData.total)} />
            {top3.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => setCatFilter(catFilter === cat.id ? null : cat.id)}
                style={{
                  appearance: 'none', cursor: 'pointer', font: 'inherit', textAlign: 'left',
                  border: `1px solid ${catFilter === cat.id ? 'var(--accent)' : 'var(--line)'}`,
                  borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)',
                  background: catFilter === cat.id ? 'color-mix(in srgb, var(--accent) 6%, var(--surface))' : 'var(--surface)',
                  color: 'inherit', display: 'flex', flexDirection: 'column', gap: 6,
                  transition: 'border-color .12s, background .12s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CategoryDot id={cat.id} />
                  <span style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    #{i + 1} {cat.label}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontSize: 18, fontWeight: 500 }}>
                  {eur(cat.value)}
                </div>
              </button>
            ))}
          </div>
        )}

        {catFilter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Filtered by</span>
            <button
              onClick={() => setCatFilter(null)}
              style={{
                appearance: 'none', border: '1px solid var(--accent)', borderRadius: 20,
                background: 'transparent', color: 'var(--accent)', font: 'inherit',
                fontSize: 11, padding: '2px 10px', cursor: 'pointer',
              }}
            >
              {CAT_BY_ID[catFilter]?.label} ×
            </button>
          </div>
        )}

        <MonthExpenseList items={filteredExpenses} mobile={mobile} />
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontSize: 22, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function MonthExpenseList({ items, mobile }) {
  if (!items.length) {
    return (
      <div style={{ padding: 32, textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'var(--card-radius)', color: 'var(--ink-3)', fontSize: 13 }}>
        No expenses for this period.
      </div>
    );
  }

  if (mobile) {
    return (
      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', background: 'var(--surface)', overflow: 'hidden' }}>
        {items.map((e, i) => (
          <div key={e.id} style={{
            borderTop: i === 0 ? 0 : '1px solid var(--line)',
            padding: 'var(--row-pad)', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.description || <span style={{ color: 'var(--ink-3)' }}>—</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                <CategoryDot id={e.category} size={6} />
                {CAT_BY_ID[e.category]?.label} · {fmtDate(e.date)}
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
              {eur(e.amount)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', background: 'var(--surface)', overflow: 'hidden' }}>
      {items.map((e, i) => (
        <div key={e.id} style={{
          display: 'grid', gridTemplateColumns: '92px 1fr 140px 100px',
          alignItems: 'center', gap: 16, padding: 'var(--row-pad)',
          borderTop: i === 0 ? 0 : '1px solid var(--line)', fontSize: 13,
        }}>
          <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-num)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
            {fmtDate(e.date)}
          </span>
          <span style={{ color: 'var(--ink-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {e.description || <span style={{ color: 'var(--ink-3)' }}>—</span>}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ink-2)' }}>
            <CategoryDot id={e.category} />
            {CAT_BY_ID[e.category]?.label}
          </span>
          <span style={{ textAlign: 'right', fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
            {eur(e.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  const nonZero = [...payload].reverse().filter(p => p.value > 0);
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8,
      padding: '10px 14px', fontSize: 12, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.3)',
    }}>
      <div style={{ fontWeight: 500, marginBottom: 8, color: 'var(--ink-1)' }}>
        {label} — {eur(total)}
      </div>
      {nonZero.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: 'var(--ink-2)', marginBottom: 3 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.fill, flexShrink: 0, display: 'inline-block' }} />
            {p.name}
          </span>
          <span style={{ fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>{eur(p.value)}</span>
        </div>
      ))}
    </div>
  );
}
