
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
      // Errores de lectura manejados silenciosamente durante el login
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
          // Si el perfil no existe (ej. error en creación previa), lo creamos mínimamente
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuario Nuevo',
            email: firebaseUser.email || '',
            role: 'student',
            username: (firebaseUser.email || '').split('@')[0],
            avatarSeed: firebaseUser.uid
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
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
      toast({
        variant: "destructive",
        title: "Error de acceso 🚫",
        description: "Verifica tus credenciales o el método de acceso.",
      });
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return !!result.user;
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error con Google 🚫",
        description: "No se pudo completar el inicio de sesión.",
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

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setUser(newUser);
      return newUser;
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error en el registro 🚫",
        description: e.message || "No se pudo crear la cuenta.",
      });
      return null;
    }
  };

  const logout = useCallback(async () => {
    await signOut(auth);
  }, [auth]);

  const updateUser = useCallback(async (updatedData: Partial<User>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.id);
    await updateDoc(docRef, updatedData).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updatedData
      }));
    });
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  }, [db, user]);

  const adminUpdateUser = useCallback(async (userId: string, updatedData: Partial<User>) => {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, updatedData).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updatedData
      }));
    });
    fetchAllUsers();
  }, [db, fetchAllUsers]);

  const adminAddUser = useCallback(async (userData: Omit<User, 'id'>) => {
    const newId = Math.random().toString(36).substring(7);
    const newUser = { ...userData, id: newId };
    const docRef = doc(db, 'users', newId);
    await setDoc(docRef, newUser).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: newUser
      }));
    });
    fetchAllUsers();
    return newUser;
  }, [db, fetchAllUsers]);

  const adminDeleteUser = useCallback(async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });
    fetchAllUsers();
  }, [db, fetchAllUsers]);

  const getTeachers = useCallback(() => {
    return allUsers.filter(u => u.role === 'teacher');
  }, [allUsers]);

  return { user, allUsers, loading, login, loginWithGoogle, logout, register, updateUser, adminUpdateUser, adminAddUser, adminDeleteUser, getTeachers };
}
