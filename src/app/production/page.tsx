
"use client"

import AppLayout from '@/components/layout/AppLayout';
import { Mic2, Info } from 'lucide-react';

export default function ProductionPage() {
  return (
    <AppLayout>
      <div className="space-y-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-accent/10 p-8 rounded-[3rem] border-2 border-accent/20 shadow-xl shadow-accent/5">
          <Mic2 className="w-20 h-20 text-accent animate-pulse" />
        </div>
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-black text-foreground">Producción Musical 🎵</h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            Estamos preparando un espacio para que puedas grabar, editar y compartir tus propias creaciones directamente en la plataforma.
          </p>
          <div className="flex items-center gap-2 justify-center bg-orange-50 dark:bg-orange-900/20 px-6 py-3 rounded-2xl border-2 border-orange-200 dark:border-orange-900/30 text-orange-700 dark:text-orange-400">
            <Info className="w-5 h-5" />
            <span className="font-black uppercase text-xs tracking-widest">Estado: En Desarrollo Activo</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
