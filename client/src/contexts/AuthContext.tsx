import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const normalizeUser = (data: User): User => ({
  ...data,
  createdAt: new Date(data.createdAt),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? normalizeUser(JSON.parse(saved)) : null;
  });

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.message || 'Invalid credentials.';
      throw new Error(message);
    }

    const normalizedUser = normalizeUser(data.user);
    setUser(normalizedUser);
    localStorage.setItem('auth_user', JSON.stringify(normalizedUser));
    return true;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.message || 'Registration failed.';
      throw new Error(message);
    }

    const normalizedUser = normalizeUser(data.user);
    setUser(normalizedUser);
    localStorage.setItem('auth_user', JSON.stringify(normalizedUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
