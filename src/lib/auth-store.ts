
"use client"

import { useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
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

/**
 * useAuth hook refactorizado para usar el contexto global de FirebaseProvider.
 * Esto asegura que todos los componentes compartan el mismo estado en tiempo real.
 */
export function useAuth() {
  const { user: firebaseUser, profile, allUsers, isUserLoading, auth, firestore: db } = useFirebase();

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
      
      // Si es un usuario nuevo, asegurar que tenga un documento en Firestore
      if (result.user) {
        const userDocRef = doc(db, 'users', result.user.uid);
        const newUser: User = {
          id: result.user.uid,
          name: result.user.displayName || 'Usuario Nuevo',
          email: result.user.email || '',
          role: 'student',
          username: (result.user.email || '').split('@')[0],
          avatarSeed: result.user.uid,
          instruments: []
        };
        await setDoc(userDocRef, newUser, { merge: true });
      }
      return !!result.user;
    } catch (e: any) {
      console.error("Error Auth Google:", e);
      let message = "No se pudo completar el inicio de sesión.";
      if (e.code === 'auth/popup-closed-by-user') message = "Cerraste la ventana de Google antes de terminar.";
      
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

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      return newUser;
    } catch (e: any) {
      return null;
    }
  };

  const logout = useCallback(async () => {
    await signOut(auth);
  }, [auth]);

  const updateUser = useCallback((updatedData: Partial<User>) => {
    if (!firebaseUser) return;
    
    // Limpiar campos undefined para evitar errores de Firestore
    const cleanData = Object.fromEntries(
      Object.entries(updatedData).filter(([_, v]) => v !== undefined)
    );

    const docRef = doc(db, 'users', firebaseUser.uid);
    setDoc(docRef, cleanData, { merge: true }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: cleanData
      }));
    });
  }, [db, firebaseUser]);

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
  }, [db]);

  const getTeachers = useCallback(() => {
    return allUsers.filter(u => u.role === 'teacher');
  }, [allUsers]);

  return { 
    user: profile, // Perfil de Firestore
    firebaseUser, // Objeto de Auth puro
    allUsers, 
    loading: isUserLoading, 
    login, 
    loginWithGoogle, 
    logout, 
    register, 
    updateUser, 
    adminUpdateUser, 
    adminAddUser, 
    adminDeleteUser, 
    getTeachers 
  };
}
