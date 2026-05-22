import { useState, useEffect, useMemo } from 'react';
import * as api from './api.js';

export function useExpenseStore() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchExpenses()
      .then(data => setItems(data.map(normalise)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let xs = items.slice().sort((a, b) => b.date.localeCompare(a.date));
    if (filter !== 'all') xs = xs.filter(e => e.category === filter);
    const q = query.trim().toLowerCase();
    if (q) xs = xs.filter(e => (e.description || '').toLowerCase().includes(q));
    return xs;
  }, [items, filter, query]);

  const add = async (payload) => {
    const created = await api.createExpense(payload);
    setItems(prev => [normalise(created), ...prev]);
  };

  const update = async (id, patch) => {
    const existing = items.find(e => e.id === id);
    if (!existing) return;
    const updated = await api.updateExpense(id, { ...existing, ...patch });
    setItems(prev => prev.map(e => e.id === id ? normalise(updated) : e));
  };

  const remove = async (id) => {
    await api.deleteExpense(id);
    setItems(prev => prev.filter(e => e.id !== id));
  };

  return { items, filtered, filter, setFilter, query, setQuery, add, update, remove, loading };
}

function normalise(e) {
  return {
    ...e,
    id: String(e.id),
    amount: Number(e.amount),
    date: typeof e.date === 'string' ? e.date.slice(0, 10) : e.date,
  };
}
