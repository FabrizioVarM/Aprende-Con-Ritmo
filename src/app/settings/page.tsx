
"use client"

import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/lib/settings-store';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, Upload, RefreshCw, Save, ShieldCheck, Moon, Sun, MessageCircle, Phone, LayoutGrid, Mic2, Gift, ShoppingBag, ClipboardList } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { settings, updateSettings } = useSettingsStore();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [logoUrl, setLogoUrl] = useState(settings.appLogoUrl);
  const [darkMode, setDarkMode] = useState(settings.darkMode);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  
  // Local states for feature toggles
  const [enableProduction, setEnableProduction] = useState(settings.enableProduction);
  const [enableRewards, setEnableRewards] = useState(settings.enableRewards);
  const [enableMarket, setEnableMarket] = useState(settings.enableMarket);
  const [enablePostulations, setEnablePostulations] = useState(settings.enablePostulations);

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
    setDarkMode(settings.darkMode);
    setWhatsappNumber(settings.whatsappNumber);
    setEnableProduction(settings.enableProduction);
    setEnableRewards(settings.enableRewards);
    setEnableMarket(settings.enableMarket);
    setEnablePostulations(settings.enablePostulations);
  }, [settings]);

  const handleSave = () => {
    updateSettings({ 
      appLogoUrl: logoUrl,
      darkMode: darkMode,
      whatsappNumber: whatsappNumber,
      enableProduction,
      enableRewards,
      enableMarket,
      enablePostulations
    });
    toast({
      title: "Configuración Guardada ✨",
      description: "Los cambios se han aplicado correctamente en todo el sistema.",
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
          <p className="text-muted-foreground mt-1 text-lg font-medium">Personaliza la identidad y apariencia de Aprende Con Ritmo.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-md bg-white dark:bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
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
                      className="h-14 rounded-2xl border-2 font-bold px-6 focus:border-accent text-foreground bg-card"
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground font-medium">Puedes pegar una URL directa o subir un archivo local.</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      className="rounded-2xl h-12 gap-2 border-2 font-black px-6 hover:bg-accent/5 text-foreground"
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
          </Card>

          <Card className="rounded-[2.5rem] border-2 border-accent/20 shadow-md bg-white dark:bg-card overflow-hidden">
            <CardHeader className="bg-accent/5 p-8 border-b">
              <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                <LayoutGrid className="w-8 h-8 text-accent" />
                Gestión de Módulos Académicos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <p className="text-sm text-muted-foreground font-medium mb-4">
                Activa o desactiva las funciones de la academia para alumnos y profesores. Como administrador, tú siempre podrás acceder a ellas para realizar pruebas.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'production', label: 'Producción Musical', icon: Mic2, state: enableProduction, setter: setEnableProduction },
                  { id: 'rewards', label: 'Recompensas', icon: Gift, state: enableRewards, setter: setEnableRewards },
                  { id: 'market', label: 'RitmoMarket', icon: ShoppingBag, state: enableMarket, setter: setEnableMarket },
                  { id: 'postulations', label: 'Postulaciones', icon: ClipboardList, state: enablePostulations, setter: setEnablePostulations },
                ].map((mod) => (
                  <div key={mod.id} className="flex items-center justify-between p-5 bg-primary/5 rounded-2xl border-2 border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                        <mod.icon className="w-5 h-5 text-accent" />
                      </div>
                      <span className="font-black text-foreground">{mod.label}</span>
                    </div>
                    <Switch 
                      checked={mod.state}
                      onCheckedChange={mod.setter}
                      className="data-[state=checked]:bg-accent"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-md bg-white dark:bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                <MessageCircle className="w-8 h-8 text-accent" />
                Canales de Comunicación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Número de WhatsApp Institucional</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                  <Input 
                    value={whatsappNumber} 
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="h-14 pl-12 rounded-2xl border-2 font-bold focus:border-accent text-foreground bg-card"
                    placeholder="Ej: 51999999999"
                  />
                </div>
                <p className="text-xs text-muted-foreground font-medium italic">Incluya el código de país sin el signo "+". Este número se usará para el botón de ayuda en todo el sistema.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-md bg-white dark:bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                <Moon className="w-8 h-8 text-accent" />
                Preferencia de Apariencia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center justify-between p-6 bg-primary/5 rounded-3xl border-2 border-primary/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                    {darkMode ? <Moon className="w-6 h-6 text-accent" /> : <Sun className="w-6 h-6 text-orange-500" />}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-lg text-foreground">Modo Oscuro</h4>
                    <p className="text-sm text-muted-foreground font-medium">Activa una interfaz visual optimizada para ambientes con poca luz.</p>
                  </div>
                </div>
                <Switch 
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="scale-125 data-[state=checked]:bg-accent"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            className="bg-accent text-white rounded-2xl h-16 px-12 text-lg font-black shadow-xl shadow-accent/20 hover:scale-105 transition-all gap-3"
          >
            <Save className="w-6 h-6" /> Guardar Todos los Cambios
          </Button>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/30 rounded-[2rem] p-6 flex gap-4 items-start">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-xl">
            <ImageIcon className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h4 className="font-black text-orange-900 dark:text-orange-400">Nota Institucional</h4>
            <p className="text-sm text-orange-800 dark:text-orange-300/80 font-medium mt-1">
              Los cambios en los módulos, logotipo y el modo de apariencia se aplicarán inmediatamente para todos los usuarios que naveguen en la plataforma.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
