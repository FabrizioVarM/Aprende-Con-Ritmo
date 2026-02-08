
"use client"

import AppLayout from '@/components/layout/AppLayout';
import { ShoppingBag, Info } from 'lucide-react';

export default function MarketPage() {
  return (
    <AppLayout>
      <div className="space-y-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[3rem] border-2 border-blue-200 dark:border-blue-900/20 shadow-xl">
          <ShoppingBag className="w-20 h-20 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-black text-foreground">RitmoMarket 🛒</h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            Un marketplace exclusivo para alumnos donde podrás comprar instrumentos, accesorios y merchandising oficial de Aprende Con Ritmo.
          </p>
          <div className="flex items-center gap-2 justify-center bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-2xl border-2 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400">
            <Info className="w-5 h-5" />
            <span className="font-black uppercase text-xs tracking-widest">Integrando pasarela de pagos</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
