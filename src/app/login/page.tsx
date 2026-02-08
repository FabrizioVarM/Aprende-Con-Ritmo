"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { useSettingsStore } from '@/lib/settings-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Lock, Music, Music2, Music3, Music4, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const { settings } = useSettingsStore();
  const router = useRouter();
  const { toast } = useToast();
  const [notes, setNotes] = useState<DecorativeNote[]>([]);

  useEffect(() => {
    const generatedNotes = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `-${Math.random() * 10}s`,
      duration: `${6 + Math.random() * 8}s`,
      size: 24 + Math.random() * 30,
      iconIndex: Math.floor(Math.random() * 4)
    }));
    setNotes(generatedNotes);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const success = await login(email, password);
    
    if (success) {
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Error de acceso 🚫",
        description: "Credenciales incorrectas. Por favor, verifica tu correo y contraseña.",
      });
      setIsLoggingIn(false);
    }
  };

  const icons = [Music, Music2, Music3, Music4];

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/20 p-6 relative overflow-hidden">
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

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-16 h-16 bg-white p-1 rounded-2xl shadow-lg mb-4 overflow-hidden border-2 border-accent">
            <Image 
              src={settings.appLogoUrl} 
              alt="Logo" 
              fill 
              className="object-cover"
              data-ai-hint="academy logo"
            />
          </div>
          <h2 className="text-3xl font-bold font-headline text-foreground">Bienvenido de nuevo</h2>
          <p className="text-muted-foreground mt-2">Inicia sesión para continuar tu viaje musical</p>
        </div>

        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm rounded-3xl p-2">
          <CardHeader>
            <CardTitle className="text-foreground">Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales reales de Firebase</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="nombre@ejemplo.com" 
                    className="pl-10 rounded-xl bg-background text-foreground border-border"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 rounded-xl bg-background text-foreground border-border"
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" disabled={isLoggingIn} className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl py-6 text-lg">
                {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Ingresar'}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                ¿No tienes una cuenta? <Link href="/register" className="text-accent font-bold hover:underline">Regístrate</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
