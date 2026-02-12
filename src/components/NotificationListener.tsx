
"use client"

import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

/**
 * Componente invisible que escucha nuevas notificaciones y muestra Toasts instantáneos.
 * Optimizado para evitar el error de índice de Firestore ordenando localmente.
 */
export function NotificationListener() {
  const { user } = useAuth();
  const { toast } = useToast();
  const db = useFirestore();
  const lastProcessedRef = useRef<string | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!user?.id || !db) return;

    // Simplificamos la consulta eliminando el orderBy para evitar el error de failed-precondition (índice faltante)
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        isInitialLoad.current = false;
        return;
      }

      // Obtenemos todos los documentos y los ordenamos localmente para encontrar el más reciente
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const latest = docs[0];

      // Si es la carga inicial, guardar el ID de la más reciente pero no mostrar toast
      if (isInitialLoad.current) {
        lastProcessedRef.current = latest.id;
        isInitialLoad.current = false;
        return;
      }

      // Si el ID es diferente al último procesado y no está marcada como leída
      if (latest.id !== lastProcessedRef.current && !latest.read) {
        lastProcessedRef.current = latest.id;
        
        toast({
          title: latest.title || "Nueva Notificación",
          description: latest.body,
          duration: 6000,
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
