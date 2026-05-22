import { useState, useCallback } from 'react';
import { loginUser, registerUser } from './api.js';

const TOKEN_KEY = 'ledger-token';

export function useAuthStore() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { access_token } = await loginUser({ email, password });
      localStorage.setItem(TOKEN_KEY, access_token);
      setToken(access_token);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { access_token } = await registerUser({ email, password });
      localStorage.setItem(TOKEN_KEY, access_token);
      setToken(access_token);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return { token, login, register, logout, error, loading, isAuthenticated: !!token };
}
