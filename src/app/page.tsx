
"use client"

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { useSettingsStore } from '@/lib/settings-store';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const { user } = useAuth();
  const { settings } = useSettingsStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary via-background to-background">
      <div className="max-w-3xl text-center space-y-8">
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
        
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-secondary-foreground">
          Aprende Con <span className="text-accent underline decoration-secondary underline-offset-8">Ritmo</span>
        </h1>
        
        <p className="text-xl text-muted-foreground leading-relaxed">
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
            className="rounded-full px-8 py-7 text-lg bg-white/50 border-primary"
            onClick={() => router.push('/login')}
          >
            Iniciar sesión <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
