const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('ledger-token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    if (!path.startsWith('/auth/')) {
      const hadToken = !!getToken();
      localStorage.removeItem('ledger-token');
      if (hadToken) {
        window.location.reload();
        return;
      }
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.status === 204 ? undefined : res.json();
}

// Auth
export async function loginUser(data) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function registerUser(data) {
  return request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// Expenses
export async function fetchExpenses() {
  return request('/expenses/');
}

export async function fetchMonthlySummary() {
  return request('/expenses/monthly-summary');
}

export async function createExpense(data) {
  return request('/expenses/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateExpense(id, data) {
  return request(`/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(id) {
  return request(`/expenses/${id}`, { method: 'DELETE' });
}

// Subscriptions
export async function fetchSubscriptions() {
  return request('/subscriptions/');
}

export async function createSubscription(data) {
  return request('/subscriptions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateSubscription(id, data) {
  return request(`/subscriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteSubscription(id) {
  return request(`/subscriptions/${id}`, { method: 'DELETE' });
}
