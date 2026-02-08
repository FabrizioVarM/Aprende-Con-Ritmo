
"use client"

import { useState, useEffect, useCallback } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

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
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as User;
      }
    } catch (e) {
      // Errores de lectura manejados silenciosamente
    }
    return null;
  }, [db]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as User);
      });
      setAllUsers(users);
    } catch (e) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'users',
        operation: 'list'
      }));
    }
  }, [db]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        if (profile) {
          setUser(profile);
          fetchAllUsers();
        } else {
          // Creación de perfil para usuarios de Google o registros nuevos
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuario Nuevo',
            email: firebaseUser.email || '',
            role: 'student',
            username: (firebaseUser.email || '').split('@')[0],
            avatarSeed: firebaseUser.uid,
            instruments: []
          };
          setDoc(doc(db, 'users', firebaseUser.uid), newUser).catch((err) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: `users/${firebaseUser.uid}`,
              operation: 'create',
              requestResourceData: newUser
            }));
          });
          setUser(newUser);
          fetchAllUsers();
        }
      } else {
        setUser(null);
        setAllUsers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, fetchProfile, fetchAllUsers, db]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password || 'password123');
      return true;
    } catch (e: any) {
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      return !!result.user;
    } catch (e: any) {
      console.error("Google Auth Error:", e);
      let message = "No se pudo completar el inicio de sesión.";
      if (e.code === 'auth/popup-closed-by-user') message = "Cerraste la ventana de Google antes de terminar.";
      if (e.code === 'auth/operation-not-allowed') message = "Debes habilitar Google en la consola de Firebase.";
      
      toast({
        variant: "destructive",
        title: "Error con Google 🚫",
        description: message,
      });
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

      setDoc(doc(db, 'users', firebaseUser.uid), newUser).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `users/${firebaseUser.uid}`,
          operation: 'create',
          requestResourceData: newUser
        }));
      });
      setUser(newUser);
      return newUser;
    } catch (e: any) {
      return null;
    }
  };

  const logout = useCallback(async () => {
    await signOut(auth);
  }, [auth]);

  const updateUser = useCallback((updatedData: Partial<User>) => {
    if (!user) return;
    
    // Limpiar campos undefined para evitar errores en Firestore
    const cleanData = Object.fromEntries(
      Object.entries(updatedData).filter(([_, v]) => v !== undefined)
    );

    const docRef = doc(db, 'users', user.id);
    // Usar setDoc con merge para mayor robustez en actualizaciones de perfil
    setDoc(docRef, cleanData, { merge: true }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: cleanData
      }));
    });

    // Actualizar estado local inmediatamente para feedback instantáneo
    const updatedUser = { ...user, ...cleanData };
    setUser(updatedUser);
    
    // Actualizar también la lista global para evitar inconsistencias en otras vistas
    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  }, [db, user]);

  const adminUpdateUser = useCallback((userId: string, updatedData: Partial<User>) => {
    const cleanData = Object.fromEntries(
      Object.entries(updatedData).filter(([_, v]) => v !== undefined)
    );

    const docRef = doc(db, 'users', userId);
    setDoc(docRef, cleanData, { merge: true }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: cleanData
      }));
    });

    // Sincronizar lista global localmente
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...cleanData } : u));
  }, [db]);

  const adminAddUser = useCallback((userData: Omit<User, 'id'>) => {
    const newId = Math.random().toString(36).substring(7);
    const newUser = { ...userData, id: newId };
    const docRef = doc(db, 'users', newId);
    setDoc(docRef, newUser).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: newUser
      }));
    });
    
    setAllUsers(prev => [...prev, newUser]);
    return newUser;
  }, [db]);

  const adminDeleteUser = useCallback((userId: string) => {
    const docRef = doc(db, 'users', userId);
    deleteDoc(docRef).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });
    
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  }, [db]);

  const getTeachers = useCallback(() => {
    return allUsers.filter(u => u.role === 'teacher');
  }, [allUsers]);

  return { user, allUsers, loading, login, loginWithGoogle, logout, register, updateUser, adminUpdateUser, adminAddUser, adminDeleteUser, getTeachers };
}
