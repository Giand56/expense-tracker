export const CATEGORIES = [
  { id: 'food',          label: 'Food',          hue: 25  },
  { id: 'transport',     label: 'Transport',     hue: 220 },
  { id: 'rent',          label: 'Rent',          hue: 280 },
  { id: 'entertainment', label: 'Entertainment', hue: 150 },
  { id: 'other',         label: 'Other',         hue: 60  },
];

export const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export const eur = (n, opts = {}) => {
  const { compact = false } = opts;
  const v = Number(n) || 0;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(v);
};

export const fmtDate = (iso, opts = {}) => {
  const { style = 'short' } = opts;
  const d = new Date(iso + 'T12:00:00');
  if (style === 'long') return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  if (style === 'day')  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export function totalsByCategory(expenses) {
  const map = Object.fromEntries(CATEGORIES.map(c => [c.id, 0]));
  for (const e of expenses) map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
  return map;
}

export function dailyTotals(expenses) {
  const map = {};
  for (const e of expenses) map[e.date] = (map[e.date] || 0) + Number(e.amount || 0);
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([date, total]) => ({ date, total }));
}

export function quickStats(expenses) {
  const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const days = new Set(expenses.map(e => e.date)).size || 1;
  const avgPerDay = total / days;
  const biggest = expenses.reduce((b, e) => (Number(e.amount) > Number(b?.amount || 0) ? e : b), null);
  return { total, avgPerDay, biggest, count: expenses.length };
}
