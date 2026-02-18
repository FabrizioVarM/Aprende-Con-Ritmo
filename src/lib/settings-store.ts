
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
  // Estados de los módulos (Visibilidad y Uso)
  showProduction: boolean;
  enableProduction: boolean;
  showRewards: boolean;
  enableRewards: boolean;
  showMarket: boolean;
  enableMarket: boolean;
  showPostulations: boolean;
  enablePostulations: boolean;
  // Zonas configurables
  zones: string[];
  // Campos de texto para el inicio
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadge?: string;
  newsSectionTitle?: string;
  // Textos de Módulos en Inicio
  moduleMarketTitle?: string;
  moduleMarketDesc?: string;
  moduleProductionTitle?: string;
  moduleProductionDesc?: string;
  moduleRewardsTitle?: string;
  moduleRewardsDesc?: string;
  moduleFooterInfo?: string;
}

export const FALLBACK_ZONES = ['San Isidro', 'Miraflores', 'Surco', 'La Molina', 'Barranco', 'San Borja', 'Centro', 'Virtual'];

const DEFAULT_SETTINGS: AppSettings = {
  appLogoUrl: 'https://picsum.photos/seed/ritmologo/200/200',
  darkMode: false,
  whatsappNumber: '51999999999',
  showProduction: true,
  enableProduction: false,
  showRewards: true,
  enableRewards: false,
  showMarket: true,
  enableMarket: false,
  showPostulations: true,
  enablePostulations: false,
  zones: FALLBACK_ZONES,
  heroTitle: 'Tu aventura musical continúa aquí 🎼',
  heroSubtitle: 'Explora las últimas noticias, eventos y actualizaciones de Aprende con Ritmo.',
  heroBadge: 'Novedades de la Academia',
  newsSectionTitle: 'Lo Último en Ritmo',
  moduleMarketTitle: 'RitmoMarket',
  moduleMarketDesc: 'Tienda de accesorios',
  moduleProductionTitle: 'Producción',
  moduleProductionDesc: 'Graba tus clases en HD',
  moduleRewardsTitle: 'Recompensas',
  moduleRewardsDesc: 'Canjea tus puntos',
  moduleFooterInfo: 'Administración trabaja en pasarelas de pago y sistemas de recompensas.'
};

export function useSettingsStore() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    const cached = localStorage.getItem('ritmo_app_settings_v3');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Error cargando ajustes cacheados:", e);
      }
    }

    const docRef = doc(db, 'settings', 'global');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppSettings;
        const updatedSettings = { ...DEFAULT_SETTINGS, ...data };
        setSettings(updatedSettings);
        localStorage.setItem('ritmo_app_settings_v3', JSON.stringify(updatedSettings));
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const docRef = doc(db, 'settings', 'global');
    
    setSettings(prev => {
      const nextSettings = { ...prev, ...newSettings };
      localStorage.setItem('ritmo_app_settings_v3', JSON.stringify(nextSettings));
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
