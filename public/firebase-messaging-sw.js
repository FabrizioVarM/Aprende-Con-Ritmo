// Scripts necesarios para Firebase en el Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Inicialización de Firebase dentro del Worker
// Estos valores coinciden con tu configuración de src/firebase/config.ts
firebase.initializeApp({
  apiKey: "AIzaSyCRCgXmUbT3SfrcfGi-dLAi-k9oPWpQ5Tk",
  authDomain: "studio-5164110435-e4c80.firebaseapp.com",
  projectId: "studio-5164110435-e4c80",
  messagingSenderId: "741647661492",
  appId: "1:741647661492:web:538ba3a412bdc669e4dae1"
});

const messaging = firebase.messaging();

// Este evento se dispara cuando llega una notificación y la app NO está abierta
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje en segundo plano recibido:', payload);

  const notificationTitle = payload.notification.title || "Aprende con Ritmo";
  const notificationOptions = {
    body: payload.notification.body || "Tienes una nueva actualización.",
    icon: '/icon', // Referencia al icono generado en src/app/icon.tsx
    badge: '/icon',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
