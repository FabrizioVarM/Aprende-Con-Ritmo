
"use client"

import { useState, useEffect } from 'react';

export type UserRole = 'student' | 'teacher' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Ana Garcia', email: 'ana@example.com', role: 'student' },
  { id: '2', name: 'Prof. Carlos', email: 'carlos@example.com', role: 'teacher' },
  { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
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

  return { user, loading, login, logout };
}
