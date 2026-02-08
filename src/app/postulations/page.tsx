
"use client"

import AppLayout from '@/components/layout/AppLayout';
import { ClipboardList, Info } from 'lucide-react';

export default function PostulationsPage() {
  return (
    <AppLayout>
      <div className="space-y-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-purple-50 dark:bg-purple-900/10 p-8 rounded-[3rem] border-2 border-purple-200 dark:border-purple-900/20 shadow-xl">
          <ClipboardList className="w-20 h-20 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-black text-foreground">Postulaciones y Convocatorias 📄</h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            Inscríbete a festivales, audiciones y proyectos especiales de la academia. Gestiona tus solicitudes en tiempo real.
          </p>
          <div className="flex items-center gap-2 justify-center bg-purple-50 dark:bg-purple-900/20 px-6 py-3 rounded-2xl border-2 border-purple-200 dark:border-purple-900/30 text-purple-700 dark:text-purple-400">
            <Info className="w-5 h-5" />
            <span className="font-black uppercase text-xs tracking-widest">Diseñando formularios de inscripción</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
