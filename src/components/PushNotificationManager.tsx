"use client"

import { useEffect, useRef } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { useFirebaseApp, useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * Este componente gestiona la solicitud de permisos de notificación
 * y registra el token FCM en el perfil del usuario en Firestore.
 * Ahora se activa SOLO cuando se emite el evento 'request-notification-permission'.
 */
export function PushNotificationManager() {
  const { profile, firestore: db } = useFirebase();
  const firebaseApp = useFirebaseApp();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    // Escuchar la petición de permisos (ej: después de una reserva)
    const handleRequestPermission = async () => {
      // Solo solicitar si el usuario está logueado y no lo hemos hecho en esta sesión
      if (!profile?.id || !db || hasRequestedRef.current) return;

      try {
        const messagingSupported = await isSupported();
        if (!messagingSupported) return;

        const messaging = getMessaging(firebaseApp);
        
        // Solicitar permiso al navegador
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // Marcar como solicitado para no volver a preguntar en la misma sesión
          hasRequestedRef.current = true;

          // Obtener el token del dispositivo
          const token = await getToken(messaging, {
            // vapidKey: 'TU_VAPID_KEY_AQUI' // Recuerda poner tu llave aquí
          });

          if (token && token !== profile.fcmToken) {
            // Guardar el token en el perfil del usuario para enviarle notificaciones después
            const userRef = doc(db, 'users', profile.id);
            await updateDoc(userRef, { fcmToken: token });
            console.log("FCM Token registrado con éxito.");
          }
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
