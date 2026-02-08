
"use client"

import AppLayout from '@/components/layout/AppLayout';
import { Gift, Info } from 'lucide-react';

export default function RewardsPage() {
  return (
    <AppLayout>
      <div className="space-y-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[3rem] border-2 border-emerald-200 dark:border-emerald-900/20 shadow-xl">
          <Gift className="w-20 h-20 text-emerald-600 dark:text-emerald-400 animate-bounce" />
        </div>
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-black text-foreground">Sistema de Recompensas 🎁</h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            Canjea tus puntos de progreso por premios exclusivos, descuentos en mensualidades y materiales de edición limitada.
          </p>
          <div className="flex items-center gap-2 justify-center bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400">
            <Info className="w-5 h-5" />
            <span className="font-black uppercase text-xs tracking-widest">Próximamente: Tienda de Puntos</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
