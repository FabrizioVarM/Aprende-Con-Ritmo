"use client"

import { useState, useEffect, useCallback } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();
  const auth = getAuth();

  const fetchProfile = useCallback(async (uid: string) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  }, [db]);

  const fetchAllUsers = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    setAllUsers(users);
  }, [db]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        setUser(profile);
        fetchAllUsers();
      } else {
        setUser(null);
        setAllUsers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, fetchProfile, fetchAllUsers]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      // Si no se provee password en prototipo, esto fallará con Firebase real.
      // Los usuarios deben usar su contraseña real creada en el registro.
      await signInWithEmailAndPassword(auth, email, password || 'password123');
      return true;
    } catch (e) {
      console.error("Login error", e);
      return false;
    }
  };

  const register = async (name: string, email: string, password?: string): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password || 'password123');
      const firebaseUser = userCredential.user;
      
      const newUser: User = {
        id: firebaseUser.uid,
        name,
        email,
        role: 'student',
        username: email.split('@')[0],
        avatarSeed: firebaseUser.uid,
        instruments: []
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setUser(newUser);
      return newUser;
    } catch (e) {
      console.error("Register error", e);
      return null;
    }
  };

  const logout = useCallback(async () => {
    await signOut(auth);
  }, [auth]);

  const updateUser = useCallback((updatedData: Partial<User>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.id);
    updateDoc(docRef, updatedData);
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  }, [db, user]);

  const adminUpdateUser = useCallback((userId: string, updatedData: Partial<User>) => {
    const docRef = doc(db, 'users', userId);
    updateDoc(docRef, updatedData);
    fetchAllUsers();
  }, [db, fetchAllUsers]);

  const adminAddUser = useCallback(async (userData: Omit<User, 'id'>) => {
    // Nota: Crear usuarios desde admin requiere Admin SDK en entorno real
    // Para prototipo, usamos una colección ficticia o permitimos setDoc directo si las reglas lo permiten
    const newId = Math.random().toString(36).substring(7);
    const newUser = { ...userData, id: newId };
    await setDoc(doc(db, 'users', newId), newUser);
    fetchAllUsers();
    return newUser;
  }, [db, fetchAllUsers]);

  const adminDeleteUser = useCallback(async (userId: string) => {
    await deleteDoc(doc(db, 'users', userId));
    fetchAllUsers();
  }, [db, fetchAllUsers]);

  const getTeachers = useCallback(() => {
    return allUsers.filter(u => u.role === 'teacher');
  }, [allUsers]);

  return { user, allUsers, loading, login, logout, register, updateUser, adminUpdateUser, adminAddUser, adminDeleteUser, getTeachers };
}
