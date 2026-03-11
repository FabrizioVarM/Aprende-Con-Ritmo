"use client"

import { useEffect, useRef } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { useFirebaseApp, useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

/**
 * Este componente gestiona la solicitud de permisos de notificación
 * y registra el token FCM en el perfil del usuario en Firestore.
 */
export function PushNotificationManager() {
  const { profile, firestore: db } = useFirebase();
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    // Solo solicitar si el usuario está logueado y no lo hemos hecho en esta sesión
    if (!profile?.id || !db || hasRequestedRef.current) return;

    const setupNotifications = async () => {
      try {
        const messagingSupported = await isSupported();
        if (!messagingSupported) return;

        const messaging = getMessaging(firebaseApp);
        
        // Solicitar permiso al navegador
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // Obtener el token del dispositivo
          // Nota: El 'vapidKey' se obtiene de la consola de Firebase (Project Settings -> Cloud Messaging)
          const token = await getToken(messaging, {
            // Reemplaza esto con tu VAPID Key pública de la consola de Firebase si es necesario
            // vapidKey: 'TU_VAPID_KEY_AQUI'
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
      } finally {
        hasRequestedRef.current = true;
      }
    };

    setupNotifications();
  }, [profile?.id, profile?.fcmToken, db, firebaseApp]);

  return null;
}
