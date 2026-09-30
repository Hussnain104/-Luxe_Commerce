import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, RoleSlug } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; phone?: string }) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: RoleSlug) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const token = localStorage.getItem('luxe_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await apiRequest<{ user: User }>('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        localStorage.removeItem('luxe_token');
      }
    } catch {
      localStorage.removeItem('luxe_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    const res = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    if (res.success && res.data) {
      localStorage.setItem('luxe_token', res.data.token);
      setUser(res.data.user);
      showToast(`Welcome back, ${res.data.user.first_name}`, 'success');
      return true;
    } else {
      showToast(res.message || 'Invalid email or password', 'error');
      return false;
    }
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: string; phone?: string }): Promise<boolean> => {
    const res = await apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      localStorage.setItem('luxe_token', res.data.token);
      setUser(res.data.user);
      showToast(`Welcome to LuxeCommerce, ${res.data.user.first_name}`, 'success');
      return true;
    } else {
      showToast(res.message || 'Registration failed', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('luxe_token');
    setUser(null);
    showToast('Signed out of LuxeCommerce', 'info');
  };

  const switchDemoRole = async (role: RoleSlug) => {
    const res = await apiRequest<{ token: string; user: User }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });

    if (res.success && res.data) {
      localStorage.setItem('luxe_token', res.data.token);
      setUser(res.data.user);
      showToast(res.message || `Switched to ${role}`, 'success');
    }
  };

  const isAdmin = user?.role_slug === 'super_admin' || user?.role_slug === 'admin';
  const isManager = isAdmin || user?.role_slug === 'manager';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isManager,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
