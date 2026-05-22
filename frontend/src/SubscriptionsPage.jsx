import { useState } from 'react';
import { CATEGORIES, CAT_BY_ID, eur, fmtDate, todayISO } from './data.js';
import { Field, TextInput, CategoryChip, CategoryDot, Button, IconBtn, Icons } from './ui.jsx';

// ── date helpers ─────────────────────────────────────────────────────────────

function addMonthsISO(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const total = m - 1 + n;
  const ny = y + Math.floor(total / 12);
  const nm = (total % 12) + 1;
  const maxD = new Date(ny, nm, 0).getDate();
  return `${ny}-${String(nm).padStart(2, '0')}-${String(Math.min(d, maxD)).padStart(2, '0')}`;
}

function addYearsISO(iso, n) {
  const [y, m, d] = iso.split('-');
  return `${Number(y) + n}-${m}-${d}`;
}

function effectiveDate(next_billing_date, billing_cycle) {
  const today = todayISO();
  let d = next_billing_date;
  while (d < today) {
    d = billing_cycle === 'monthly' ? addMonthsISO(d, 1) : addYearsISO(d, 1);
  }
  return d;
}

function daysUntil(iso) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}

function dueSoonLabel(days) {
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

// ── form ─────────────────────────────────────────────────────────────────────

function SubscriptionForm({ initial, onSubmit, onCancel, submitLabel = 'Add subscription' }) {
  const [name, setName] = useState(initial?.name || '');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [category, setCategory] = useState(initial?.category || 'other');
  const [cycle, setCycle] = useState(initial?.billing_cycle || 'monthly');
  const [startDate, setStartDate] = useState(initial?._effectiveDate || initial?.next_billing_date || todayISO());

  const isValid = name.trim().length > 0 && parseFloat(amount) > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ name: name.trim(), amount: parseFloat(amount), category, billing_cycle: cycle, start_date: startDate });
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Name">
        <TextInput value={name} onChange={setName} placeholder="Netflix, Spotify, iCloud…" autoFocus />
      </Field>
      <Field label="Amount">
        <TextInput value={amount} onChange={setAmount} placeholder="0,00" inputMode="decimal" prefix="€" />
      </Field>
      <Field label="Category">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIES.map(c => (
            <CategoryChip key={c.id} id={c.id} active={category === c.id} onClick={() => setCategory(c.id)} />
          ))}
        </div>
      </Field>
      <Field label="Billing cycle">
        <div style={{ display: 'flex', gap: 6 }}>
          {['monthly', 'yearly'].map(c => (
            <button key={c} type="button" onClick={() => setCycle(c)} style={{
              flex: 1, appearance: 'none', cursor: 'pointer', font: 'inherit',
              padding: '8px 12px', fontSize: 13, borderRadius: 'var(--btn-radius)',
              border: '1px solid',
              borderColor: cycle === c ? 'var(--ink-1)' : 'var(--line)',
              background: cycle === c ? 'var(--ink-1)' : 'transparent',
              color: cycle === c ? 'var(--bg)' : 'var(--ink-2)',
              transition: 'all .12s',
            }}>
              {c === 'monthly' ? 'Monthly' : 'Yearly'}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Next billing date">
        <TextInput value={startDate} onChange={setStartDate} type="date" />
      </Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {onCancel && <Button variant="secondary" onClick={onCancel} size="lg" style={{ flex: 1 }}>Cancel</Button>}
        <Button type="submit" variant="accent" size="lg"
          style={{ flex: 2, opacity: isValid ? 1 : 0.5, pointerEvents: isValid ? 'auto' : 'none' }}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ── subscription row (desktop table) ────────────────────────────────────────

function SubRow({ sub, onEdit }) {
  const days = daysUntil(sub._effectiveDate);
  const soon = days >= 0 && days <= 7;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '100px 1fr 140px 80px 110px auto',
      alignItems: 'center', gap: 16, padding: 'var(--row-pad)',
      fontSize: 13, borderTop: '1px solid var(--line)',
      background: soon ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'transparent',
    }}>
      <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-num)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
        {fmtDate(sub._effectiveDate)}
      </span>
      <span style={{ color: 'var(--ink-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
        {sub.name}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ink-2)' }}>
        <CategoryDot id={sub.category} />
        {CAT_BY_ID[sub.category]?.label}
      </span>
      <span style={{ textAlign: 'right', fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
        {eur(sub.amount)}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          fontSize: 11, padding: '2px 7px', borderRadius: 99,
          background: 'var(--surface-hover)', color: 'var(--ink-2)',
        }}>
          {sub.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}
        </span>
        {soon && (
          <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500 }}>
            {dueSoonLabel(days)}
          </span>
        )}
      </span>
      <IconBtn onClick={() => onEdit(sub)} title="Edit">{Icons.edit}</IconBtn>
    </div>
  );
}

// ── subscription card (mobile list) ─────────────────────────────────────────

function SubCard({ sub, onTap }) {
  const days = daysUntil(sub._effectiveDate);
  const soon = days >= 0 && days <= 7;
  return (
    <button onClick={() => onTap?.(sub)} style={{
      appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
      width: '100%', textAlign: 'left', padding: 'var(--row-pad)',
      borderTop: '1px solid var(--line)',
      display: 'flex', alignItems: 'center', gap: 12,
      color: 'var(--ink-1)', font: 'inherit',
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: `oklch(var(--cat-l) var(--cat-c) ${CAT_BY_ID[sub.category]?.hue ?? 60})`,
        opacity: 0.85,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent-ink)', fontSize: 11, fontWeight: 600,
      }}>{sub.name[0]?.toUpperCase()}</span>
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sub.name}
        </span>
        <span style={{ fontSize: 11, color: soon ? 'var(--accent)' : 'var(--ink-3)' }}>
          {soon ? dueSoonLabel(days) : fmtDate(sub._effectiveDate)} · {sub.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}
        </span>
      </span>
      <span style={{ fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 500 }}>
        {eur(sub.amount)}
      </span>
    </button>
  );
}

// ── edit modal (desktop) ────────────────────────────────────────────────────

function EditSubModal({ sub, onSave, onClose, onDelete }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 420, background: 'var(--bg)', color: 'var(--ink-1)',
        border: '1px solid var(--line)', borderRadius: 'var(--card-radius)',
        padding: 28, boxShadow: '0 30px 60px -20px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>Edit subscription</h2>
          <IconBtn onClick={onClose}>{Icons.close}</IconBtn>
        </div>
        <SubscriptionForm initial={sub} onSubmit={onSave} submitLabel="Save changes" />
        <button onClick={onDelete} style={{
          appearance: 'none', border: '1px solid var(--line)', background: 'transparent',
          color: '#d24a3d', font: 'inherit', fontSize: 13,
          padding: '10px', borderRadius: 'var(--btn-radius)', cursor: 'pointer',
          width: '100%', marginTop: 12,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          {Icons.trash} Delete subscription
        </button>
      </div>
    </div>
  );
}

// ── edit sheet (mobile) ──────────────────────────────────────────────────────

function EditSubSheet({ sub, onSave, onClose, onDelete }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: 'var(--bg)', color: 'var(--ink-1)',
        borderTopLeftRadius: 18, borderTopRightRadius: 18,
        padding: '20px 20px 32px', maxHeight: '90%', overflowY: 'auto',
        animation: 'sheet-up .25s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>Edit subscription</h2>
          <IconBtn onClick={onClose}>{Icons.close}</IconBtn>
        </div>
        <SubscriptionForm initial={sub} onSubmit={onSave} submitLabel="Save changes" />
        <button onClick={onDelete} style={{
          appearance: 'none', border: '1px solid var(--line)', background: 'transparent',
          color: '#d24a3d', font: 'inherit', fontSize: 13,
          padding: '12px', borderRadius: 'var(--btn-radius)', cursor: 'pointer',
          width: '100%', marginTop: 12,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          {Icons.trash} Delete subscription
        </button>
      </div>
    </div>
  );
}

// ── add sheet (mobile) ───────────────────────────────────────────────────────

function AddSubSheet({ onSubmit, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: 'var(--bg)', color: 'var(--ink-1)',
        borderTopLeftRadius: 18, borderTopRightRadius: 18,
        padding: '20px 20px 32px', maxHeight: '90%', overflowY: 'auto',
        animation: 'sheet-up .25s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>New subscription</h2>
          <IconBtn onClick={onClose}>{Icons.close}</IconBtn>
        </div>
        <SubscriptionForm onSubmit={onSubmit} onCancel={onClose} />
      </div>
    </div>
  );
}

// ── main exported view ───────────────────────────────────────────────────────

export function SubscriptionsView({ subStore, mobile = false }) {
  const [mode, setMode] = useState('list'); // 'list' | 'add'
  const [editing, setEditing] = useState(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const items = subStore.items.map(s => ({
    ...s,
    _effectiveDate: effectiveDate(s.next_billing_date, s.billing_cycle),
  })).sort((a, b) => a._effectiveDate.localeCompare(b._effectiveDate));

  const dueSoon = items.filter(s => { const d = daysUntil(s._effectiveDate); return d >= 0 && d <= 7; });

  const monthlyTotal = items.reduce((sum, s) =>
    sum + (s.billing_cycle === 'monthly' ? s.amount : s.amount / 12), 0);
  const yearlyTotal = items.reduce((sum, s) =>
    sum + (s.billing_cycle === 'yearly' ? s.amount : s.amount * 12), 0);

  const handleAdd = async (data) => {
    await subStore.add(data);
    setMode('list');
    setAddSheetOpen(false);
  };

  const handleEdit = async (data) => {
    await subStore.update(editing.id, data);
    setEditing(null);
  };

  const handleDelete = async () => {
    await subStore.remove(editing.id);
    setEditing(null);
  };

  // Desktop: show add form as a full-area view
  if (mode === 'add' && !mobile) {
    return (
      <div style={{ maxWidth: 460 }}>
        <header style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>New subscription</div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>Add subscription</h1>
        </header>
        <SubscriptionForm onSubmit={handleAdd} onCancel={() => setMode('list')} />
      </div>
    );
  }

  const pad = mobile ? '20px 20px 24px' : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 20 : 28, maxWidth: mobile ? undefined : 800, padding: mobile ? pad : undefined, position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: mobile ? 10 : 11, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Recurring
          </div>
          <h1 style={{ margin: 0, fontSize: mobile ? 26 : 32, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
            Subscriptions
          </h1>
        </div>
        {mobile ? (
          <button onClick={() => setAddSheetOpen(true)} style={{
            appearance: 'none', border: '1px solid var(--line)', background: 'var(--surface)',
            color: 'var(--ink-2)', font: 'inherit', fontSize: 12,
            padding: '7px 12px', borderRadius: 'var(--btn-radius)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>{Icons.plus} Add</button>
        ) : (
          <Button variant="accent" size="md" onClick={() => setMode('add')}>{Icons.plus} Add subscription</Button>
        )}
      </header>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(3, 1fr)',
        gap: mobile ? 10 : 16, padding: 'var(--card-pad)',
        border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', background: 'var(--surface)',
      }}>
        <StatItem label="Monthly" value={eur(monthlyTotal)} />
        <StatItem label="Yearly" value={eur(yearlyTotal, { compact: true })} />
        {!mobile && <StatItem label="Active" value={String(items.length)} sub="subscriptions" />}
      </div>

      {/* Due soon banner */}
      {dueSoon.length > 0 && (
        <div style={{
          padding: 'var(--card-pad)',
          border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
          borderRadius: 'var(--card-radius)',
          background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)' }}>
            Due soon
          </div>
          {dueSoon.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CategoryDot id={s.category} />
                <span style={{ fontWeight: 500 }}>{s.name}</span>
                <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>{dueSoonLabel(daysUntil(s._effectiveDate))}</span>
              </span>
              <span style={{ fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                {eur(s.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'var(--card-radius)', color: 'var(--ink-3)', fontSize: 13 }}>
          No subscriptions yet. Add your first one above.
        </div>
      ) : mobile ? (
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', background: 'var(--surface)', overflow: 'hidden' }}>
          {items.map((s, i) => (
            <div key={s.id} style={{ borderTop: i === 0 ? 0 : undefined }}>
              <SubCard sub={s} onTap={setEditing} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--card-radius)', background: 'var(--surface)', overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '100px 1fr 140px 80px 110px auto',
            gap: 16, padding: 'var(--row-pad)',
            fontSize: 11, color: 'var(--ink-3)', fontWeight: 500,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            borderBottom: '1px solid var(--line)',
          }}>
            <span>Next bill</span><span>Name</span><span>Category</span>
            <span style={{ textAlign: 'right' }}>Amount</span><span>Cycle</span><span />
          </div>
          {items.map(s => <SubRow key={s.id} sub={s} onEdit={setEditing} />)}
        </div>
      )}

      {/* Desktop edit modal */}
      {editing && !mobile && (
        <EditSubModal sub={editing} onSave={handleEdit} onClose={() => setEditing(null)} onDelete={handleDelete} />
      )}

      {/* Mobile sheets */}
      {editing && mobile && (
        <EditSubSheet sub={editing} onSave={handleEdit} onClose={() => setEditing(null)} onDelete={handleDelete} />
      )}
      {addSheetOpen && mobile && (
        <AddSubSheet onSubmit={handleAdd} onClose={() => setAddSheetOpen(false)} />
      )}
    </div>
  );
}

function StatItem({ label, value, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-num)', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--stat-size, 22px)', fontWeight: 500, letterSpacing: '-0.01em' }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{sub}</span>}
    </div>
  );
}
