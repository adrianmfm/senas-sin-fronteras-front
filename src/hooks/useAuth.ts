'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '@/services/authService';
import { AuthResult } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    const result = await AuthService.loginWithEmail(email, password);
    setLoading(false);
    return result;
  };

  const register = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    const result = await AuthService.registerWithEmail(email, password);
    setLoading(false);
    return result;
  };

  const loginWithGoogle = async (): Promise<AuthResult> => {
    setLoading(true);
    const result = await AuthService.loginWithGoogle();
    setLoading(false);
    return result;
  };

  const logout = async (): Promise<AuthResult> => {
    setLoading(true);
    const result = await AuthService.logout();
    setLoading(false);
    return result;
  };

  const sendPasswordReset = async (email: string): Promise<AuthResult> => {
    return await AuthService.sendPasswordReset(email);
  };

  const updateProfile = async (displayName?: string, photoURL?: string): Promise<AuthResult> => {
    setLoading(true);
    const result = await AuthService.updateUserProfile(displayName, photoURL);
    setLoading(false);
    return result;
  };

  return {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    sendPasswordReset,
    updateProfile,
    isAuthenticated: !!user,
  };
};