import { useState, useMemo, useRef } from 'react';
import { CATEGORIES, CAT_BY_ID, eur, fmtDate, totalsByCategory, dailyTotals, quickStats } from './data.js';
import { CategoryChip, TextInput, IconBtn, Icons, BudgetBar } from './ui.jsx';
import { Donut, Bars, Area } from './charts.jsx';
import { AddExpenseForm } from './AddExpenseForm.jsx';
import { SubscriptionsView } from './SubscriptionsPage.jsx';
import { MonthlyOverviewPage } from './MonthlyOverviewPage.jsx';

export function MobileApp({ store, subStore, tweaks, budget, setBudget, onLogout }) {
  const [tab, setTab] = useState('home');
  const [editing, setEditing] = useState(null);
  const [budgetOpen, setBudgetOpen] = useState(false);

  const stats = quickStats(store.items);
  const byCat = totalsByCategory(store.items);
  const catData = CATEGORIES.map(c => ({ id: c.id, label: c.label, hue: c.hue, value: byCat[c.id] || 0 }))
    .sort((a, b) => b.value - a.value);
  const series = dailyTotals(store.items);
  const recent = store.items.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', color: 'var(--ink-1)', fontFamily: 'var(--font-ui)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {onLogout && (
        <button onClick={onLogout} style={{
          position: 'fixed', top: 12, left: 14, zIndex: 200,
          appearance: 'none', border: '1px solid var(--line)',
          background: 'var(--surface)', color: 'var(--ink-3)',
          fontSize: 11, fontFamily: 'var(--font-ui)',
          padding: '5px 9px', borderRadius: 7, cursor: 'pointer',
        }}>
          Sign out
        </button>
      )}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'home' && (
          <MobileHome stats={stats} catData={catData} series={series}
            chartType={tweaks.chartType} recent={recent} budget={budget}
            onSeeAll={() => setTab('list')} onTap={setEditing}
            onBudgetTap={() => setBudgetOpen(true)} />
        )}
        {tab === 'list' && <MobileList store={store} onTap={setEditing} />}
        {tab === 'subscriptions' && <SubscriptionsView subStore={subStore} mobile />}
        {tab === 'monthly' && <MonthlyOverviewPage store={store} subStore={subStore} mobile />}
        {tab === 'add' && (
          <MobileAdd
            onSubmit={async (e) => { await store.add(e); setTab('home'); }}
            onCancel={() => setTab('home')}
          />
        )}
      </div>

      {/* Bottom tab bar */}
      <nav style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr auto 1fr 1fr',
        alignItems: 'center', gap: 4, padding: '10px 12px 28px',
        borderTop: '1px solid var(--line)', background: 'var(--bg)',
      }}>
        <TabButton label="Overview" active={tab === 'home'} onClick={() => setTab('home')}
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 8l6-5 6 5v7H3V8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>} />

        <TabButton label="Subscriptions" active={tab === 'subscriptions'} onClick={() => setTab('subscriptions')}
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M6 8h6M6 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>} />

        <button onClick={() => setTab('add')} style={{
          appearance: 'none', border: 0, cursor: 'pointer',
          width: 48, height: 48, borderRadius: 999,
          background: 'var(--accent)', color: 'var(--accent-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px -2px var(--accent-shadow)',
          transform: tab === 'add' ? 'scale(0.92)' : 'scale(1)',
          transition: 'transform .15s',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>

        <TabButton label="Expenses" active={tab === 'list'} onClick={() => setTab('list')}
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 4h12M3 9h12M3 14h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>} />

        <TabButton label="Monthly" active={tab === 'monthly'} onClick={() => setTab('monthly')}
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 3V2M13 3V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M5 9h2v3H5zM8 7h2v5H8zM11 10h2v2h-2z" fill="currentColor" opacity=".7"/></svg>} />
      </nav>

      {editing && (
        <MobileEditSheet expense={editing}
          onSave={async (patch) => { await store.update(editing.id, patch); setEditing(null); }}
          onClose={() => setEditing(null)}
          onDelete={async () => { await store.remove(editing.id); setEditing(null); }} />
      )}
      {budgetOpen && (
        <BudgetSheet budget={budget} setBudget={setBudget} onClose={() => setBudgetOpen(false)} />
      )}
    </div>
  );
}

function TabButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      color: active ? 'var(--ink-1)' : 'var(--ink-3)', padding: '4px 8px',
    }}>
      {icon}
      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.02em' }}>{label}</span>
    </button>
  );
}

function MobileHome({ stats, catData, series, chartType, recent, budget, onSeeAll, onTap, onBudgetTap }) {
  const now = new Date();
  const monthLabel = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <div style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          {monthLabel}
        </div>
        <div style={{ fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {eur(stats.total)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
          spent across {stats.count} transactions
        </div>
      </header>

      <button onClick={onBudgetTap} style={{
        appearance: 'none', border: '1px solid var(--line)', borderRadius: 'var(--card-radius)',
        background: 'var(--surface)', padding: 'var(--card-pad)', cursor: 'pointer',
        width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit',
      }}>
        <BudgetBar spent={stats.total} budget={budget} />
        <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 8, textAlign: 'center', letterSpacing: '0.04em' }}>
          Tap to set budget
        </div>
      </button>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <MiniStat label="Avg / day" value={eur(stats.avgPerDay, { compact: true })} />
        <MiniStat label="Biggest" value={stats.biggest ? eur(stats.biggest.amount, { compact: true }) : '—'} sub={stats.biggest?.description} />
      </section>

      <section style={{ padding: 'var(--card-pad)', border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500 }}>By category</div>
        {chartType === 'donut'
          ? <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Donut data={catData} size={160} thickness={16} label="Total" sublabel={eur(stats.total, { compact: true })} />
            </div>
          : <Bars data={catData} />}
      </section>

      <section style={{ padding: 'var(--card-pad)', border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 500 }}>Daily spend</div>
        <Area series={series} width={310} height={110} />
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Recent</h2>
          <button onClick={onSeeAll} style={{
            appearance: 'none', border: 0, background: 'transparent', font: 'inherit',
            color: 'var(--ink-2)', fontSize: 11, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>See all {Icons.arrowR}</button>
        </div>
        <ExpenseCardList items={recent} onTap={onTap} />
      </section>
    </div>
  );
}

function MiniStat({ label, value, sub }) {
  return (
    <div style={{ padding: 'var(--card-pad)', border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontSize: 18, fontWeight: 500 }}>{value}</span>
      {sub && <span style={{ fontSize: 10, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>}
    </div>
  );
}

function ExpenseCardList({ items, onTap }) {
  if (!items.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'var(--card-radius)', color: 'var(--ink-3)', fontSize: 12 }}>
        No expenses yet.
      </div>
    );
  }
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', background: 'var(--surface)', overflow: 'hidden' }}>
      {items.map((e, i) => (
        <button key={e.id} onClick={() => onTap?.(e)} style={{
          appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
          width: '100%', textAlign: 'left', padding: 'var(--row-pad)',
          borderTop: i === 0 ? 0 : '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 12,
          color: 'var(--ink-1)', font: 'inherit',
        }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: `oklch(var(--cat-l) var(--cat-c) ${CAT_BY_ID[e.category]?.hue})`,
            opacity: 0.85,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-ink)', fontSize: 11, fontWeight: 600,
          }}>{CAT_BY_ID[e.category]?.label[0]}</span>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {e.description || CAT_BY_ID[e.category]?.label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              {fmtDate(e.date, { style: 'day' })} · {CAT_BY_ID[e.category]?.label}
            </span>
          </span>
          <span style={{ fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 500 }}>
            {eur(e.amount)}
          </span>
        </button>
      ))}
    </div>
  );
}

function MobileList({ store, onTap }) {
  const counts = useMemo(() => {
    const c = { all: store.items.length };
    for (const e of store.items) c[e.category] = (c[e.category] || 0) + 1;
    return c;
  }, [store.items]);

  return (
    <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <div style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>All transactions</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>Expenses</h1>
      </header>
      <TextInput value={store.query} onChange={store.setQuery} placeholder="Search…" />
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', margin: '0 -20px', padding: '0 20px 4px' }}>
        <CategoryChip id="all" active={store.filter === 'all'} onClick={() => store.setFilter('all')} count={counts.all} />
        {CATEGORIES.map(c => (
          <CategoryChip key={c.id} id={c.id} active={store.filter === c.id} onClick={() => store.setFilter(c.id)} count={counts[c.id] || 0} />
        ))}
      </div>
      <ExpenseCardList items={store.filtered} onTap={onTap} />
    </div>
  );
}

function MobileAdd({ onSubmit, onCancel }) {
  return (
    <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <div style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>New transaction</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>Add expense</h1>
      </header>
      <AddExpenseForm onSubmit={onSubmit} onCancel={onCancel} />
    </div>
  );
}

function MobileEditSheet({ expense, onSave, onClose, onDelete }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: 'var(--bg)', color: 'var(--ink-1)',
        borderTopLeftRadius: 18, borderTopRightRadius: 18,
        padding: '20px 20px 28px',
        maxHeight: '88%', overflowY: 'auto',
        animation: 'sheet-up .25s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>Edit expense</h2>
          <IconBtn onClick={onClose}>{Icons.close}</IconBtn>
        </div>
        <AddExpenseForm initial={expense} onSubmit={onSave} submitLabel="Save changes" />
        <button onClick={onDelete} style={{
          appearance: 'none', border: '1px solid var(--line)', background: 'transparent',
          color: '#d24a3d', font: 'inherit', fontSize: 13,
          padding: '12px', borderRadius: 'var(--btn-radius)', cursor: 'pointer',
          width: '100%', marginTop: 12,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          {Icons.trash} Delete expense
        </button>
      </div>
    </div>
  );
}

function BudgetSheet({ budget, setBudget, onClose }) {
  const [draft, setDraft] = useState(String(budget));
  const [saved, setSaved] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = parseFloat(draft);
    if (!isNaN(n) && n >= 0) {
      setBudget(n);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 900);
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: 'var(--bg)', color: 'var(--ink-1)',
        borderTopLeftRadius: 18, borderTopRightRadius: 18,
        padding: '20px 20px 36px',
        animation: 'sheet-up .25s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>Monthly budget</h2>
          <IconBtn onClick={onClose}>{Icons.close}</IconBtn>
        </div>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--ink-3)' }}>
          Set how much you aim to spend each month.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--ink-3)', fontSize: 14, pointerEvents: 'none',
            }}>€</span>
            <input
              ref={inputRef}
              type="number" min="0" step="any"
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setSaved(false); }}
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: 28, paddingRight: 12, paddingTop: 12, paddingBottom: 12,
                border: '1px solid var(--line)', borderRadius: 'var(--btn-radius)',
                background: 'var(--surface)', color: 'var(--ink-1)',
                font: 'inherit', fontSize: 16,
                outline: 'none',
              }}
            />
          </div>
          <button type="submit" style={{
            appearance: 'none', border: 0, cursor: 'pointer',
            padding: '13px', borderRadius: 'var(--btn-radius)',
            background: saved ? 'var(--surface)' : 'var(--accent)',
            color: saved ? 'var(--ink-2)' : 'var(--accent-ink)',
            font: 'inherit', fontSize: 14, fontWeight: 500,
            transition: 'background .15s, color .15s',
          }}>
            {saved ? 'Saved!' : 'Set budget'}
          </button>
        </form>
      </div>
    </div>
  );
}
