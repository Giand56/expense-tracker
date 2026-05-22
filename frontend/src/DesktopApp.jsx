import { useState, useMemo } from 'react';
import { CATEGORIES, CAT_BY_ID, eur, fmtDate, totalsByCategory, dailyTotals, quickStats } from './data.js';
import { Stat, CategoryDot, CategoryChip, TextInput, Button, IconBtn, Icons, BudgetBar } from './ui.jsx';
import { Donut, Bars, Area } from './charts.jsx';
import { AddExpenseForm } from './AddExpenseForm.jsx';
import { SubscriptionsView } from './SubscriptionsPage.jsx';
import { MonthlyOverviewPage } from './MonthlyOverviewPage.jsx';

export function DesktopApp({ store, subStore, tweaks, budget, setBudget, onLogout }) {
  const [view, setView] = useState('dashboard');
  const [editing, setEditing] = useState(null);

  const stats = quickStats(store.items);
  const byCat = totalsByCategory(store.items);
  const catData = CATEGORIES.map(c => ({ id: c.id, label: c.label, hue: c.hue, value: byCat[c.id] || 0 }))
    .sort((a, b) => b.value - a.value);
  const series = dailyTotals(store.items);
  const recent = store.items.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const handleAdd = async (e) => { await store.add(e); setView('dashboard'); };
  const handleEdit = async (patch) => { await store.update(editing.id, patch); setEditing(null); };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100%', background: 'var(--bg)', color: 'var(--ink-1)', fontFamily: 'var(--font-ui)' }}>
      {/* Sidebar */}
      <aside style={{ borderRight: '1px solid var(--line)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px' }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-ink)', fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-num)',
          }}>€</div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Ledger</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { id: 'dashboard',     label: 'Dashboard'     },
            { id: 'list',          label: 'Expenses'      },
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'monthly',       label: 'Monthly'       },
            { id: 'add',           label: 'Add'           },
            { id: 'settings',      label: 'Settings'      },
          ].map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              style={{
                appearance: 'none', cursor: 'pointer', font: 'inherit', textAlign: 'left',
                padding: '8px 10px', borderRadius: 7, border: 'none',
                background: view === item.id ? 'var(--surface-hover)' : 'transparent',
                color: view === item.id ? 'var(--ink-1)' : 'var(--ink-2)',
                fontSize: 13, fontWeight: view === item.id ? 500 : 400,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
              <span>{item.label}</span>
              {item.id === 'list' && (
                <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-num)' }}>{store.items.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '12px 10px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <BudgetBar spent={stats.total} budget={budget} />
          {onLogout && (
            <button onClick={onLogout} style={{
              appearance: 'none', cursor: 'pointer', font: 'inherit', textAlign: 'left',
              padding: '7px 10px', borderRadius: 7, border: 'none',
              background: 'transparent', color: 'var(--ink-3)', fontSize: 12,
            }}>
              Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ overflow: 'auto', padding: '32px 40px 48px' }}>
        {view === 'dashboard' && (
          <DashboardView
            stats={stats} catData={catData} series={series}
            chartType={tweaks.chartType} recent={recent} budget={budget}
            onAddClick={() => setView('add')} onSeeAll={() => setView('list')}
          />
        )}
        {view === 'list' && (
          <ListView store={store} onEdit={setEditing} onAddClick={() => setView('add')} />
        )}
        {view === 'add' && (
          <AddView onSubmit={handleAdd} onCancel={() => setView('dashboard')} />
        )}
        {view === 'subscriptions' && (
          <SubscriptionsView subStore={subStore} />
        )}
        {view === 'monthly' && (
          <MonthlyOverviewPage store={store} subStore={subStore} />
        )}
        {view === 'settings' && (
          <SettingsView budget={budget} setBudget={setBudget} />
        )}
      </main>

      {editing && (
        <EditModal expense={editing} onClose={() => setEditing(null)}
          onSave={handleEdit}
          onDelete={async () => { await store.remove(editing.id); setEditing(null); }} />
      )}
    </div>
  );
}

function DashboardView({ stats, catData, series, chartType, recent, budget, onAddClick, onSeeAll }) {
  const now = new Date();
  const monthLabel = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 920 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            {monthLabel}
          </div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>Overview</h1>
        </div>
        <Button variant="accent" size="md" onClick={onAddClick}>{Icons.plus} Add expense</Button>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, padding: 'var(--card-pad)', border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', background: 'var(--surface)' }}>
        <Stat label="Total spent"  value={eur(stats.total)}        sub={`${stats.count} transactions`} />
        <Stat label="Avg per day"  value={eur(stats.avgPerDay)}    sub="across active days" />
        <Stat label="Biggest"      value={stats.biggest ? eur(stats.biggest.amount) : '—'} sub={stats.biggest?.description} />
        <Stat label="Remaining"    value={eur(Math.max(0, budget - stats.total))} sub={`of ${eur(budget, { compact: true })} budget`} accent="var(--accent)" />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="By category" subtitle={chartType === 'donut' ? 'Share of spend' : 'Amount per category'}>
          {chartType === 'donut'
            ? <Donut data={catData} label="Total" sublabel={eur(stats.total, { compact: true })} />
            : <Bars data={catData} />}
        </Card>
        <Card title="Daily spend" subtitle={monthLabel}>
          <Area series={series} />
        </Card>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em' }}>Recent</h2>
          <button onClick={onSeeAll} style={{
            appearance: 'none', border: 0, background: 'transparent', font: 'inherit',
            cursor: 'pointer', color: 'var(--ink-2)', fontSize: 12,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>See all {Icons.arrowR}</button>
        </div>
        <ExpenseTable items={recent} />
      </section>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-1)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ExpenseTable({ items, onEdit, onDelete }) {
  if (!items.length) {
    return (
      <div style={{ padding: 32, textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'var(--card-radius)', color: 'var(--ink-3)', fontSize: 13 }}>
        No expenses match.
      </div>
    );
  }
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', background: 'var(--surface)', overflow: 'hidden' }}>
      {items.map((e, i) => (
        <div key={e.id} style={{
          display: 'grid',
          gridTemplateColumns: `92px 1fr 140px 100px${onEdit ? ' auto' : ''}`,
          alignItems: 'center', gap: 16, padding: 'var(--row-pad)',
          borderTop: i === 0 ? 0 : '1px solid var(--line)', fontSize: 13,
        }}>
          <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
            {fmtDate(e.date)}
          </span>
          <span style={{ color: 'var(--ink-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {e.description || <span style={{ color: 'var(--ink-3)' }}>—</span>}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ink-2)' }}>
            <CategoryDot id={e.category} />
            {CAT_BY_ID[e.category]?.label}
          </span>
          <span style={{ textAlign: 'right', color: 'var(--ink-1)', fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
            {eur(e.amount)}
          </span>
          {onEdit && (
            <div style={{ display: 'flex', gap: 2 }}>
              <IconBtn onClick={() => onEdit(e)} title="Edit">{Icons.edit}</IconBtn>
              <IconBtn onClick={() => onDelete(e.id)} title="Delete">{Icons.trash}</IconBtn>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ListView({ store, onEdit, onAddClick }) {
  const counts = useMemo(() => {
    const c = { all: store.items.length };
    for (const e of store.items) c[e.category] = (c[e.category] || 0) + 1;
    return c;
  }, [store.items]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 920 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>All transactions</div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>Expenses</h1>
        </div>
        <Button variant="accent" onClick={onAddClick}>{Icons.plus} Add expense</Button>
      </header>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <CategoryChip id="all" active={store.filter === 'all'} onClick={() => store.setFilter('all')} count={counts.all} />
          {CATEGORIES.map(c => (
            <CategoryChip key={c.id} id={c.id} active={store.filter === c.id} onClick={() => store.setFilter(c.id)} count={counts[c.id] || 0} />
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 280, marginLeft: 'auto' }}>
          <TextInput value={store.query} onChange={store.setQuery} placeholder="Search description…" />
        </div>
      </div>

      <ExpenseTable items={store.filtered} onEdit={onEdit} onDelete={store.remove} />
    </div>
  );
}

function AddView({ onSubmit, onCancel }) {
  return (
    <div style={{ maxWidth: 460 }}>
      <header style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>New transaction</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>Add expense</h1>
      </header>
      <AddExpenseForm onSubmit={onSubmit} onCancel={onCancel} />
    </div>
  );
}

function SettingsView({ budget, setBudget }) {
  const [draft, setDraft] = useState(String(budget));
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = parseFloat(draft);
    if (!isNaN(n) && n >= 0) {
      setBudget(n);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  };

  return (
    <div style={{ maxWidth: 460 }}>
      <header style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Preferences</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>Settings</h1>
      </header>

      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', background: 'var(--surface)' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Monthly budget</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 16 }}>Set how much you aim to spend per month.</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--ink-3)', fontSize: 13, pointerEvents: 'none',
            }}>€</span>
            <input
              type="number" min="0" step="any"
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setSaved(false); }}
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: 24, paddingRight: 10, paddingTop: 8, paddingBottom: 8,
                border: '1px solid var(--line)', borderRadius: 'var(--btn-radius)',
                background: 'var(--bg)', color: 'var(--ink-1)',
                font: 'inherit', fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
          <Button type="submit" variant={saved ? 'default' : 'accent'} size="md">
            {saved ? 'Saved' : 'Save'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function EditModal({ expense, onSave, onClose, onDelete }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(2px)',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 420, background: 'var(--bg)', color: 'var(--ink-1)',
        border: '1px solid var(--line)', borderRadius: 'var(--card-radius)',
        padding: 28, boxShadow: '0 30px 60px -20px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>Edit expense</h2>
          <IconBtn onClick={onClose}>{Icons.close}</IconBtn>
        </div>
        <AddExpenseForm initial={expense} onSubmit={onSave} onCancel={onDelete} submitLabel="Save changes" />
        <div style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', marginTop: 12 }}>
          Cancel button deletes this expense
        </div>
      </div>
    </div>
  );
}
