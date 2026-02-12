
"use client"

import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

/**
 * Componente invisible que escucha nuevas notificaciones y muestra Toasts instantáneos.
 */
export function NotificationListener() {
  const { user } = useAuth();
  const { toast } = useToast();
  const db = useFirestore();
  const lastProcessedRef = useRef<string | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!user?.id || !db) return;

    // Solo escuchar notificaciones recientes (creadas después de ahora)
    // Pero como no tenemos un campo timestamp fácil de comparar con "ahora" en JS directo sin server-side
    // usaremos una bandera de carga inicial para evitar disparar toasts por notificaciones viejas.
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.id),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        isInitialLoad.current = false;
        return;
      }

      const latest = snapshot.docs[0];
      const data = latest.data();

      // Si es la carga inicial, guardar el ID de la más reciente pero no mostrar toast
      if (isInitialLoad.current) {
        lastProcessedRef.current = latest.id;
        isInitialLoad.current = false;
        return;
      }

      // Si el ID es diferente al último procesado y no está marcada como leída (opcional)
      if (latest.id !== lastProcessedRef.current) {
        lastProcessedRef.current = latest.id;
        
        toast({
          title: data.title || "Nueva Notificación",
          description: data.body,
          duration: 6000,
          // Icono personalizado según el tipo
          action: (
            <div className="bg-accent text-white p-2 rounded-xl shadow-lg">
              <Bell className="w-4 h-4" />
            </div>
          )
        });
      }
    });

    return () => unsubscribe();
  }, [db, user?.id, toast]);

  return null;
}
