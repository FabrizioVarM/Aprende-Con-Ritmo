
"use client"

import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useSettingsStore } from '@/lib/settings-store';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';
import { 
  Image as ImageIcon, 
  Upload, 
  RefreshCw, 
  Save, 
  ShieldCheck, 
  Moon, 
  Sun, 
  MessageCircle, 
  Phone, 
  LayoutGrid, 
  Mic2, 
  Gift, 
  ShoppingBag, 
  ClipboardList, 
  Eye, 
  Power,
  MapPin,
  Plus,
  X,
  Scale,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getDirectImageUrl } from '@/lib/utils/images';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { settings, updateSettings } = useSettingsStore();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [logoUrl, setLogoUrl] = useState(settings.appLogoUrl);
  const [darkMode, setDarkMode] = useState(settings.darkMode);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [termsContent, setTermsContent] = useState(settings.termsContent || '');
  
  // Local states for feature visibility and usage
  const [showProd, setShowProd] = useState(settings.showProduction);
  const [enableProd, setEnableProd] = useState(settings.enableProduction);
  const [showRew, setShowRew] = useState(settings.showRewards);
  const [enableRew, setEnableRew] = useState(settings.enableRewards);
  const [showMark, setShowMark] = useState(settings.showMarket);
  const [enableMark, setEnableMarket] = useState(settings.enableMarket);
  const [showPost, setShowPost] = useState(settings.showPostulations);
  const [enablePost, setEnablePost] = useState(settings.enablePostulations);

  // Dynamic Zones State
  const [localZones, setLocalZones] = useState<string[]>(settings.zones || []);
  const [newZoneName, setNewZoneName] = useState('');

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
    setShowProd(settings.showProduction);
    setEnableProd(settings.enableProduction);
    setShowRew(settings.showRewards);
    setEnableRew(settings.enableRewards);
    setShowMark(settings.showMarket);
    setEnableMarket(settings.enableMarket);
    setShowPost(settings.showPostulations);
    setEnablePost(settings.enablePostulations);
    setLocalZones(settings.zones || []);
    setTermsContent(settings.termsContent || '');
  }, [settings]);

  const handleSave = () => {
    updateSettings({ 
      appLogoUrl: logoUrl,
      darkMode: darkMode,
      whatsappNumber: whatsappNumber,
      showProduction: showProd,
      enableProduction: enableProd,
      showRewards: showRew,
      enableRewards: enableRew,
      showMarket: showMark,
      enableMarket: enableMark,
      showPostulations: showPost,
      enablePostulations: enablePost,
      zones: localZones,
      termsContent: termsContent
    });
    toast({
      title: "Configuración Guardada ✨",
      description: "Los cambios se han aplicado correctamente en todo el sistema.",
    });
  };

  const addZone = () => {
    const trimmed = newZoneName.trim();
    if (trimmed && !localZones.includes(trimmed)) {
      setLocalZones([...localZones, trimmed]);
      setNewZoneName('');
    }
  };

  const removeZone = (zone: string) => {
    if (zone === 'Virtual') {
      toast({ variant: "destructive", title: "Acción bloqueada", description: "La zona Virtual es obligatoria para las clases online." });
      return;
    }
    setLocalZones(localZones.filter(z => z !== zone));
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
          {/* IDENTIDAD VISUAL */}
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
                      src={getDirectImageUrl(logoUrl)} 
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
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      className="rounded-2xl h-12 gap-2 border-2 font-black px-6 hover:bg-accent/5 text-foreground"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" /> Subir Imagen
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ZONAS GEOGRÁFICAS */}
          <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-md bg-white dark:bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                <MapPin className="w-8 h-8 text-accent" />
                Zonas de Cobertura
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10 mb-2">
                <p className="text-sm text-muted-foreground font-medium">
                  Define las zonas donde la academia ofrece clases a domicilio. La zona <span className="font-black text-accent">Virtual</span> es esencial para las clases online y no puede ser eliminada.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Input 
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Nombre de la zona (ej: San Borja)"
                  className="h-14 rounded-2xl border-2 font-bold px-6 focus:border-accent bg-card text-foreground"
                  onKeyDown={(e) => e.key === 'Enter' && addZone()}
                />
                <Button onClick={addZone} className="bg-accent text-white h-14 px-8 rounded-2xl font-black shadow-lg shadow-accent/20 hover:scale-105 transition-all">
                  <Plus className="w-5 h-5 mr-2" /> Agregar
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                {localZones.map((zone) => (
                  <Badge 
                    key={zone} 
                    variant="secondary" 
                    className="h-12 pl-5 pr-3 rounded-2xl border-2 border-primary/10 bg-primary/5 text-foreground font-bold flex items-center gap-3 shadow-sm hover:border-accent/30 transition-all group"
                  >
                    <span className="text-sm">{zone}</span>
                    {zone !== 'Virtual' ? (
                      <button 
                        onClick={() => removeZone(zone)}
                        className="bg-white dark:bg-slate-800 p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors shadow-sm"
                        title="Eliminar zona"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="p-1.5 rounded-lg opacity-30">
                        <Save className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* POLÍTICAS Y TÉRMINOS */}
          <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-md bg-white dark:bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                <Scale className="w-8 h-8 text-accent" />
                Políticas y Aspectos Legales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-accent/5 p-5 rounded-2xl border-2 border-accent/20 mb-2 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <p className="text-sm font-black text-foreground">Editor de Diseño Dinámico</p>
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Ahora puedes dar estilo a tus términos legales. Los cambios se verán reflejados con diseño en el registro.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-primary/10">
                    <span className="text-[10px] font-black uppercase text-accent block mb-1">Negritas</span>
                    <p className="text-[10px] font-bold text-muted-foreground italic">Usa **texto** para resaltar palabras clave en color acento.</p>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-primary/10">
                    <span className="text-[10px] font-black uppercase text-accent block mb-1">Secciones</span>
                    <p className="text-[10px] font-bold text-muted-foreground italic">Empieza una línea con "X." (ej: 1. Título) para crear un encabezado destacado.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Cuerpo de los Términos y Condiciones</Label>
                <Textarea 
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  className="min-h-[400px] rounded-2xl border-2 font-bold p-6 focus:border-accent text-foreground bg-card text-sm leading-relaxed"
                  placeholder="Escribe aquí los términos legales..."
                />
              </div>
            </CardContent>
          </Card>

          {/* GESTIÓN DE MÓDULOS */}
          <Card className="rounded-[2.5rem] border-2 border-accent/20 shadow-md bg-white dark:bg-card overflow-hidden">
            <CardHeader className="bg-accent/5 p-8 border-b">
              <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                <LayoutGrid className="w-8 h-8 text-accent" />
                Gestión de Módulos Académicos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10 mb-6">
                <p className="text-sm text-muted-foreground font-medium">
                  Configura la visibilidad y el acceso para alumnos y profesores. 
                  <span className="font-black text-accent"> Tú como administrador siempre tendrás acceso total para pruebas.</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {[
                  { id: 'prod', label: 'Producción Musical', icon: Mic2, show: showProd, setShow: setShowProd, enable: enableProd, setEnable: setEnableProd },
                  { id: 'rew', label: 'Recompensas', icon: Gift, show: showRew, setShow: setShowRew, enable: enableRew, setEnable: setEnableRew },
                  { id: 'mark', label: 'RitmoMarket', icon: ShoppingBag, show: showMark, setShow: setShowMark, enable: enableMark, setEnable: setEnableMarket },
                  { id: 'post', label: 'Postulaciones', icon: ClipboardList, show: showPost, setShow: setShowPost, enable: enablePost, setEnable: setEnablePost },
                ].map((mod) => (
                  <div key={mod.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10 gap-6">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm shrink-0">
                        <mod.icon className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-foreground">{mod.label}</h4>
                        <p className="text-xs text-muted-foreground font-medium">Gestionar presencia en el menú y operatividad.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-8 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visibilidad</p>
                          <p className="text-[9px] font-bold text-accent italic">{mod.show ? 'Visible en menú' : 'Oculto para todos'}</p>
                        </div>
                        <Switch checked={mod.show} onCheckedChange={mod.setShow} className="data-[state=checked]:bg-blue-500" />
                      </div>
                      
                      <div className="flex items-center gap-3 border-l border-primary/10 pl-8">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Uso / Acceso</p>
                          <p className="text-[9px] font-bold text-emerald-600 italic">{mod.enable ? 'Operativo' : 'Próximamente'}</p>
                        </div>
                        <Switch checked={mod.enable} onCheckedChange={mod.setEnable} className="data-[state=checked]:bg-emerald-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CANALES DE COMUNICACIÓN */}
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
      </div>
    </AppLayout>
  );
}
