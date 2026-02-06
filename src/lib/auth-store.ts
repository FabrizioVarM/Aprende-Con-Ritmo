
"use client"

import { useState, useEffect, useCallback } from 'react';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  username?: string;
  instruments?: string[];
  avatarSeed?: string;
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Ana Garcia', email: 'ana@example.com', role: 'student', username: 'anaritmica', instruments: ['Guitarra'], avatarSeed: '1' },
  { id: '2', name: 'Prof. Carlos', email: 'carlos@example.com', role: 'teacher', username: 'carlos_pro', instruments: ['Violín'], avatarSeed: '2' },
  { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin', username: 'admin_ritmo', avatarSeed: '3' },
];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('ac_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const foundUser = MOCK_USERS.find(u => u.email === email) || MOCK_USERS[0];
    localStorage.setItem('ac_user', JSON.stringify(foundUser));
    setUser(foundUser);
  };

  const logout = () => {
    localStorage.removeItem('ac_user');
    setUser(null);
  };

  const updateUser = useCallback((updatedData: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedData };
    localStorage.setItem('ac_user', JSON.stringify(newUser));
    setUser(newUser);
  }, [user]);

  return { user, loading, login, logout, updateUser };
}
