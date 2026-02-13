
"use client"

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Newspaper, 
  Calendar, 
  Rocket, 
  ChevronRight, 
  Music, 
  Mic2, 
  Trophy, 
  Star,
  Zap,
  Info,
  Clock,
  ShoppingBag,
  Gift
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  tag: string;
  title: string;
  content: string;
  image: string;
  date: string;
  type: 'news' | 'event' | 'update';
}

const NEWS_MOCK: NewsItem[] = [
  {
    id: '1',
    tag: 'Evento Próximo',
    title: 'Recital de Invierno 2025 🎹',
    content: '¡Prepárate para nuestra gala anual! Todos los alumnos están invitados a participar. Las inscripciones para solistas ya están abiertas en la pestaña de postulaciones.',
    image: 'https://picsum.photos/seed/recital/800/400',
    date: '20 de Julio, 2025',
    type: 'event'
  },
  {
    id: '2',
    tag: 'Nueva Función',
    title: '¡Editor de Perfil Mejorado! ✨',
    content: 'Ahora puedes ajustar el zoom y el encuadre de tu foto de perfil directamente desde la aplicación. ¡Haz que tu imagen musical luzca profesional!',
    image: 'https://picsum.photos/seed/update1/800/400',
    date: 'Hoy',
    type: 'update'
  },
  {
    id: '3',
    tag: 'Academia',
    title: 'Nuevos Materiales de Teoría 📖',
    content: 'Hemos añadido 5 nuevos libros interactivos a la biblioteca para ayudarte con la lectura de pentagrama y armonía moderna.',
    image: 'https://picsum.photos/seed/library/800/400',
    date: 'Hace 2 días',
    type: 'news'
  }
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || loading || !user) return null;

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[3rem] bg-accent p-8 md:p-16 text-white shadow-2xl shadow-accent/20">
          <div className="relative z-10 max-w-2xl space-y-6">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1.5 backdrop-blur-md font-black text-xs uppercase tracking-widest gap-2">
              <Sparkles className="w-3 h-3" /> Novedades de la Academia
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tight leading-tight">
              Tu aventura musical <br /> continúa aquí 🎼
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-medium leading-relaxed">
              Explora las últimas noticias, eventos y actualizaciones de Aprende Con Ritmo. ¡Mantente conectado con tu comunidad!
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="bg-white text-accent hover:bg-white/90 rounded-2xl h-14 px-8 font-black text-lg shadow-xl shadow-black/10" onClick={() => router.push('/schedule')}>
                Ver Calendario
              </Button>
              <Button variant="outline" className="border-white/30 bg-white/10 hover:bg-white/20 text-white rounded-2xl h-14 px-8 font-black text-lg backdrop-blur-sm">
                Sobre Nosotros
              </Button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 hidden lg:block opacity-20 transform translate-x-10 translate-y-10">
            <Music size={400} className="text-white" />
          </div>
        </section>

        {/* News Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-accent rounded-full" />
                <h2 className="text-2xl font-black text-foreground">Lo Último en Ritmo</h2>
              </div>
              <Button variant="link" className="text-accent font-black underline">Ver todo</Button>
            </div>

            <div className="space-y-8">
              {NEWS_MOCK.map((item) => (
                <Card key={item.id} className="rounded-[2.5rem] border-2 border-primary/10 shadow-sm hover:shadow-xl hover:border-accent/20 transition-all duration-500 group overflow-hidden bg-card">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-6">
                    <div className="md:col-span-2 relative aspect-video md:aspect-square h-full overflow-hidden">
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        data-ai-hint="musical event"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/95 text-accent rounded-full font-black px-3 py-1 shadow-sm border-none">
                          {item.tag}
                        </Badge>
                      </div>
                    </div>
                    <div className="md:col-span-3 p-8 flex flex-col justify-center space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                        <Clock className="w-3 h-3 text-accent" />
                        {item.date}
                      </div>
                      <h3 className="text-2xl font-black text-foreground leading-tight group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground font-medium leading-relaxed line-clamp-3">
                        {item.content}
                      </p>
                      <Button variant="outline" className="w-fit rounded-xl border-2 font-black gap-2 hover:bg-accent hover:text-white transition-all">
                        Leer más <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3 px-2">
              <div className="w-2 h-8 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-black text-foreground">Comunidad</h2>
            </div>

            {/* Coming Soon Features */}
            <Card className="rounded-[2.5rem] border-none shadow-lg bg-blue-50 dark:bg-blue-950/20 p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-blue-900 dark:text-blue-100">Nuevos Módulos</h4>
                  <p className="text-xs font-bold text-blue-700/60 dark:text-blue-400/60 uppercase tracking-widest">En desarrollo activo</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'RitmoMarket', desc: 'Tienda de accesorios musicales', icon: ShoppingBag },
                  { label: 'Producción', desc: 'Graba tus clases en alta calidad', icon: Mic2 },
                  { label: 'Recompensas', desc: 'Canjea tus puntos por premios', icon: Gift }
                ].map((f, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-blue-200/50 dark:border-blue-900/30 group">
                    <div className="p-2 bg-white rounded-xl text-blue-500 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      <f.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-blue-900 dark:text-blue-100">{f.label}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold text-blue-800/70 dark:text-blue-300/70 leading-relaxed italic">
                    Administración está trabajando en integrar pasarelas de pago y sistemas de recompensas automáticos.
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Stats / Achievements */}
            <Card className="rounded-[2.5rem] border-2 border-primary/10 shadow-sm bg-card p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <Trophy className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-foreground">Tu Academia Digital</h4>
                  <p className="text-sm text-muted-foreground font-medium mt-1 px-4">
                    Cada lección completada te acerca más a tu meta. ¡Revisa tu panel para ver tu evolución!
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-accent text-white rounded-2xl h-14 font-black shadow-lg shadow-accent/20"
                >
                  Ir a mi Panel Personal
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
