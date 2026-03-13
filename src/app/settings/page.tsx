"use client"

import { useState, useRef, useEffect, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useSettingsStore } from '@/lib/settings-store';
import { useAuth } from '@/lib/auth-store';
import { useBookingStore } from '@/lib/booking-store';
import { useNewsStore } from '@/lib/news-store';
import { useResourceStore } from '@/lib/resource-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useMilestonesStore } from '@/lib/milestones-store';
import { useSkillsStore } from '@/lib/skills-store';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { 
  ImageIcon, 
  Upload, 
  RefreshCw, 
  Save, 
  ShieldCheck, 
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
  Sparkles,
  Activity,
  Zap,
  Database,
  Info,
  AlertCircle,
  Users,
  HardDrive,
  MousePointerClick,
  Network,
  CalendarDays,
  FileText,
  CheckCircle2,
  Trophy,
  TrendingUp,
  Star,
  ExternalLink,
  MessageSquareMore,
  Settings,
  Bell,
  BellRing,
  Globe
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getDirectImageUrl } from '@/lib/utils/images';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SettingsPage() {
  const { user, allUsers, updateUser, loading: authLoading } = useAuth();
  const { settings, updateSettings } = useSettingsStore();
  const { availabilities } = useBookingStore();
  const { articles } = useNewsStore();
  const { resources } = useResourceStore();
  const { completions } = useCompletionStore();
  const { milestones } = useMilestonesStore();
  const { skills } = useSkillsStore();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [logoUrl, setLogoUrl] = useState(settings.appLogoUrl);
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

  // Notification Preference State
  const [notificationsEnabled, setNotificationsEnabled] = useState(!!user?.fcmToken);
  const lastManualToggleTime = useRef<number>(0);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, isMounted, router]);

  useEffect(() => {
    setLogoUrl(settings.appLogoUrl);
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

  useEffect(() => {
    // Solo sincronizar con la base de datos si no ha habido una interacción manual reciente.
    const now = Date.now();
    if (user?.fcmToken !== undefined && (now - lastManualToggleTime.current > 4000)) {
      setNotificationsEnabled(!!user.fcmToken);
    }
  }, [user?.fcmToken]);

  const isAdmin = user?.role === 'admin';

  // Cálculos de cuotas de Firebase (Spark Plan)
  const quotaStats = useMemo(() => {
    if (!isAdmin) return null;
    const counts = {
      users: allUsers.length,
      news: articles.length,
      resources: resources.length,
      schedule: availabilities.length,
      completions: completions.length,
      milestones: milestones.length,
      skills: skills.length,
    };

    const totalDocs = Object.values(counts).reduce((a, b) => a + b, 0);
    
    // Límites de Firebase Spark (Gratis)
    const AUTH_LIMIT = 50000; 
    const FIRESTORE_STORAGE_LIMIT_MB = 1024; 

    const estimatedSizeMB = (totalDocs * 2.5) / 1024;

    return {
      counts,
      users: {
        current: counts.users,
        limit: AUTH_LIMIT,
        percent: Math.min((counts.users / AUTH_LIMIT) * 100, 100)
      },
      docs: {
        current: totalDocs,
        estimatedMB: estimatedSizeMB.toFixed(3),
        limitMB: FIRESTORE_STORAGE_LIMIT_MB,
        percent: Math.min((estimatedSizeMB / FIRESTORE_STORAGE_LIMIT_MB) * 100, 100)
      }
    };
  }, [allUsers, articles, resources, availabilities, completions, milestones, skills, isAdmin]);

  const handleSave = () => {
    if (!isAdmin) return;
    updateSettings({ 
      appLogoUrl: logoUrl,
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
      description: "Los cambios globales se han aplicado correctamente.",
    });
  };

  const handleToggleNotifications = (val: boolean) => {
    lastManualToggleTime.current = Date.now();
    setNotificationsEnabled(val);
    
    if (val) {
      errorEmitter.emit('request-notification-permission', undefined);
      toast({
        title: "Activando Notificaciones",
        description: "Se solicitará permiso a tu navegador para enviarte alertas.",
      });
    } else {
      updateUser({ fcmToken: "" });
      toast({
        title: "Notificaciones Desactivadas",
        description: "Ya no recibirás alertas en este dispositivo.",
      });
    }
  };

  const handleOpenInBrowser = () => {
    window.open(window.location.origin + window.location.pathname, '_blank');
    toast({
      title: "Abriendo Navegador",
      description: "Se ha abierto la aplicación en una pestaña nueva para facilitar los permisos.",
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
      toast({ variant: "destructive", title: "Acción bloqueada", description: "La zona Virtual es obligatoria." });
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
        toast({ description: "Imagen cargada correctamente." });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomLogo = () => {
    const seed = Math.random().toString(36).substring(7);
    setLogoUrl(`https://picsum.photos/seed/${seed}/200/200`);
  };

  if (!isMounted || authLoading || !user) return null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-foreground font-headline tracking-tight flex items-center gap-3">
            <Settings className="w-10 h-10 text-accent" />
            {isAdmin ? 'Configuración del Sistema' : 'Ajustes de la Aplicación'}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">
            {isAdmin ? 'Personaliza la identidad y operatividad de la academia.' : 'Gestiona tus preferencias y consulta información de ayuda.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* MONITOR DE CUOTAS (ADMIN ONLY) */}
          {isAdmin && quotaStats && (
            <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-md bg-white dark:bg-card overflow-hidden">
              <CardHeader className="bg-primary/10 p-8 border-b">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                      <Activity className="w-8 h-8 text-accent" />
                      Estado del Plan Gratuito (Spark)
                    </CardTitle>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Guía de consumo y límites en tiempo real</p>
                  </div>
                  <Badge className="bg-emerald-500 text-white border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 animate-pulse">Monitor Activo</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Users className="w-3 h-3 text-blue-500" /> Cuentas de Usuario
                        </Label>
                        <p className="text-2xl font-black text-foreground">{quotaStats.users.current.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Límite Mensual</p>
                        <p className="text-xs font-black text-foreground">{quotaStats.users.limit.toLocaleString()}</p>
                      </div>
                    </div>
                    <Progress value={quotaStats.users.percent} className="h-3 rounded-full bg-primary/10" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Database className="w-3 h-3 text-accent" /> Almacenamiento de Datos
                        </Label>
                        <p className="text-2xl font-black text-foreground">{quotaStats.docs.estimatedMB} <span className="text-xs text-muted-foreground font-medium uppercase">MB Est.</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Capacidad Total</p>
                        <p className="text-xs font-black text-foreground">1,024 MB</p>
                      </div>
                    </div>
                    <Progress value={quotaStats.docs.percent} className="h-3 rounded-full bg-primary/10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CONFIGURACIÓN DE NOTIFICACIONES */}
          <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-md bg-white dark:bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                <BellRing className="w-8 h-8 text-accent" />
                Notificaciones del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                      {notificationsEnabled ? <Bell className="w-6 h-6 text-accent animate-bounce" /> : <Bell className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-foreground">Recibir Avisos Directos</h4>
                      <p className="text-xs text-muted-foreground font-medium max-w-xs">
                        Activa esta opción para recibir recordatorios de clases y anuncios importantes en tu dispositivo.
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={handleToggleNotifications} 
                    className="scale-125 data-[state=checked]:bg-accent" 
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-accent/5 rounded-[2rem] border-2 border-dashed border-accent/20">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-black text-sm text-foreground flex items-center gap-2">
                      <Globe className="w-4 h-4 text-accent" /> ¿Problemas con las notificaciones?
                    </h4>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      Si estás en un iPhone o usando la app instalada y no puedes activar los avisos, pulsa el botón para abrir la app en una pestaña normal del navegador.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleOpenInBrowser}
                    className="rounded-xl border-2 font-black gap-2 hover:bg-accent hover:text-white transition-all h-12 shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" /> Abrir en Navegador
                  </Button>
                </div>
              </div>
              
              {!notificationsEnabled && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-orange-700">Importante:</p>
                    <p className="text-[11px] font-medium text-orange-600 leading-relaxed">
                      Si has bloqueado las notificaciones anteriormente en tu navegador, deberás habilitarlas también desde los ajustes del sitio (icono de candado en la barra de direcciones) para que esta opción funcione.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SOPORTE Y AYUDA */}
          {!isAdmin && (
            <Card className="rounded-[2.5rem] border-2 border-emerald-200 dark:border-emerald-900/30 shadow-md bg-white dark:bg-card overflow-hidden">
              <CardHeader className="bg-emerald-50 dark:bg-emerald-900/10 p-8 border-b">
                <CardTitle className="text-2xl font-black flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                  <MessageSquareMore className="w-8 h-8" />
                  Centro de Ayuda
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <p className="text-sm text-muted-foreground font-medium">¿Tienes dudas sobre tus clases o el uso de la plataforma?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    asChild 
                    variant="outline" 
                    className="h-16 rounded-2xl border-2 border-emerald-500/20 gap-3 font-black text-emerald-700 hover:bg-emerald-50"
                  >
                    <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                      <Phone className="w-5 h-5" /> Contactar por WhatsApp
                    </a>
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-16 rounded-2xl border-2 border-accent/20 gap-3 font-black text-accent hover:bg-accent/5">
                        <FileText className="w-5 h-5" /> Ver Términos y Políticas
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] max-w-3xl border-none shadow-2xl p-0 overflow-hidden flex flex-col h-[80vh]">
                      <DialogHeader className="bg-accent/10 p-8 border-b">
                        <DialogTitle className="text-2xl font-black text-foreground">Políticas de la Academia</DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">Normas de convivencia y uso de materiales.</DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="flex-1 p-8 bg-card">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <p className="whitespace-pre-wrap font-medium text-foreground leading-relaxed">
                            {settings.termsContent || 'Cargando políticas...'}
                          </p>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* IDENTIDAD VISUAL (ADMIN ONLY) */}
          {isAdmin && (
            <>
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
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Logo de la Academia</Label>
                      <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-accent shadow-2xl mx-auto bg-white group">
                        <Image src={getDirectImageUrl(logoUrl)} alt="Logo Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-xl text-accent"><Upload className="w-5 h-5" /></button>
                          <button onClick={generateRandomLogo} className="p-2 bg-white rounded-xl text-secondary-foreground"><RefreshCw className="w-5 h-5" /></button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-6 w-full">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">URL del Logotipo</Label>
                        <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="h-14 rounded-2xl border-2 font-bold px-6 focus:border-accent bg-card text-foreground" />
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-md bg-white dark:bg-card overflow-hidden">
                <CardHeader className="bg-primary/5 p-8 border-b">
                  <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                    <MapPin className="w-8 h-8 text-accent" />
                    Zonas de Cobertura
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex gap-2">
                    <Input value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} placeholder="Ej: San Borja" className="h-14 rounded-2xl border-2 font-bold px-6 focus:border-accent bg-card text-foreground" />
                    <Button onClick={addZone} className="bg-accent text-white h-14 px-8 rounded-2xl font-black shadow-lg"><Plus className="w-5 h-5 mr-2" /> Agregar</Button>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-4">
                    {localZones.map((zone) => (
                      <Badge key={zone} variant="secondary" className="h-12 pl-5 pr-3 rounded-2xl border-2 border-primary/10 bg-primary/5 text-foreground font-bold flex items-center gap-3 shadow-sm transition-all group">
                        <span className="text-sm">{zone}</span>
                        {zone !== 'Virtual' && <button onClick={() => removeZone(zone)} className="bg-white dark:bg-slate-800 p-1.5 rounded-lg text-muted-foreground hover:text-destructive shadow-sm"><X className="w-3.5 h-3.5" /></button>}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-md bg-white dark:bg-card overflow-hidden">
                <CardHeader className="bg-primary/5 p-8 border-b">
                  <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                    <Scale className="w-8 h-8 text-accent" />
                    Políticas y Aspectos Legales
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Cuerpo de los Términos y Condiciones</Label>
                    <Textarea value={termsContent} onChange={(e) => setTermsContent(e.target.value)} className="min-h-[300px] rounded-2xl border-2 font-bold p-6 focus:border-accent text-foreground bg-card text-sm leading-relaxed" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {isAdmin && (
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave}
              className="bg-accent text-white rounded-2xl h-16 px-12 text-lg font-black shadow-xl shadow-accent/20 hover:scale-105 transition-all gap-3"
            >
              <Save className="w-6 h-6" /> Guardar Todos los Cambios
            </Button>
          </div>
        )}

        {/* Versión de la Aplicación */}
        <div className="pt-8 pb-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 pointer-events-none select-none">
            v2.1.5
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
