import { useState } from 'react';
import { CATEGORIES, todayISO } from './data.js';
import { Field, TextInput, CategoryChip, Button } from './ui.jsx';

export function AddExpenseForm({ initial, onSubmit, onCancel, submitLabel = 'Add expense' }) {
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [category, setCategory] = useState(initial?.category || 'food');
  const [description, setDescription] = useState(initial?.description || '');
  const [date, setDate] = useState(initial?.date || todayISO());

  const isValid = parseFloat(amount) > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ amount: parseFloat(amount), category, description: description.trim(), date });
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Amount">
        <TextInput value={amount} onChange={setAmount} placeholder="0,00" inputMode="decimal" prefix="€" autoFocus />
      </Field>

      <Field label="Category">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIES.map(c => (
            <CategoryChip key={c.id} id={c.id} active={category === c.id} onClick={() => setCategory(c.id)} />
          ))}
        </div>
      </Field>

      <Field label="Description" hint="Optional">
        <TextInput value={description} onChange={setDescription} placeholder="What was it for?" />
      </Field>

      <Field label="Date">
        <TextInput value={date} onChange={setDate} type="date" />
      </Field>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} size="lg" style={{ flex: 1 }}>Cancel</Button>
        )}
        <Button
          type="submit" variant="accent" size="lg"
          style={{ flex: 2, opacity: isValid ? 1 : 0.5, pointerEvents: isValid ? 'auto' : 'none' }}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
