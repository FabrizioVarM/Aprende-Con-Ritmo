
"use client"

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { useSettingsStore } from '@/lib/settings-store';
import { ArrowRight, Music, Music2, Music3, Music4 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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
  const { user } = useAuth();
  const { settings } = useSettingsStore();
  const router = useRouter();
  const [notes, setNotes] = useState<DecorativeNote[]>([]);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }

    // Generar notas con propiedades aleatorias solo en el cliente
    // Se ha reducido la duración (de 15-30s a 6-14s) para aumentar la velocidad
    const generatedNotes = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${6 + Math.random() * 8}s`,
      size: 24 + Math.random() * 40,
      iconIndex: Math.floor(Math.random() * 4)
    }));
    setNotes(generatedNotes);
  }, [user, router]);

  if (user) {
    return null;
  }

  const icons = [Music, Music2, Music3, Music4];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary via-background to-background relative overflow-hidden">
      
      {/* Fondo decorativo de notas musicales - Opacidad aumentada al 30% */}
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

      <div className="max-w-3xl text-center space-y-8 relative z-10">
        <div className="flex justify-center">
          <div className="relative w-24 h-24 p-1 bg-white rounded-[2rem] shadow-2xl shadow-accent/20 animate-bounce overflow-hidden border-4 border-accent">
            <Image 
              src={settings.appLogoUrl} 
              alt="Logo" 
              fill 
              className="object-cover"
              data-ai-hint="academy logo"
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
    </div>
  );
}
