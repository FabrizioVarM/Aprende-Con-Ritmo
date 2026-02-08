
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
  photoUrl?: string;
  phone?: string;
}

const INITIAL_MOCK_USERS: User[] = [
  { id: '1', name: 'Ana Garcia', email: 'ana@example.com', role: 'student', username: 'anaritmica', instruments: ['Guitarra'], avatarSeed: '1', phone: '+51 987 654 321' },
  { id: '2', name: 'Prof. Carlos', email: 'carlos@example.com', role: 'teacher', username: 'carlos_pro', instruments: ['Guitarra', 'Violín'], avatarSeed: '2' },
  { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin', username: 'admin_ritmo', avatarSeed: '3' },
  { id: '4', name: 'Prof. Elena', email: 'elena@example.com', role: 'teacher', username: 'elena_teoria', instruments: ['Teoría', 'Piano'], avatarSeed: '4' },
  { id: '5', name: 'Prof. Marcos', email: 'marcos@example.com', role: 'teacher', username: 'marcos_piano', instruments: ['Piano'], avatarSeed: '5' },
  { id: '6', name: 'Tom Holland', email: 'tom@example.com', role: 'student', username: 'spidermusico', instruments: ['Batería'], avatarSeed: '6' },
  { id: '7', name: 'Prof. Sofía', email: 'sofia@example.com', role: 'teacher', username: 'sofia_strings', instruments: ['Guitarra', 'Violín'], avatarSeed: '7' },
  { id: '8', name: 'Prof. Julián', email: 'julian@example.com', role: 'teacher', username: 'julian_v', instruments: ['Violín'], avatarSeed: '8' },
  { id: '9', name: 'Prof. Marta', email: 'marta@example.com', role: 'teacher', username: 'marta_voz', instruments: ['Canto'], avatarSeed: '9' },
];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllUsers = useCallback(() => {
    const savedAllUsers = localStorage.getItem('ac_all_users');
    let currentAllUsers = INITIAL_MOCK_USERS;

    if (savedAllUsers) {
      try {
        currentAllUsers = JSON.parse(savedAllUsers);
      } catch (e) {
        console.error("Error parsing all users", e);
      }
    } else {
      localStorage.setItem('ac_all_users', JSON.stringify(INITIAL_MOCK_USERS));
    }
    
    setAllUsers(currentAllUsers);

    const savedUser = localStorage.getItem('ac_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const upToDateUser = currentAllUsers.find(u => u.id === parsedUser.id);
        
        if (upToDateUser) {
          setUser(upToDateUser);
        } else {
          localStorage.removeItem('ac_user');
          setUser(null);
        }
      } catch (e) {
        console.error("Error parsing current user", e);
      }
    }
  }, []);

  useEffect(() => {
    loadAllUsers();
    setLoading(false);

    const handleSync = () => loadAllUsers();
    window.addEventListener('ac_sync_auth', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('ac_sync_auth', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadAllUsers]);

  const login = (email: string): boolean => {
    const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      localStorage.setItem('ac_user', JSON.stringify(foundUser));
      setUser(foundUser);
      window.dispatchEvent(new CustomEvent('ac_sync_auth'));
      return true;
    }
    return false;
  };

  const register = (name: string, email: string): User => {
    const newId = Math.random().toString(36).substring(7);
    const newUser: User = {
      id: newId,
      name,
      email,
      role: 'student',
      username: email.split('@')[0],
      avatarSeed: newId,
      instruments: []
    };

    const updatedAllUsers = [...allUsers, newUser];
    localStorage.setItem('ac_all_users', JSON.stringify(updatedAllUsers));
    localStorage.setItem('ac_user', JSON.stringify(newUser));
    setAllUsers(updatedAllUsers);
    setUser(newUser);
    window.dispatchEvent(new CustomEvent('ac_sync_auth'));
    return newUser;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('ac_user');
    setUser(null);
    window.dispatchEvent(new CustomEvent('ac_sync_auth'));
  }, []);

  const updateUser = useCallback((updatedData: Partial<User>) => {
    if (!user) return;
    
    const newUser = { ...user, ...updatedData };
    localStorage.setItem('ac_user', JSON.stringify(newUser));
    setUser(newUser);

    const updatedAllUsers = allUsers.map(u => u.id === newUser.id ? newUser : u);
    localStorage.setItem('ac_all_users', JSON.stringify(updatedAllUsers));
    setAllUsers(updatedAllUsers);
    
    window.dispatchEvent(new CustomEvent('ac_sync_auth'));
  }, [user, allUsers]);

  const adminUpdateUser = useCallback((userId: string, updatedData: Partial<User>) => {
    const updatedAllUsers = allUsers.map(u => u.id === userId ? { ...u, ...updatedData } : u);
    localStorage.setItem('ac_all_users', JSON.stringify(updatedAllUsers));
    setAllUsers(updatedAllUsers);

    if (user && user.id === userId) {
      const newUser = updatedAllUsers.find(u => u.id === userId)!;
      localStorage.setItem('ac_user', JSON.stringify(newUser));
      setUser(newUser);
    }
    
    window.dispatchEvent(new CustomEvent('ac_sync_auth'));
  }, [user, allUsers]);

  const adminAddUser = useCallback((userData: Omit<User, 'id'>) => {
    const newId = Math.random().toString(36).substring(7);
    const newUser: User = { 
      ...userData, 
      id: newId,
      avatarSeed: userData.avatarSeed || newId 
    };
    
    const updatedAllUsers = [...allUsers, newUser];
    localStorage.setItem('ac_all_users', JSON.stringify(updatedAllUsers));
    setAllUsers(updatedAllUsers);
    
    window.dispatchEvent(new CustomEvent('ac_sync_auth'));
    return newUser;
  }, [allUsers]);

  const adminDeleteUser = useCallback((userId: string) => {
    const updatedAllUsers = allUsers.filter(u => u.id !== userId);
    localStorage.setItem('ac_all_users', JSON.stringify(updatedAllUsers));
    setAllUsers(updatedAllUsers);
    
    if (user && user.id === userId) {
      logout();
    }
    
    window.dispatchEvent(new CustomEvent('ac_sync_auth'));
  }, [user, allUsers, logout]);

  const getTeachers = useCallback(() => {
    return allUsers.filter(u => u.role === 'teacher');
  }, [allUsers]);

  return { user, allUsers, loading, login, logout, register, updateUser, adminUpdateUser, adminAddUser, adminDeleteUser, getTeachers };
}
