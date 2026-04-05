"use client"

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { useSettingsStore } from '@/lib/settings-store';
import { ArrowRight, Music, Music2, Music3, Music4, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getDirectImageUrl } from '@/lib/utils/images';
import { cn } from '@/lib/utils';

interface DecorativeNote {
  id: number;
  left: string;
  top: string;
  delay: string;
  duration: string;
  size: number;
  iconIndex: number;
}

export default function Home() {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSettingsStore();
  const router = useRouter();
  const [notes, setNotes] = useState<DecorativeNote[]>([]);

  useEffect(() => {
    // Si se detecta un usuario cargado, redirigir al home
    if (user) {
      router.push('/home');
    }

    // Generar notas musicales decorativas de inmediato
    const generatedNotes = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `-${Math.random() * 10}s`,
      duration: `${6 + Math.random() * 8}s`,
      size: 24 + Math.random() * 40,
      iconIndex: Math.floor(Math.random() * 4)
    }));
    setNotes(generatedNotes);
  }, [user, router]);

  const icons = [Music, Music2, Music3, Music4];

  // Placeholder para el logo si settings aún no carga
  const logoPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FF8B7A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E";
  const finalLogoUrl = settings.appLogoUrl || logoPlaceholder;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary via-background to-background relative overflow-hidden">
      
      {/* Pantalla de carga inteligente (Overlay solo si hay sesión detectada) */}
      {authLoading && firebaseUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="bg-card p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 border-2 border-primary/20">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <div className="space-y-1 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Iniciando Ritmo</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase">Restaurando tu sesión musical...</p>
            </div>
          </div>
        </div>
      )}

      {/* Notas flotantes decorativas (Se muestran de inmediato) */}
      <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
        {notes.map((note) => {
          const Icon = icons[note.iconIndex];
          return (
            <div 
              key={note.id}
              className="absolute animate-float"
              style={{
                left: note.left,
                top: note.top,
                animationDelay: note.delay,
                animationDuration: note.duration,
              }}
            >
              <Icon size={note.size} className="text-accent" />
            </div>
          );
        })}
      </div>

      {/* Contenido de presentación (Carga automática) */}
      <div className={cn(
        "max-w-3xl text-center space-y-8 relative z-10 transition-all duration-700",
        user ? "opacity-0 scale-95" : "opacity-100 scale-100"
      )}>
        <div className="flex justify-center">
          <div className="relative w-24 h-24 p-1 bg-white rounded-[2rem] shadow-2xl shadow-accent/20 animate-bounce overflow-hidden border-4 border-accent">
            <Image 
              src={getDirectImageUrl(finalLogoUrl)} 
              alt="Logo" 
              fill 
              className="object-cover"
              data-ai-hint="academy logo"
              priority 
            />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-foreground">
          Aprende Con <span className="text-accent underline decoration-secondary underline-offset-8">Ritmo</span>
        </h1>
        
        <p className="text-xl text-muted-foreground leading-relaxed font-medium">
          La plataforma todo en uno para escuelas de música modernas. Gestiona horarios, 
          sigue el progreso y comparte recursos con facilidad.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="rounded-full px-8 py-7 text-lg shadow-lg hover:shadow-accent/20 bg-accent text-white hover:bg-accent/90"
            onClick={() => router.push('/register')}
          >
            Empieza a aprender ahora
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full px-8 py-7 text-lg bg-white/50 border-primary dark:text-foreground font-bold"
            onClick={() => router.push('/login')}
          >
            Iniciar sesión <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Versión de la Aplicación */}
      <div className="absolute bottom-4 right-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 pointer-events-none select-none">
        v2.1.20
      </div>
    </div>
  );
}
