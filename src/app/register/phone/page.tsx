
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import Image from 'next/image';
import { useSettingsStore } from '@/lib/settings-store';

export default function PhoneRegistrationPage() {
  const { user, updateUser, loading } = useAuth();
  const { settings } = useSettingsStore();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/register');
    }
  }, [user, loading, router]);

  const handleComplete = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (phoneNumber) {
      updateUser({ phone: phoneNumber });
    }
    
    router.push('/home');
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-primary/10 flex flex-col items-center justify-center p-6">
      <div className="max-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 bg-white rounded-3xl shadow-xl mx-auto mb-6 border-4 border-accent overflow-hidden">
            <Image 
              src={settings.appLogoUrl} 
              alt="Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Mantengámonos en contacto 📱
          </h1>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Tu número nos ayudará a coordinar tus clases y enviarte avisos importantes.
          </p>
        </div>

        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm rounded-[2.5rem] p-4">
          <CardHeader>
            <CardTitle className="text-foreground">Número de Contacto</CardTitle>
            <CardDescription>Este requisito es opcional.</CardDescription>
          </CardHeader>
          <form onSubmit={handleComplete}>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-foreground font-bold">Teléfono / WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+51 999 999 999" 
                    className="pl-12 h-14 rounded-2xl border-2 font-bold focus:border-accent bg-background text-foreground"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground font-medium italic">
                  Si deseas, puedes saltar este paso y agregar tu número después desde tu perfil musical.
                </p>
              </div>
            </CardContent>
            <div className="p-6 pt-0 space-y-3">
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white rounded-2xl h-14 text-lg font-black shadow-lg shadow-accent/20">
                Finalizar y Entrar al Panel
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:bg-primary/10"
                onClick={() => router.push('/home')}
              >
                Saltar por ahora <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
