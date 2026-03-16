
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

export interface CommunityAd {
  imageUrl: string;
  isVisible: boolean;
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
  showCurriculum: boolean;
  enableCurriculum: boolean;
  // Zonas configurables
  zones: string[];
  // Campos de texto para el inicio
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadge?: string;
  heroImages?: string[];
  newsSectionTitle?: string;
  // Gestión de Publicidad en comunidad
  communityAds?: CommunityAd[];
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
  // Términos y Condiciones
  termsContent?: string;
}

export const FALLBACK_ZONES = ['San Isidro', 'Miraflores', 'Surco', 'La Molina', 'Barranco', 'San Borja', 'Centro', 'Virtual'];

// Placeholder estable que no cambia aleatoriamente (SVG de nota musical en color acento)
const BRAND_PLACEHOLDER_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FF8B7A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E";

const DEFAULT_SETTINGS: AppSettings = {
  appLogoUrl: BRAND_PLACEHOLDER_LOGO,
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
  showCurriculum: false, // Oculto por defecto hasta terminarlo
  enableCurriculum: false,
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
  communityAds: [
    { imageUrl: 'https://picsum.photos/seed/promo1/1200/450', isVisible: true }
  ],
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
  aboutFooterSubtitle: 'Tu viaje musical es único. Utiliza cada una de estas herramientas para sacar el mayor provecho a tus clases.',
  termsContent: `1. Identidad y Propósito\nLa plataforma Aprende con Ritmo es una herramienta de gestión académica musical diseñada para facilitar la interacción entre alumnos, profesores y administración. El registro implica el uso de datos personales para fines exclusivamente educativos y de coordinación institucional.\n\n2. Usuarios y Menores de Edad\nEn caso de que el estudiante sea menor de edad, el registro y la operación de la aplicación deben ser realizados por el padre, madre o tutor legal, quien asume la responsabilidad total de la cuenta y la veracidad de la información proporcionada.\n\n3. Propiedad Intelectual y Material Didáctico\nTodo el material proporcionado en la Biblioteca (partituras, videos, audios, textos) es propiedad intelectual de la academia o cuenta con las licencias correspondientes para uso educativo.\n\nQueda estrictamente PROHIBIDA la descarga, reproducción, distribución, venta o uso de cualquier material didáctico fuera de la plataforma con fines de lucro sin la autorización expresa y por escrito de la dirección de Aprende con Ritmo.\n\n4. Código de Conducta y Uso Correcto\nEl usuario se compromete a:\n- Proporcionar información veraz y mantenerla actualizada.\n- Mantener un trato respetuoso y profesional con los docentes y personal administrativo.\n- Utilizar la agenda de clases de forma responsable, respetando los tiempos de los profesores.\n- No intentar vulnerar la seguridad de la plataforma ni acceder a perfiles ajenos.\n\n5. Incumplimiento y Sanciones\nEl incumplimiento de cualquiera de estos términos podrá resultar en:\n- Amonestaciones verbales o escritas enviadas al perfil del alumno.\n- Suspensión temporal del acceso a la plataforma y materiales.\n- Expulsión Definitiva de la academia y eliminación permanente de la cuenta sin derecho a reembolso en caso de faltas graves a la moral o mal uso de la propiedad intelectual.\n- Acciones legales pertinentes en caso de lucro indebido con materiales de la academia.\n\n6. Tratamiento de Datos\nAl registrarse, usted autoriza la recopilación y almacenamiento de:\n- Nombres, correos electrónicos y números de teléfono.\n- Instrumentos de interés y niveles de progreso técnico.\n- Fotografías de perfil y evidencias de aprendizaje.\n- Historial de asistencia y calificaciones.`
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
