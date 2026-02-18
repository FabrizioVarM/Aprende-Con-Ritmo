
"use client"

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Info, 
  Home, 
  LayoutDashboard, 
  Calendar, 
  Library, 
  TrendingUp, 
  Mic2, 
  Gift, 
  ShoppingBag, 
  ClipboardList,
  Music,
  CheckCircle2,
  Users,
  Edit2,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Star,
  Target,
  Rocket
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useSettingsStore, GuideItem, AboutValue } from '@/lib/settings-store';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ICON_MAP: Record<string, any> = {
  Home,
  LayoutDashboard,
  Calendar,
  Library,
  TrendingUp,
  Mic2,
  Gift,
  ShoppingBag,
  ClipboardList,
  Music,
  CheckCircle2,
  Users,
  HelpCircle,
  Sparkles,
  Star,
  Target,
  Rocket,
  Info
};

export default function AboutPage() {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettingsStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [isEditing, setIsEditing] = useState(false);
  const [tempAbout, setTempAbout] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroBadge: '',
    values: [] as AboutValue[],
    guideTitle: '',
    guideItems: [] as GuideItem[],
    footerTitle: '',
    footerSubtitle: ''
  });

  useEffect(() => {
    if (isEditing) {
      setTempAbout({
        heroTitle: settings.aboutHeroTitle || 'Aprende con Ritmo',
        heroSubtitle: settings.aboutHeroSubtitle || 'Somos más que una escuela...',
        heroBadge: settings.aboutHeroBadge || 'Nuestra Identidad',
        values: [...(settings.aboutValues || [])],
        guideTitle: settings.aboutGuideTitle || 'Guía de la Plataforma',
        guideItems: [...(settings.aboutGuideItems || [])],
        footerTitle: settings.aboutFooterTitle || '¿Listo para empezar?',
        footerSubtitle: settings.aboutFooterSubtitle || 'Tu viaje musical es único...'
      });
    }
  }, [isEditing, settings]);

  const handleSave = () => {
    updateSettings({
      aboutHeroTitle: tempAbout.heroTitle,
      aboutHeroSubtitle: tempAbout.heroSubtitle,
      aboutHeroBadge: tempAbout.heroBadge,
      aboutValues: tempAbout.values,
      aboutGuideTitle: tempAbout.guideTitle,
      aboutGuideItems: tempAbout.guideItems,
      aboutFooterTitle: tempAbout.footerTitle,
      aboutFooterSubtitle: tempAbout.footerSubtitle
    });
    setIsEditing(false);
    toast({ title: "Contenidos Actualizados ✨", description: "Los cambios en Sobre Nosotros han sido guardados." });
  };

  const addValue = () => {
    setTempAbout(prev => ({
      ...prev,
      values: [...prev.values, { title: 'Nuevo Valor', desc: 'Descripción del valor...' }]
    }));
  };

  const removeValue = (index: number) => {
    setTempAbout(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  const updateValue = (index: number, field: keyof AboutValue, value: string) => {
    const newValues = [...tempAbout.values];
    newValues[index] = { ...newValues[index], [field]: value };
    setTempAbout(prev => ({ ...prev, values: newValues }));
  };

  const addGuideItem = () => {
    setTempAbout(prev => ({
      ...prev,
      guideItems: [...prev.guideItems, { icon: 'HelpCircle', title: 'Nueva Sección', desc: 'Descripción de la sección...' }]
    }));
  };

  const removeGuideItem = (index: number) => {
    setTempAbout(prev => ({
      ...prev,
      guideItems: prev.guideItems.filter((_, i) => i !== index)
    }));
  };

  const updateGuideItem = (index: number, field: keyof GuideItem, value: string) => {
    const newItems = [...tempAbout.guideItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setTempAbout(prev => ({ ...prev, guideItems: newItems }));
  };

  const GuideItems = settings.aboutGuideItems || [];
  const Values = settings.aboutValues || [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-12 relative">
        {isAdmin && (
          <Button 
            className="fixed bottom-8 right-8 z-50 rounded-full w-16 h-16 bg-accent text-white shadow-2xl hover:scale-110 transition-transform"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-6 h-6" />
          </Button>
        )}

        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
            <Info className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">{settings.aboutHeroBadge}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground font-headline tracking-tight">
            {settings.aboutHeroTitle?.split(' ')[0]} <span className="text-accent">{settings.aboutHeroTitle?.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            {settings.aboutHeroSubtitle}
          </p>
        </section>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Values.map((v, i) => {
            const Icons = [Music, CheckCircle2, Users];
            const ValueIcon = Icons[i % Icons.length];
            const colors = ['text-blue-600 bg-blue-100', 'text-emerald-600 bg-emerald-100', 'text-orange-600 bg-orange-100'];
            const color = colors[i % colors.length];

            return (
              <Card key={i} className="rounded-[2.5rem] border-2 border-primary/20 bg-card shadow-sm hover:border-accent/30 transition-all">
                <CardContent className="p-8 text-center space-y-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mx-auto", color)}>
                    <ValueIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-lg">{v.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{v.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Guide */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-accent rounded-full" />
            <h2 className="text-3xl font-black text-foreground font-headline tracking-tight">{settings.aboutGuideTitle}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GuideItems.map((f, i) => {
              const IconComp = ICON_MAP[f.icon] || HelpCircle;
              return (
                <div key={i} className="flex gap-5 p-6 rounded-[2rem] bg-primary/5 border border-primary/10 hover:border-accent/30 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-lg text-foreground">{f.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer Info */}
        <section className="bg-accent text-white rounded-[3rem] p-10 text-center space-y-6 shadow-xl shadow-accent/20">
          <h2 className="text-3xl font-black">{settings.aboutFooterTitle}</h2>
          <p className="text-white/80 font-medium max-w-xl mx-auto leading-relaxed">
            {settings.aboutFooterSubtitle}
          </p>
        </section>
      </div>

      {/* Admin: Modal de Edición de Sobre Nosotros */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="rounded-[2.5rem] max-w-3xl border-none shadow-2xl p-0 overflow-hidden flex flex-col h-[90vh] max-h-[90vh]">
          <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Edit2 className="w-6 h-6 text-accent" />
              Editar Página Informativa
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">Personaliza la identidad y la guía de ayuda de la academia.</DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="hero" className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <TabsList className="bg-muted/50 p-1 mx-8 mt-4 rounded-xl shrink-0">
              <TabsTrigger value="hero" className="rounded-lg font-black text-[10px] uppercase">Portada</TabsTrigger>
              <TabsTrigger value="values" className="rounded-lg font-black text-[10px] uppercase">Valores</TabsTrigger>
              <TabsTrigger value="guide" className="rounded-lg font-black text-[10px] uppercase">Guía</TabsTrigger>
              <TabsTrigger value="footer" className="rounded-lg font-black text-[10px] uppercase">Cierre</TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <TabsContent value="hero" className="space-y-6 m-0 outline-none p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Etiqueta (Badge)</Label>
                    <Input 
                      value={tempAbout.heroBadge} 
                      onChange={(e) => setTempAbout(prev => ({...prev, heroBadge: e.target.value}))}
                      className="h-12 rounded-xl border-2 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Título Principal</Label>
                    <Input 
                      value={tempAbout.heroTitle} 
                      onChange={(e) => setTempAbout(prev => ({...prev, heroTitle: e.target.value}))}
                      className="h-12 rounded-xl border-2 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descripción de Identidad</Label>
                  <Textarea 
                    value={tempAbout.heroSubtitle} 
                    onChange={(e) => setTempAbout(prev => ({...prev, heroSubtitle: e.target.value}))}
                    className="min-h-[100px] rounded-xl border-2 font-bold p-4"
                  />
                </div>
              </TabsContent>

              <TabsContent value="values" className="space-y-6 m-0 outline-none p-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm uppercase tracking-widest text-foreground">Tarjetas de Valores</h3>
                  <Button size="sm" variant="outline" onClick={addValue} className="rounded-lg border-2 h-8 text-[10px] font-black uppercase">
                    <Plus className="w-3 h-3 mr-1" /> Añadir Valor
                  </Button>
                </div>
                <div className="space-y-4">
                  {tempAbout.values.map((v, i) => (
                    <div key={i} className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 space-y-3 relative group">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeValue(i)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Input 
                        value={v.title} 
                        onChange={(e) => updateValue(i, 'title', e.target.value)}
                        className="h-10 rounded-lg border-2 font-black text-sm"
                        placeholder="Título del Valor"
                      />
                      <Textarea 
                        value={v.desc} 
                        onChange={(e) => updateValue(i, 'desc', e.target.value)}
                        className="min-h-[60px] rounded-lg border-2 font-bold text-xs"
                        placeholder="Descripción corta"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="guide" className="space-y-6 m-0 outline-none p-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Título de la Sección</Label>
                    <Input 
                      value={tempAbout.guideTitle} 
                      onChange={(e) => setTempAbout(prev => ({...prev, guideTitle: e.target.value}))}
                      className="h-12 rounded-xl border-2 font-bold"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <h3 className="font-black text-sm uppercase tracking-widest text-foreground">Guía por Sección</h3>
                    <Button size="sm" variant="outline" onClick={addGuideItem} className="rounded-lg border-2 h-8 text-[10px] font-black uppercase">
                      <Plus className="w-3 h-3 mr-1" /> Añadir Sección
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {tempAbout.guideItems.map((f, i) => (
                      <div key={i} className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 space-y-3 group">
                        <div className="flex gap-3">
                          <div className="space-y-2 flex-1">
                            <Label className="text-[8px] font-black uppercase text-muted-foreground">Título</Label>
                            <Input 
                              value={f.title} 
                              onChange={(e) => updateGuideItem(i, 'title', e.target.value)}
                              className="h-10 rounded-lg border-2 font-black text-sm"
                            />
                          </div>
                          <div className="space-y-2 w-32">
                            <Label className="text-[8px] font-black uppercase text-muted-foreground">Icono (Lucide)</Label>
                            <Select value={f.icon} onValueChange={(val) => updateGuideItem(i, 'icon', val)}>
                              <SelectTrigger className="h-10 rounded-lg border-2 font-bold text-[10px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {Object.keys(ICON_MAP).map(iconName => (
                                  <SelectItem key={iconName} value={iconName} className="font-bold text-[10px] uppercase">
                                    {iconName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="mt-6 h-10 w-10 text-destructive hover:bg-destructive/10"
                            onClick={() => removeGuideItem(i)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-muted-foreground">Descripción del Módulo</Label>
                          <Textarea 
                            value={f.desc} 
                            onChange={(e) => updateGuideItem(i, 'desc', e.target.value)}
                            className="min-h-[60px] rounded-lg border-2 font-bold text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="footer" className="space-y-6 m-0 outline-none p-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Título de Cierre</Label>
                    <Input 
                      value={tempAbout.footerTitle} 
                      onChange={(e) => setTempAbout(prev => ({...prev, footerTitle: e.target.value}))}
                      className="h-12 rounded-xl border-2 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descripción de Cierre</Label>
                    <Textarea 
                      value={tempAbout.footerSubtitle} 
                      onChange={(e) => setTempAbout(prev => ({...prev, footerSubtitle: e.target.value}))}
                      className="min-h-[100px] rounded-xl border-2 font-bold p-4"
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-8 bg-muted/30 border-t flex gap-3 shrink-0">
            <Button variant="outline" className="rounded-xl flex-1 h-12 font-black text-foreground" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button className="bg-accent text-white rounded-xl flex-1 h-12 font-black shadow-lg shadow-accent/20" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Guardar Todos los Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
