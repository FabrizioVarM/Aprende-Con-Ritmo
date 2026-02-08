
"use client"

import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsStore } from '@/lib/settings-store';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, Upload, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { settings, updateSettings } = useSettingsStore();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [logoUrl, setLogoUrl] = useState(settings.appLogoUrl);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !authLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, isMounted, router]);

  useEffect(() => {
    setLogoUrl(settings.appLogoUrl);
  }, [settings]);

  const handleSave = () => {
    updateSettings({ appLogoUrl: logoUrl });
    toast({
      title: "Configuración Guardada ✨",
      description: "El icono de la aplicación ha sido actualizado correctamente.",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        toast({ description: "Imagen cargada correctamente. Recuerda guardar los cambios." });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomLogo = () => {
    const seed = Math.random().toString(36).substring(7);
    setLogoUrl(`https://picsum.photos/seed/${seed}/200/200`);
  };

  if (!isMounted || authLoading || !user || user.role !== 'admin') return null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-foreground font-headline tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-accent" />
            Configuración del Sistema
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Personaliza la identidad visual de Aprende Con Ritmo.</p>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-primary/5 p-8 border-b">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-accent" />
              Identidad Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="space-y-4 text-center shrink-0">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Previsualización del Logo</Label>
                <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-accent shadow-2xl mx-auto bg-white group">
                  <Image 
                    src={logoUrl} 
                    alt="Logo Preview" 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white rounded-xl text-accent hover:scale-110 transition-transform shadow-lg"
                      title="Subir imagen"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={generateRandomLogo}
                      className="p-2 bg-white rounded-xl text-secondary-foreground hover:scale-110 transition-transform shadow-lg"
                      title="Generar aleatorio"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground italic">Resolución recomendada: 200x200px</p>
              </div>

              <div className="flex-1 space-y-6 w-full">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">URL del Logotipo</Label>
                  <Input 
                    value={logoUrl} 
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="h-14 rounded-2xl border-2 font-bold px-6 focus:border-accent"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground font-medium">Puedes pegar una URL directa o subir un archivo local usando los controles de la imagen.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="rounded-2xl h-12 gap-2 border-2 font-black px-6 hover:bg-accent/5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" /> Subir Imagen
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="rounded-2xl h-12 gap-2 font-black text-muted-foreground"
                    onClick={generateRandomLogo}
                  >
                    <RefreshCw className="w-4 h-4" /> Imagen Aleatoria
                  </Button>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-8 bg-gray-50 border-t flex justify-end">
            <Button 
              onClick={handleSave}
              className="bg-accent text-white rounded-2xl h-16 px-12 text-lg font-black shadow-xl shadow-accent/20 hover:scale-105 transition-all gap-3"
            >
              <Save className="w-6 h-6" /> Guardar Cambios Globales
            </Button>
          </CardFooter>
        </Card>

        <div className="bg-orange-50 border-2 border-orange-200 rounded-[2rem] p-6 flex gap-4 items-start">
          <div className="p-2 bg-orange-100 rounded-xl">
            <ImageIcon className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h4 className="font-black text-orange-900">Nota Institucional</h4>
            <p className="text-sm text-orange-800 font-medium mt-1">
              Los cambios en el logotipo se aplicarán inmediatamente para todos los usuarios en la barra lateral, página de inicio y correos electrónicos del sistema.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
