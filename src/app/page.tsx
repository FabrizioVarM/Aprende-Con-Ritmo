"use client"

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { Music, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary via-background to-background">
      <div className="max-w-3xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="p-4 bg-accent rounded-3xl shadow-xl shadow-accent/20 animate-bounce">
            <Music className="w-12 h-12 text-white" />
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
