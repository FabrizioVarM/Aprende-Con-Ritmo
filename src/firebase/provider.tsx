'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot, collection } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Perfil extendido de usuario de la academia
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  username?: string;
  instruments?: string[];
  avatarSeed?: string;
  photoUrl?: string;
  phone?: string;
  fcmToken?: string;
  canManageLibrary?: boolean;
  currentZone?: string; // Nueva propiedad para ubicación del profesor
  photoTransform?: {
    scale: number;
    x: number;
    y: number;
  };
}

// Internal state for user authentication and profile
interface UserAuthState {
  user: User | null;
  profile: UserProfile | null;
  allUsers: UserProfile[];
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  profile: UserProfile | null;
  allUsers: UserProfile[];
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  profile: UserProfile | null;
  allUsers: UserProfile[];
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider gestiona y proporciona servicios de Firebase y el estado del perfil en tiempo real.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    profile: null,
    allUsers: [],
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth || !firestore) return;

    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeAllUsers: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Limpiar escuchas anteriores si existen
        if (unsubscribeProfile) unsubscribeProfile();
        if (unsubscribeAllUsers) unsubscribeAllUsers();

        if (firebaseUser) {
          // Asegurar que el estado de carga esté activo mientras esperamos al perfil
          setUserAuthState(prev => ({ ...prev, user: firebaseUser, isUserLoading: true }));

          // 1. Escucha en TIEMPO REAL del perfil del usuario logueado
          const profileRef = doc(firestore, 'users', firebaseUser.uid);
          unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
            if (docSnap.exists()) {
              const profileData = docSnap.data() as UserProfile;
              const profileWithId = { ...profileData, id: docSnap.id };
              
              setUserAuthState(prev => ({
                ...prev,
                user: firebaseUser,
                profile: profileWithId,
                isUserLoading: false
              }));
            } else {
              // Si el usuario existe en Auth pero no tiene perfil en Firestore todavía
              setUserAuthState(prev => ({
                ...prev,
                user: firebaseUser,
                profile: null,
                isUserLoading: false
              }));
            }
          }, (err) => {
            console.error("Error escuchando perfil:", err);
            setUserAuthState(prev => ({ ...prev, isUserLoading: false, userError: err }));
          });

          // 2. Escucha en TIEMPO REAL de todos los usuarios
          const usersRef = collection(firestore, 'users');
          unsubscribeAllUsers = onSnapshot(usersRef, (snapshot) => {
            const users: UserProfile[] = [];
            snapshot.forEach(d => {
              const data = d.data() as UserProfile;
              users.push({ ...data, id: d.id });
            });
            setUserAuthState(prev => ({ ...prev, allUsers: users }));
          }, (err) => {
            console.error("Error escuchando lista global:", err);
          });

        } else {
          // Usuario no autenticado
          setUserAuthState({
            user: null,
            profile: null,
            allUsers: [],
            isUserLoading: false,
            userError: null
          });
        }
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState(prev => ({ ...prev, isUserLoading: false, userError: error }));
      }
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeAllUsers) unsubscribeAllUsers();
    };
  }, [auth, firestore]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      profile: userAuthState.profile,
      allUsers: userAuthState.allUsers,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available.');
  }
  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    profile: context.profile,
    allUsers: context.allUsers,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}

export const useUser = () => {
  const { user, profile, isUserLoading, userError } = useFirebase();
  return { user, profile, isUserLoading, userError };
};
