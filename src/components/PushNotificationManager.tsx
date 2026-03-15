"use client"

import { useEffect } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { useFirebaseApp, useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { toast } from '@/hooks/use-toast';

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
          toast({
            variant: "destructive",
            title: "Navegador no compatible",
            description: "Este navegador no soporta notificaciones push nativas."
          });
          return;
        }

        const messaging = getMessaging(firebaseApp);
        
        // Solicitar permiso al navegador.
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // Registro explícito del Service Worker para asegurar funcionamiento en segundo plano
          let registration;
          try {
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          } catch (swError) {
            console.error("Error registrando Service Worker:", swError);
          }

          // Obtener el token del dispositivo vinculándolo al Service Worker
          const token = await getToken(messaging, {
            serviceWorkerRegistration: registration,
            // Si usas una VAPID key en la consola de Firebase, deberías ponerla aquí:
            // vapidKey: 'TU_VAPID_KEY_AQUI'
          }).catch(err => {
            console.error("Error al obtener token FCM:", err);
            return null;
          });

          if (token) {
            // Guardar el token en el perfil del usuario para enviarle notificaciones después
            const userRef = doc(db, 'users', profile.id);
            await updateDoc(userRef, { fcmToken: token });
            
            toast({
              title: "¡Notificaciones Activas! 🔔",
              description: "Recibirás avisos sobre tus clases incluso con la app cerrada."
            });
          } else {
            toast({
              variant: "destructive",
              title: "Error de registro",
              description: "No se pudo generar el identificador de notificaciones. Intenta de nuevo más tarde."
            });
          }
        } else if (permission === 'denied') {
          toast({
            variant: "destructive",
            title: "Permiso Denegado",
            description: "Has bloqueado las notificaciones. Por favor, habilítalas en los ajustes de tu navegador para continuar."
          });
        }
      } catch (error) {
        console.error("Error configurando notificaciones push:", error);
        toast({
          variant: "destructive",
          title: "Error del sistema",
          description: "Ocurrió un fallo al configurar las alertas."
        });
      }
    };

    errorEmitter.on('request-notification-permission', handleRequestPermission);
    
    return () => {
      errorEmitter.off('request-notification-permission', handleRequestPermission);
    };
  }, [profile?.id, db, firebaseApp]);

  return null;
}
