
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { useSettingsStore } from '@/lib/settings-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const { settings } = useSettingsStore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email);
    
    if (success) {
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Error de acceso 🚫",
        description: "Esta cuenta no existe o ha sido eliminada por el administrador. Por favor, regístrate de nuevo para empezar de cero.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/20 p-6">
      <div className="w-full max-w-md space-y-8">
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
          <h2 className="text-3xl font-bold font-headline">Bienvenido de nuevo</h2>
          <p className="text-muted-foreground mt-2">Inicia sesión para continuar tu viaje musical</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl p-2">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder al panel</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="nombre@ejemplo.com" 
                    className="pl-10 rounded-xl"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 rounded-xl"
                    required 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl py-6 text-lg">
                Ingresar
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                ¿No tienes una cuenta? <Link href="/register" className="text-accent font-bold hover:underline">Regístrate</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
        
        <div className="grid grid-cols-3 gap-4 text-xs font-medium opacity-50">
          <Button variant="ghost" className="h-auto p-2" onClick={() => setEmail('ana@example.com')}>Demo Estudiante</Button>
          <Button variant="ghost" className="h-auto p-2" onClick={() => setEmail('carlos@example.com')}>Demo Profesor</Button>
          <Button variant="ghost" className="h-auto p-2" onClick={() => setEmail('admin@example.com')}>Demo Admin</Button>
        </div>
      </div>
    </div>
  );
}
