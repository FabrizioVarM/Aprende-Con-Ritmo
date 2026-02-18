
"use client"

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface GuideItem {
  icon: string;
  title: string;
  desc: string;
}

export interface AboutValue {
  title: string;
  desc: string;
}

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
  heroImages?: string[];
  newsSectionTitle?: string;
  // Textos de Módulos en Inicio
  moduleMarketTitle?: string;
  moduleMarketDesc?: string;
  moduleProductionTitle?: string;
  moduleProductionDesc?: string;
  moduleRewardsTitle?: string;
  moduleRewardsDesc?: string;
  moduleFooterInfo?: string;
  moduleSectionIcon?: string;
  // Página Sobre Nosotros
  aboutHeroTitle?: string;
  aboutHeroSubtitle?: string;
  aboutHeroBadge?: string;
  aboutValues?: AboutValue[];
  aboutGuideTitle?: string;
  aboutGuideItems?: GuideItem[];
  aboutFooterTitle?: string;
  aboutFooterSubtitle?: string;
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
  heroImages: [
    'https://picsum.photos/seed/music1/1200/600',
    'https://picsum.photos/seed/music2/1200/600',
    'https://picsum.photos/seed/music3/1200/600'
  ],
  newsSectionTitle: 'Lo Último en Ritmo',
  moduleMarketTitle: 'RitmoMarket',
  moduleMarketDesc: 'Tienda de accesorios',
  moduleProductionTitle: 'Producción',
  moduleProductionDesc: 'Graba tus clases en HD',
  moduleRewardsTitle: 'Recompensas',
  moduleRewardsDesc: 'Canjea tus puntos',
  moduleFooterInfo: 'Administración trabaja en pasarelas de pago y sistemas de recompensas.',
  moduleSectionIcon: 'Zap',
  // Valores por defecto para Sobre Nosotros
  aboutHeroTitle: 'Aprende con Ritmo',
  aboutHeroSubtitle: 'Somos más que una escuela; somos una comunidad apasionada por la educación musical moderna.',
  aboutHeroBadge: 'Nuestra Identidad',
  aboutValues: [
    { title: 'Pasión Musical', desc: 'Vivimos y respiramos música, transmitiendo ese entusiasmo en cada lección.' },
    { title: 'Excelencia Técnica', desc: 'Nos enfocamos en una base sólida para que tu talento no tenga límites técnicos.' },
    { title: 'Comunidad Viva', desc: 'Fomentamos la colaboración entre alumnos y profesores para crecer juntos.' }
  ],
  aboutGuideTitle: 'Guía de la Plataforma',
  aboutGuideItems: [
    { icon: 'Home', title: 'Inicio', desc: 'Tu puerta de entrada a la academia. Noticias, eventos y comunicados.' },
    { icon: 'LayoutDashboard', title: 'Panel Personal', desc: 'Tu centro de control. Gestiona tus próximas clases y recursos.' },
    { icon: 'Calendar', title: 'Horario', desc: 'Gestiona tu tiempo. Reserva nuevas lecciones con tus profesores.' },
    { icon: 'Library', title: 'Biblioteca', desc: 'Tu material de estudio. Accede a partituras y videos curados.' },
    { icon: 'TrendingUp', title: 'Progreso', desc: 'Visualiza tu crecimiento. Sigue tu evolución técnica por instrumento.' },
    { icon: 'Mic2', title: 'Producción Musical', desc: 'Próximamente. Graba tus interpretaciones en alta definición.' },
    { icon: 'Gift', title: 'Recompensas', desc: 'Próximamente. Canjea tus puntos por beneficios exclusivos.' },
    { icon: 'ShoppingBag', title: 'RitmoMarket', desc: 'Próximamente. Adquiere instrumentos y accesorios garantizados.' },
    { icon: 'ClipboardList', title: 'Postulaciones', desc: 'Próximamente. Inscríbete a festivales y audiciones especiales.' }
  ],
  aboutFooterTitle: '¿Listo para empezar?',
  aboutFooterSubtitle: 'Tu viaje musical es único. Utiliza cada una de estas herramientas para sacar el mayor provecho a tus clases.'
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
