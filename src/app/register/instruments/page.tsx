
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useSettingsStore } from '@/lib/settings-store';

const INSTRUMENTS = [
  { id: 'Guitarra', name: 'Guitarra', icon: '🎸' },
  { id: 'Piano', name: 'Piano', icon: '🎹' },
  { id: 'Violín', name: 'Violín', icon: '🎻' },
  { id: 'Canto', name: 'Canto', icon: '🎤' },
  { id: 'Batería', name: 'Batería', icon: '🥁' },
  { id: 'Bajo', name: 'Bajo', icon: '🎸' },
  { id: 'Teoría', name: 'Teoría Musical', icon: '📖' },
];

export default function InstrumentSelectionPage() {
  const { user, updateUser, loading } = useAuth();
  const { settings } = useSettingsStore();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/register');
    }
  }, [user, loading, router]);

  const toggleInstrument = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    if (selected.length === 0) return;
    updateUser({ instruments: selected });
    router.push('/register/phone');
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-primary/10 flex flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 bg-white rounded-3xl shadow-xl mx-auto mb-6 border-4 border-accent overflow-hidden">
            <Image 
              src={settings.appLogoUrl} 
              alt="Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
            ¡Casi listo, <span className="text-accent">{user.name.split(' ')[0]}</span>! 🎼
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Cuéntanos, ¿qué instrumento te gustaría aprender en Aprende Con Ritmo? ¡Puedes elegir más de uno!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {INSTRUMENTS.map((inst) => {
            const isSelected = selected.includes(inst.id);
            return (
              <button
                key={inst.id}
                onClick={() => toggleInstrument(inst.id)}
                className={cn(
                  "relative group p-6 rounded-[2.5rem] border-4 transition-all duration-300 flex flex-col items-center gap-4",
                  isSelected 
                    ? "bg-accent border-accent text-white shadow-xl scale-105" 
                    : "bg-card border-primary/10 text-foreground hover:border-accent/40 hover:bg-accent/5"
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner",
                  isSelected ? "bg-white/20" : "bg-primary/10"
                )}>
                  {inst.icon}
                </div>
                <span className="font-black text-xs uppercase tracking-widest text-center">
                  {inst.name}
                </span>
                
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-white text-accent p-1.5 rounded-full shadow-lg border-2 border-accent animate-in zoom-in">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-6 pt-8">
          <Button 
            size="lg" 
            disabled={selected.length === 0}
            onClick={handleFinish}
            className="rounded-full px-12 py-8 text-xl font-black shadow-2xl bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-all hover:scale-105"
          >
            Comenzar mi Viaje Musical
          </Button>
          
          <div className="flex items-center gap-2 text-muted-foreground bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full border border-primary/10">
            <Info className="w-4 h-4 text-accent" />
            <p className="text-xs font-bold italic">Podrás cambiar tus instrumentos más tarde en tu perfil.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
