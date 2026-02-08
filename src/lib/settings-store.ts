
"use client"

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface AppSettings {
  appLogoUrl: string;
  darkMode: boolean;
  whatsappNumber: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  appLogoUrl: 'https://picsum.photos/seed/ritmologo/200/200',
  darkMode: false,
  whatsappNumber: '51999999999'
};

/**
 * useSettingsStore gestiona la configuración global con persistencia local
 * para asegurar que el logo y preferencias carguen de forma instantánea.
 */
export function useSettingsStore() {
  // Inicialización síncrona con caché local para evitar parpadeos (flicker)
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('ritmo_app_settings_v1');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          return DEFAULT_SETTINGS;
        }
      }
    }
    return DEFAULT_SETTINGS;
  });
  
  const [loading, setLoading] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    const docRef = doc(db, 'settings', 'global');
    
    // Escucha en tiempo real de la configuración global
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppSettings;
        const updatedSettings = { ...DEFAULT_SETTINGS, ...data };
        
        setSettings(updatedSettings);
        
        // Actualizar caché para la próxima visita
        if (typeof window !== 'undefined') {
          localStorage.setItem('ritmo_app_settings_v1', JSON.stringify(updatedSettings));
        }
      }
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const docRef = doc(db, 'settings', 'global');
    
    // Actualización optimista del estado local y caché
    const nextSettings = { ...settings, ...newSettings };
    setSettings(nextSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ritmo_app_settings_v1', JSON.stringify(nextSettings));
    }

    setDoc(docRef, newSettings, { merge: true }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: newSettings
      }));
    });
  }, [db, settings]);

  return { settings, updateSettings, loading };
}
