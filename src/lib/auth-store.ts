
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
}

const INITIAL_MOCK_USERS: User[] = [
  { id: '1', name: 'Ana Garcia', email: 'ana@example.com', role: 'student', username: 'anaritmica', instruments: ['Guitarra'], avatarSeed: '1' },
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

  // Inicializar base de datos de usuarios y sesión
  useEffect(() => {
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
        // Sincronizar usuario actual con la "base de datos" por si hubo cambios en otra sesión
        const upToDateUser = currentAllUsers.find(u => u.id === parsedUser.id) || parsedUser;
        setUser(upToDateUser);
      } catch (e) {
        console.error("Error parsing current user", e);
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const foundUser = allUsers.find(u => u.email === email) || allUsers[0];
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
    
    // Actualizar usuario actual
    localStorage.setItem('ac_user', JSON.stringify(newUser));
    setUser(newUser);

    // Actualizar en la lista global de usuarios
    const updatedAllUsers = allUsers.map(u => u.id === newUser.id ? newUser : u);
    localStorage.setItem('ac_all_users', JSON.stringify(updatedAllUsers));
    setAllUsers(updatedAllUsers);
  }, [user, allUsers]);

  const getTeachers = useCallback(() => {
    return allUsers.filter(u => u.role === 'teacher');
  }, [allUsers]);

  return { user, allUsers, loading, login, logout, updateUser, getTeachers };
}
