import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthState, User } from '@/types';
import { authAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo mode: mock auth when no backend is available
const DEMO_MODE = true;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem('focusdesk_user');
    if (stored) {
      const user = JSON.parse(stored) as User;
      setState({ user, isAuthenticated: true, isLoading: false });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      let user: User;
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 600));
        user = { _id: '1', name: 'Alex Johnson', email, token: 'demo-token' };
      } else {
        const { data } = await authAPI.login({ email, password });
        user = data;
      }
      localStorage.setItem('focusdesk_user', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      toast({ title: 'Welcome back!', description: `Logged in as ${user.name}` });
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
      toast({ title: 'Login failed', description: 'Invalid credentials', variant: 'destructive' });
      throw new Error('Login failed');
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      let user: User;
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 600));
        user = { _id: '1', name, email, token: 'demo-token' };
      } else {
        const { data } = await authAPI.register({ name, email, password });
        user = data;
      }
      localStorage.setItem('focusdesk_user', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      toast({ title: 'Account created!', description: `Welcome, ${name}` });
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
      toast({ title: 'Registration failed', description: 'Please try again', variant: 'destructive' });
      throw new Error('Registration failed');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('focusdesk_user');
    setState({ user: null, isAuthenticated: false, isLoading: false });
    toast({ title: 'Logged out', description: 'See you next time!' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
