
"use client"

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-store';
import { useSettingsStore } from '@/lib/settings-store';
import { useNewsStore, NewsArticle } from '@/lib/news-store';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ChevronRight, 
  Music, 
  Mic2, 
  Trophy, 
  Zap,
  Info,
  Clock,
  ShoppingBag,
  Gift,
  X,
  Share2,
  Plus,
  Edit2,
  Trash2,
  Save,
  Image as ImageIcon,
  Images,
  Trash,
  LayoutGrid
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { settings, updateSettings } = useSettingsStore();
  const { articles, addArticle, updateArticle, deleteArticle, loading: newsLoading } = useNewsStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isMounted, setIsMounted] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  
  // Admin Editing States
  const [isHeroEditing, setIsHeroEditing] = useState(false);
  const [tempHero, setTempHero] = useState({ 
    title: '', 
    subtitle: '', 
    badge: '',
    newsTitle: '',
    marketTitle: '',
    marketDesc: '',
    prodTitle: '',
    prodDesc: '',
    rewTitle: '',
    rewDesc: '',
    footerInfo: ''
  });

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [articleForm, setArticleArticleForm] = useState<Partial<NewsArticle>>({
    title: '',
    tag: '',
    content: '',
    fullContent: '',
    image: '',
    extraImages: [],
    type: 'news',
    date: ''
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAdmin = user?.role === 'admin';

  const handleEditHero = () => {
    setTempHero({
      title: settings.heroTitle || '',
      subtitle: settings.heroSubtitle || '',
      badge: settings.heroBadge || '',
      newsTitle: settings.newsSectionTitle || 'Lo Último en Ritmo',
      marketTitle: settings.moduleMarketTitle || 'RitmoMarket',
      marketDesc: settings.moduleMarketDesc || 'Tienda de accesorios',
      prodTitle: settings.moduleProductionTitle || 'Producción',
      prodDesc: settings.moduleProductionDesc || 'Graba tus clases en HD',
      rewTitle: settings.moduleRewardsTitle || 'Recompensas',
      rewDesc: settings.moduleRewardsDesc || 'Canjea tus puntos',
      footerInfo: settings.moduleFooterInfo || 'Administración trabaja en pasarelas de pago y sistemas de recompensas.'
    });
    setIsHeroEditing(true);
  };

  const handleSaveHero = () => {
    updateSettings({
      heroTitle: tempHero.title,
      heroSubtitle: tempHero.subtitle,
      heroBadge: tempHero.badge,
      newsSectionTitle: tempHero.newsTitle,
      moduleMarketTitle: tempHero.marketTitle,
      moduleMarketDesc: tempHero.marketDesc,
      moduleProductionTitle: tempHero.prodTitle,
      moduleProductionDesc: tempHero.prodDesc,
      moduleRewardsTitle: tempHero.rewTitle,
      moduleRewardsDesc: tempHero.rewDesc,
      moduleFooterInfo: tempHero.footerInfo
    });
    setIsHeroEditing(false);
    toast({ title: "Contenidos Actualizados ✨", description: "Los cambios han sido guardados." });
  };

  const openCreateArticle = () => {
    setEditingArticle(null);
    setArticleArticleForm({
      title: '',
      tag: 'Novedad',
      content: '',
      fullContent: '',
      image: 'https://picsum.photos/seed/' + Math.random().toString(36).substring(7) + '/800/400',
      extraImages: [],
      type: 'news',
      date: 'Hoy'
    });
    setIsArticleModalOpen(true);
  };

  const openEditArticle = (article: NewsArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArticle(article);
    setArticleArticleForm({
      ...article,
      extraImages: article.extraImages || []
    });
    setIsArticleModalOpen(true);
  };

  const handleDeleteArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteArticle(id);
    toast({ title: "Artículo Eliminado", description: "La publicación ha sido borrada permanentemente." });
  };

  const handleSaveArticle = () => {
    if (!articleForm.title || !articleForm.content) {
      toast({ variant: "destructive", title: "Datos incompletos", description: "El título y la descripción corta son obligatorios." });
      return;
    }

    if (editingArticle) {
      updateArticle(editingArticle.id, articleForm);
      toast({ title: "Artículo Actualizado ✨" });
    } else {
      addArticle(articleForm as NewsArticle);
      toast({ title: "Artículo Publicado 🎊" });
    }
    setIsArticleModalOpen(false);
  };

  const handleAddExtraImage = () => {
    setArticleArticleForm(prev => ({
      ...prev,
      extraImages: [...(prev.extraImages || []), '']
    }));
  };

  const handleUpdateExtraImage = (index: number, value: string) => {
    const newImages = [...(articleForm.extraImages || [])];
    newImages[index] = value;
    setArticleArticleForm(prev => ({ ...prev, extraImages: newImages }));
  };

  const handleRemoveExtraImage = (index: number) => {
    const newImages = (articleForm.extraImages || []).filter((_, i) => i !== index);
    setArticleArticleForm(prev => ({ ...prev, extraImages: newImages }));
  };

  if (!isMounted || authLoading || !user) return null;

  return (
    <AppLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-accent p-6 md:p-10 text-white shadow-xl shadow-accent/20 group">
          {isAdmin && (
            <Button 
              size="icon" 
              className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleEditHero}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          
          <div className="relative z-10 max-w-xl space-y-3 md:space-y-4">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-3 py-1 backdrop-blur-md font-black text-[10px] uppercase tracking-widest gap-2">
              <Sparkles className="w-3 h-3" /> {settings.heroBadge}
            </Badge>
            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tight leading-tight">
              {settings.heroTitle}
            </h1>
            <p className="text-white/80 text-xs md:text-base font-medium leading-relaxed max-w-md">
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl h-10 md:h-12 px-6 font-black text-xs md:text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95 border-2 border-white group" 
                onClick={() => router.push('/schedule')}
              >
                <Music className="w-4 h-4 mr-2 animate-bounce group-hover:animate-spin" /> ¡Reserva tu Clase Ahora!
              </Button>
              <Button 
                variant="outline"
                className="border-white/30 bg-white/10 hover:bg-white/20 text-white rounded-xl h-10 md:h-12 px-6 font-black text-xs md:text-sm backdrop-blur-sm transition-transform active:scale-95 border-2"
              >
                Sobre Nosotros
              </Button>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 hidden lg:block opacity-10 transform translate-x-10 translate-y-10">
            <Music size={200} className="text-white" />
          </div>
        </section>

        {/* News Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 group/news-title">
                <div className="w-1.5 h-6 bg-accent rounded-full" />
                <h2 className="text-xl md:text-2xl font-black text-foreground">
                  {settings.newsSectionTitle || 'Lo Último en Ritmo'}
                </h2>
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full opacity-0 group-hover/news-title:opacity-100 transition-opacity"
                    onClick={handleEditHero}
                  >
                    <Edit2 className="w-3 h-3 text-accent" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button 
                    onClick={openCreateArticle}
                    className="rounded-full bg-accent text-white h-8 px-4 text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Publicar
                  </Button>
                )}
                <Button variant="link" className="text-accent font-black text-sm underline px-0">Ver todo</Button>
              </div>
            </div>

            <div className="space-y-6">
              {newsLoading ? (
                <div className="py-20 text-center">
                  <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold italic">Cargando noticias...</p>
                </div>
              ) : articles.length > 0 ? articles.map((item) => (
                <Card 
                  key={item.id} 
                  className="rounded-[1.5rem] md:rounded-[2rem] border-2 border-primary/20 shadow-sm hover:shadow-lg hover:border-accent/40 transition-all duration-500 group overflow-hidden bg-card cursor-pointer"
                  onClick={() => setSelectedNews(item)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                    <div className="md:col-span-2 relative h-64 md:h-full min-h-[200px] overflow-hidden">
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        data-ai-hint="musical event"
                      />
                      <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-2">
                        <Badge className="bg-white/95 text-accent rounded-full font-black px-2 py-0.5 shadow-sm border-none text-[10px]">
                          {item.tag}
                        </Badge>
                      </div>
                      
                      {isAdmin && (
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            className="bg-white text-accent rounded-xl shadow-lg h-8 w-8 hover:bg-accent hover:text-white"
                            onClick={(e) => openEditArticle(item, e)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            size="icon" 
                            className="bg-white text-destructive rounded-xl shadow-lg h-8 w-8 hover:bg-destructive hover:text-white"
                            onClick={(e) => handleDeleteArticle(item.id, e)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-3 p-5 md:p-6 flex flex-col justify-center space-y-2 md:space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        <Clock className="w-3 h-3 text-accent" />
                        {item.date}
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-foreground leading-tight group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-2">
                        {item.content}
                      </p>
                      <Button variant="outline" size="sm" className="w-fit rounded-lg border-2 font-black gap-2 hover:bg-accent hover:text-white transition-all text-xs">
                        Leer más <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )) : (
                <div className="col-span-full py-20 text-center bg-primary/5 rounded-[3rem] border-4 border-dashed border-primary/10">
                  <Sparkles className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-foreground">Sin noticias</h3>
                  <p className="text-muted-foreground font-bold italic">Aún no se han publicado artículos en la cartelera.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 px-2 group/community">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-foreground">Comunidad</h2>
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full opacity-0 group-hover/community:opacity-100 transition-opacity"
                  onClick={handleEditHero}
                >
                  <Edit2 className="w-3 h-3 text-blue-500" />
                </Button>
              )}
            </div>

            {/* Coming Soon Features */}
            <Card className="rounded-[1.5rem] border-none shadow-lg bg-blue-50 dark:bg-blue-950/20 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-base text-blue-900 dark:text-blue-100 leading-tight">Nuevos Módulos</h4>
                  <p className="text-[9px] font-bold text-blue-700/60 dark:text-blue-400/60 uppercase tracking-widest">En desarrollo activo</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: settings.moduleMarketTitle || 'RitmoMarket', desc: settings.moduleMarketDesc || 'Tienda de accesorios', icon: ShoppingBag },
                  { label: settings.moduleProductionTitle || 'Producción', desc: settings.moduleProductionDesc || 'Graba tus clases en HD', icon: Mic2 },
                  { label: settings.moduleRewardsTitle || 'Recompensas', desc: settings.moduleRewardsDesc || 'Canjea tus puntos', icon: Gift }
                ].map((f, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-blue-200/50 dark:border-blue-900/30 group">
                    <div className="p-2 bg-white rounded-lg text-blue-500 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      <f.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-xs text-blue-900 dark:text-blue-100 truncate">{f.label}</p>
                      <p className="text-[9px] font-bold text-muted-foreground truncate">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-[9px] font-bold text-blue-800/70 dark:text-blue-300/70 leading-relaxed italic">
                    {settings.moduleFooterInfo || 'Administración trabaja en pasarelas de pago y sistemas de recompensas.'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[1.5rem] border-2 border-primary/20 shadow-sm bg-card p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-foreground">Tu Academia Digital</h4>
                  <p className="text-xs text-muted-foreground font-medium mt-1 px-2">
                    Cada lección completada te acerca más a tu meta.
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-accent text-white rounded-xl h-12 font-black shadow-lg shadow-accent/20 text-sm"
                >
                  Ir a mi Panel Personal
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Noticia */}
      <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden bg-card flex flex-col max-h-[90vh]">
          {selectedNews && (
            <>
              <div className="relative h-48 md:h-64 w-full shrink-0">
                <Image 
                  src={selectedNews.image} 
                  alt={selectedNews.title} 
                  fill 
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/95 text-accent rounded-full font-black px-3 py-1 shadow-md border-none text-[10px] uppercase tracking-widest">
                    {selectedNews.tag}
                  </Badge>
                </div>
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 bg-black/20 backdrop-blur-md hover:bg-black/40 text-white p-2 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-[0.2em]">
                    <Clock className="w-3.5 h-3.5" />
                    Publicado: {selectedNews.date}
                  </div>
                  <DialogHeader>
                    <DialogTitle className="text-2xl md:text-3xl font-black text-foreground leading-tight">
                      {selectedNews.title}
                    </DialogTitle>
                  </DialogHeader>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-base md:text-lg font-bold text-foreground leading-relaxed">
                    {selectedNews.content}
                  </p>
                  <div className="h-px w-full bg-primary/10 my-4 md:my-6" />
                  <p className="text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedNews.fullContent || "Pronto tendremos más detalles sobre esta publicación. ¡Mantente atento a las actualizaciones de la academia!"}
                  </p>
                </div>

                {/* Galería de Imágenes Complementarias en el Detalle */}
                {selectedNews.extraImages && selectedNews.extraImages.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <Images className="w-4 h-4 text-accent" />
                      <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Galería del Evento</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedNews.extraImages.map((img, i) => (
                        <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary/10 shadow-sm group/img">
                          <Image 
                            src={img} 
                            alt={`Imagen ${i + 1}`} 
                            fill 
                            className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">Academia</p>
                      <p className="text-xs font-bold text-foreground">Aprende con Ritmo</p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-xl font-black gap-2 border-2 text-xs md:text-sm">
                    <Share2 className="w-4 h-4" /> Compartir
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin: Modal de Edición de Textos de Inicio */}
      <Dialog open={isHeroEditing} onOpenChange={setIsHeroEditing}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Edit2 className="w-6 h-6 text-accent" />
              Editar Contenidos de Inicio
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">Modifica los mensajes principales y los módulos de comunidad.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-8 bg-card">
              <div className="space-y-6 border-b border-primary/10 pb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <h3 className="font-black text-sm uppercase tracking-widest text-foreground">Portada Principal (Hero)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Etiqueta (Badge)</Label>
                    <Input 
                      value={tempHero.badge} 
                      onChange={(e) => setTempHero(prev => ({...prev, badge: e.target.value}))}
                      className="h-12 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Título de Noticias</Label>
                    <Input 
                      value={tempHero.newsTitle} 
                      onChange={(e) => setTempHero(prev => ({...prev, newsTitle: e.target.value}))}
                      className="h-12 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Título Principal</Label>
                  <Input 
                    value={tempHero.title} 
                    onChange={(e) => setTempHero(prev => ({...prev, title: e.target.value}))}
                    className="h-12 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subtítulo / Descripción</Label>
                  <Textarea 
                    value={tempHero.subtitle} 
                    onChange={(e) => setTempHero(prev => ({...prev, subtitle: e.target.value}))}
                    className="min-h-[80px] rounded-xl border-2 font-bold p-4 focus:border-accent bg-card text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-blue-500" />
                  <h3 className="font-black text-sm uppercase tracking-widest text-foreground">Gestión de Módulos Próximos</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                      <ShoppingBag className="w-3 h-3" /> Módulo Market
                    </Label>
                    <div className="space-y-2">
                      <Input 
                        value={tempHero.marketTitle} 
                        onChange={(e) => setTempHero(prev => ({...prev, marketTitle: e.target.value}))}
                        className="h-10 rounded-lg border-2 font-bold text-xs"
                        placeholder="Título Market"
                      />
                      <Input 
                        value={tempHero.marketDesc} 
                        onChange={(e) => setTempHero(prev => ({...prev, marketDesc: e.target.value}))}
                        className="h-10 rounded-lg border-2 font-bold text-xs"
                        placeholder="Descripción corta"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                      <Mic2 className="w-3 h-3" /> Módulo Producción
                    </Label>
                    <div className="space-y-2">
                      <Input 
                        value={tempHero.prodTitle} 
                        onChange={(e) => setTempHero(prev => ({...prev, prodTitle: e.target.value}))}
                        className="h-10 rounded-lg border-2 font-bold text-xs"
                        placeholder="Título Producción"
                      />
                      <Input 
                        value={tempHero.prodDesc} 
                        onChange={(e) => setTempHero(prev => ({...prev, prodDesc: e.target.value}))}
                        className="h-10 rounded-lg border-2 font-bold text-xs"
                        placeholder="Descripción corta"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                      <Gift className="w-3 h-3" /> Módulo Recompensas
                    </Label>
                    <div className="space-y-2">
                      <Input 
                        value={tempHero.rewTitle} 
                        onChange={(e) => setTempHero(prev => ({...prev, rewTitle: e.target.value}))}
                        className="h-10 rounded-lg border-2 font-bold text-xs"
                        placeholder="Título Recompensas"
                      />
                      <Input 
                        value={tempHero.rewDesc} 
                        onChange={(e) => setTempHero(prev => ({...prev, rewDesc: e.target.value}))}
                        className="h-10 rounded-lg border-2 font-bold text-xs"
                        placeholder="Descripción corta"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-blue-700 flex items-center gap-2">
                      <Info className="w-3 h-3" /> Info de Administración
                    </Label>
                    <Textarea 
                      value={tempHero.footerInfo} 
                      onChange={(e) => setTempHero(prev => ({...prev, footerInfo: e.target.value}))}
                      className="min-h-[80px] rounded-lg border-2 font-bold text-xs bg-white"
                      placeholder="Mensaje sobre el estado del desarrollo..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-8 bg-muted/30 border-t flex gap-3 shrink-0">
            <Button variant="outline" className="rounded-xl flex-1 h-12 font-black text-foreground" onClick={() => setIsHeroEditing(false)}>Cancelar</Button>
            <Button className="bg-accent text-white rounded-xl flex-1 h-12 font-black shadow-lg shadow-accent/20" onClick={handleSaveHero}>
              <Save className="w-4 h-4 mr-2" /> Guardar Todos los Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin: Modal de Crear/Editar Artículo */}
      <Dialog open={isArticleModalOpen} onOpenChange={setIsArticleModalOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              {editingArticle ? <Edit2 className="w-6 h-6 text-accent" /> : <Plus className="w-6 h-6 text-accent" />}
              {editingArticle ? 'Editar Artículo' : 'Nuevo Artículo'}
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">Publica noticias o eventos para toda la comunidad.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6 bg-card overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Título</Label>
                <Input 
                  value={articleForm.title} 
                  onChange={(e) => setArticleArticleForm(prev => ({...prev, title: e.target.value}))}
                  className="h-12 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                  placeholder="Ej: Recital de Verano"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Etiqueta (Tag)</Label>
                <Input 
                  value={articleForm.tag} 
                  onChange={(e) => setArticleArticleForm(prev => ({...prev, tag: e.target.value}))}
                  className="h-12 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                  placeholder="Ej: Evento Próximo"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fecha / Momento</Label>
                <Input 
                  value={articleForm.date} 
                  onChange={(e) => setArticleArticleForm(prev => ({...prev, date: e.target.value}))}
                  className="h-12 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                  placeholder="Ej: 15 de Agosto o Hoy"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tipo de Contenido</Label>
                <Select 
                  value={articleForm.type} 
                  onValueChange={(val: any) => setArticleArticleForm(prev => ({...prev, type: val}))}
                >
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold bg-card text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="news" className="font-bold">Noticia General</SelectItem>
                    <SelectItem value="event" className="font-bold">Evento Académico</SelectItem>
                    <SelectItem value="update" className="font-bold">Actualización de App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> URL de la Imagen de Portada
              </Label>
              <Input 
                value={articleForm.image} 
                onChange={(e) => setArticleArticleForm(prev => ({...prev, image: e.target.value}))}
                className="h-12 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-4 border-t border-primary/10 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Images className="w-3 h-3" /> Galería de Imágenes Complementarias
                </Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-lg border-2 text-[10px] font-black uppercase px-3"
                  onClick={handleAddExtraImage}
                >
                  <Plus className="w-3 h-3 mr-1" /> Añadir Cuadro
                </Button>
              </div>
              
              <div className="space-y-3">
                {articleForm.extraImages?.map((url, index) => (
                  <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Input 
                      value={url} 
                      onChange={(e) => handleUpdateExtraImage(index, e.target.value)}
                      className="h-10 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground text-xs"
                      placeholder={`URL Imagen ${index + 1}`}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={() => handleRemoveExtraImage(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {(!articleForm.extraImages || articleForm.extraImages.length === 0) && (
                  <p className="text-[10px] text-muted-foreground font-medium italic text-center py-2">
                    No hay imágenes complementarias añadidas aún.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 border-t border-primary/10 pt-4">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descripción Corta (Muro)</Label>
              <Textarea 
                value={articleForm.content} 
                onChange={(e) => setArticleArticleForm(prev => ({...prev, content: e.target.value}))}
                className="min-h-[80px] rounded-xl border-2 font-bold p-4 focus:border-accent bg-card text-foreground"
                placeholder="Resumen para la tarjeta principal..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Contenido Detallado (Modal)</Label>
              <Textarea 
                value={articleForm.fullContent} 
                onChange={(e) => setArticleArticleForm(prev => ({...prev, fullContent: e.target.value}))}
                className="min-h-[150px] rounded-xl border-2 font-bold p-4 focus:border-accent bg-card text-foreground"
                placeholder="Desarrollo completo de la noticia..."
              />
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/30 border-t flex gap-3 shrink-0">
            <Button variant="outline" className="rounded-xl flex-1 h-12 font-black text-foreground" onClick={() => setIsArticleModalOpen(false)}>Cancelar</Button>
            <Button className="bg-accent text-white rounded-xl flex-1 h-12 font-black shadow-lg shadow-accent/20" onClick={handleSaveArticle}>
              {editingArticle ? 'Guardar Cambios' : 'Publicar Ahora'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
