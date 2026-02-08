
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
import { doc, setDoc, collection, deleteDoc, onSnapshot } from 'firebase/firestore';
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

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;
    let unsubscribeAllUsers: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Limpiar escuchas anteriores si existen
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeAllUsers) unsubscribeAllUsers();

      if (firebaseUser) {
        // 1. Escucha en tiempo real para el perfil del usuario autenticado
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as User);
            setLoading(false);
          } else {
            // Creación inicial si el documento no existe (ej. primer login con Google)
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuario Nuevo',
              email: firebaseUser.email || '',
              role: 'student',
              username: (firebaseUser.email || '').split('@')[0],
              avatarSeed: firebaseUser.uid,
              instruments: []
            };
            setDoc(userDocRef, newUser).catch((err) => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${firebaseUser.uid}`,
                operation: 'create',
                requestResourceData: newUser
              }));
            });
          }
        }, (error) => {
          console.error("Error al escuchar perfil de usuario:", error);
          setLoading(false);
        });

        // 2. Escucha en tiempo real para TODOS los usuarios (para directorios y administración)
        const usersColRef = collection(db, 'users');
        unsubscribeAllUsers = onSnapshot(usersColRef, (snapshot) => {
          const users: User[] = [];
          snapshot.forEach((doc) => {
            users.push(doc.data() as User);
          });
          setAllUsers(users);
        }, (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'users',
            operation: 'list'
          }));
        });

      } else {
        setUser(null);
        setAllUsers([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeAllUsers) unsubscribeAllUsers();
    };
  }, [auth, db]);

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
      console.error("Error Auth Google:", e);
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
    if (!user) return;
    
    const cleanData = Object.fromEntries(
      Object.entries(updatedData).filter(([_, v]) => v !== undefined)
    );

    const docRef = doc(db, 'users', user.id);
    
    // setDoc con merge es más robusto para actualizaciones de perfil
    setDoc(docRef, cleanData, { merge: true }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: cleanData
      }));
    });
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

  return { user, allUsers, loading, login, loginWithGoogle, logout, register, updateUser, adminUpdateUser, adminAddUser, adminDeleteUser, getTeachers };
}
