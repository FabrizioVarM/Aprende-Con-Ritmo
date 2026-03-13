"use client"

import { useEffect } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { useFirebaseApp, useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * Este componente gestiona la solicitud de permisos de notificación
 * y registra el token FCM en el perfil del usuario en Firestore.
 * Se activa cuando se emite el evento 'request-notification-permission'.
 */
export function PushNotificationManager() {
  const { profile, firestore: db } = useFirebase();
  const firebaseApp = useFirebaseApp();

  useEffect(() => {
    const handleRequestPermission = async () => {
      // Solo solicitar si el usuario está logueado
      if (!profile?.id || !db) return;

      try {
        const messagingSupported = await isSupported();
        if (!messagingSupported) {
          console.warn("FCM no es compatible con este navegador.");
          return;
        }

        const messaging = getMessaging(firebaseApp);
        
        // Solicitar permiso al navegador. Si ya está otorgado, se resuelve de inmediato.
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // Obtener el token del dispositivo.
          const token = await getToken(messaging);

          if (token && token !== profile.fcmToken) {
            // Guardar el token en el perfil del usuario para enviarle notificaciones después
            const userRef = doc(db, 'users', profile.id);
            await updateDoc(userRef, { fcmToken: token });
          }
        } else {
          console.warn("Permiso de notificaciones denegado por el usuario.");
        }
      } catch (error) {
        console.error("Error configurando notificaciones push:", error);
      }
    };

    errorEmitter.on('request-notification-permission', handleRequestPermission);
    
    return () => {
      errorEmitter.off('request-notification-permission', handleRequestPermission);
    };
  }, [profile?.id, profile?.fcmToken, db, firebaseApp]);

  return null;
}
