
"use client"

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: Home, title: 'Inicio', desc: 'Tu puerta de entrada a la academia. Aquí encontrarás las últimas noticias, eventos destacados y comunicados importantes de la comunidad musical.' },
  { icon: LayoutDashboard, title: 'Panel Personal', desc: 'Tu centro de control. Gestiona tus próximas clases, revisa recursos recomendados y accede rápidamente a las funciones clave según tu progreso.' },
  { icon: Calendar, title: 'Horario', desc: 'Gestiona tu tiempo. Reserva nuevas lecciones con tus profesores favoritos, consulta tu agenda semanal y organiza tus sesiones de práctica.' },
  { icon: Library, title: 'Biblioteca', desc: 'Tu material de estudio. Accede a partituras, videos, audios y libros interactivos curados por nuestros docentes para potenciar tu aprendizaje.' },
  { icon: TrendingUp, title: 'Progreso', desc: 'Visualiza tu crecimiento. Sigue tu evolución técnica por instrumento, suma puntos de experiencia y desbloquea hitos históricos en tu carrera.' },
  { icon: Mic2, title: 'Producción Musical', desc: 'Próximamente. Un espacio dedicado para grabar tus interpretaciones en alta definición y empezar a crear tu propio portafolio artístico.' },
  { icon: Gift, title: 'Recompensas', desc: 'Próximamente. Canjea tus puntos de progreso por beneficios exclusivos, materiales de edición limitada y descuentos en la academia.' },
  { icon: ShoppingBag, title: 'RitmoMarket', desc: 'Próximamente. La tienda oficial donde podrás adquirir instrumentos, accesorios y merchandising seleccionado con garantía de la academia.' },
  { icon: ClipboardList, title: 'Postulaciones', desc: 'Próximamente. Inscríbete a festivales, audiciones especiales y convocatorias de bandas de la academia directamente desde aquí.' },
];

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
            <Info className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">Nuestra Identidad</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground font-headline tracking-tight">
            Aprende con <span className="text-accent">Ritmo</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            Somos más que una escuela; somos una comunidad apasionada por la educación musical moderna. 
            Nuestra misión es proporcionar las herramientas tecnológicas y pedagógicas necesarias para que 
            cada alumno alcance su máximo potencial artístico en un entorno digital y presencial integrado.
          </p>
        </section>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[2.5rem] border-2 border-primary/20 bg-card shadow-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg">Pasión Musical</h3>
              <p className="text-sm text-muted-foreground font-medium">Vivimos y respiramos música, transmitiendo ese entusiasmo en cada lección.</p>
            </CardContent>
          </Card>
          <Card className="rounded-[2.5rem] border-2 border-primary/20 bg-card shadow-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg">Excelencia Técnica</h3>
              <p className="text-sm text-muted-foreground font-medium">Nos enfocamos en una base sólida para que tu talento no tenga límites técnicos.</p>
            </CardContent>
          </Card>
          <Card className="rounded-[2.5rem] border-2 border-primary/20 bg-card shadow-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto text-orange-600">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg">Comunidad Viva</h3>
              <p className="text-sm text-muted-foreground font-medium">Fomentamos la colaboración entre alumnos y profesores para crecer juntos.</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Guide */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-accent rounded-full" />
            <h2 className="text-3xl font-black text-foreground font-headline tracking-tight">Guía de la Plataforma</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex gap-5 p-6 rounded-[2rem] bg-primary/5 border border-primary/10 hover:border-accent/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-lg text-foreground">{f.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Info */}
        <section className="bg-accent text-white rounded-[3rem] p-10 text-center space-y-6 shadow-xl shadow-accent/20">
          <h2 className="text-3xl font-black">¿Listo para empezar?</h2>
          <p className="text-white/80 font-medium max-w-xl mx-auto leading-relaxed">
            Tu viaje musical es único. Utiliza cada una de estas herramientas para sacar el mayor provecho 
            a tus clases y material didáctico. ¡Nos vemos en el pentagrama!
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
