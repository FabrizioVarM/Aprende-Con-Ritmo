
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
  // Estados de los módulos
  enableProduction: boolean;
  enableRewards: boolean;
  enableMarket: boolean;
  enablePostulations: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  appLogoUrl: 'https://picsum.photos/seed/ritmologo/200/200',
  darkMode: false,
  whatsappNumber: '51999999999',
  enableProduction: false,
  enableRewards: false,
  enableMarket: false,
  enablePostulations: false
};

/**
 * useSettingsStore gestiona la configuración global con persistencia local.
 * Se ha corregido para evitar errores de hidratación en Next.js.
 */
export function useSettingsStore() {
  // Inicializamos siempre con los valores por defecto para que coincida el renderizado
  // del servidor con el primer renderizado del cliente, evitando el error de hidratación.
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    // Una vez montado el componente en el cliente (hydration completa), cargamos la caché local
    const cached = localStorage.getItem('ritmo_app_settings_v1');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Error cargando ajustes cacheados:", e);
      }
    }

    const docRef = doc(db, 'settings', 'global');
    
    // Escucha en tiempo real de la configuración global desde Firestore
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppSettings;
        const updatedSettings = { ...DEFAULT_SETTINGS, ...data };
        
        setSettings(updatedSettings);
        
        // Actualizar caché para la próxima visita
        localStorage.setItem('ritmo_app_settings_v1', JSON.stringify(updatedSettings));
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
    setSettings(prev => {
      const nextSettings = { ...prev, ...newSettings };
      localStorage.setItem('ritmo_app_settings_v1', JSON.stringify(nextSettings));
      return nextSettings;
    });

    setDoc(docRef, newSettings, { merge: true }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: newSettings
      }));
    });
  }, [db]);

  return { settings, updateSettings, loading };
}
