import { useState, useEffect } from 'react';
import * as api from './api.js';

export function useSubscriptionStore() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchSubscriptions()
      .then(data => setItems(data.map(normalise)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const byDate = (a, b) => a.next_billing_date.localeCompare(b.next_billing_date);

  const add = async (payload) => {
    const created = await api.createSubscription(payload);
    setItems(prev => [...prev, normalise(created)].sort(byDate));
  };

  const update = async (id, payload) => {
    const updated = await api.updateSubscription(id, payload);
    setItems(prev => prev.map(s => s.id === id ? normalise(updated) : s).sort(byDate));
  };

  const remove = async (id) => {
    await api.deleteSubscription(id);
    setItems(prev => prev.filter(s => s.id !== id));
  };

  return { items, add, update, remove, loading };
}

function normalise(s) {
  return { ...s, id: String(s.id), amount: Number(s.amount) };
}
