'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User, Partner } from '@/types';

interface SessionState {
  user: User | null;
  partner: Partner | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    user: null,
    partner: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/partners/auth/session');
      if (res.ok) {
        const data = await res.json();
        setState({
          user: data.user,
          partner: data.partner,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          partner: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch {
      setState({
        user: null,
        partner: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/partners/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setState({
          user: data.user,
          partner: data.partner,
          isLoading: false,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await fetch('/api/partners/auth/logout', { method: 'POST' });
    setState({
      user: null,
      partner: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const refresh = () => {
    fetchSession();
  };

  return {
    ...state,
    login,
    logout,
    refresh,
  };
}
