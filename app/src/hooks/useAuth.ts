import { useState, useEffect, useCallback } from 'react';
import type { AuthSession } from '@/types';
import { getSession, clearSession, setSession } from '@/lib/store';

export function useAuth() {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    setSessionState(s);
    setLoading(false);
  }, []);

  const login = useCallback((session: AuthSession) => {
    setSession(session);
    setSessionState(session);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
    window.location.href = '/';
  }, []);

  const isAdmin = session?.role === 'admin';
  const isUser = session?.role === 'user';

  return { session, loading, login, logout, isAdmin, isUser };
}
