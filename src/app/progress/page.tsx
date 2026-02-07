"use client"

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useBookingStore } from '@/lib/booking-store';
import { RESOURCES } from '@/lib/resources';
import { Star, TrendingUp, Music, CheckCircle2, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// Definición de las habilidades por defecto
const DEFAULT_SKILLS: Record<string, { name: string; level: number; color: string }[]> = {
  'Guitarra': [
    { name: 'Precisión de Ritmo', level: 85, color: 'bg-accent' },
    { name: 'Lectura de Notas', level: 60, color: 'bg-blue-500' },
    { name: 'Dinámicas', level: 45, color: 'bg-orange-500' },
    { name: 'Técnica', level: 72, color: 'bg-green-500' },
  ],
  'Piano': [
    { name: 'Independencia de manos', level: 40, color: 'bg-accent' },
    { name: 'Lectura en Clave de Fa', level: 75, color: 'bg-blue-500' },
    { name: 'Escalas Mayores', level: 90, color: 'bg-orange-500' },
    { name: 'Uso del Pedal', level: 30, color: 'bg-green-500' },
  ],
  'Violín': [
    { name: 'Postura del Arco', level: 65, color: 'bg-accent' },
    { name: 'Intonación', level: 50, color: 'bg-blue-500' },
    { name: 'Vibrato', level: 20, color: 'bg-orange-500' },
    { name: 'Lectura Rápida', level: 40, color: 'bg-green-500' },
  ],
  'Batería': [
    { name: 'Coordinación', level: 70, color: 'bg-accent' },
    { name: 'Velocidad', level: 55, color: 'bg-blue-500' },
    { name: 'Rudimentos', level: 80, color: 'bg-orange-500' },
    { name: 'Groove', level: 65, color: 'bg-green-500' },
  ],
  'Canto': [
    { name: 'Respiración', level: 90, color: 'bg-accent' },
    { name: 'Afinación', level: 75, color: 'bg-blue-500' },
    { name: 'Proyección', level: 60, color: 'bg-orange-500' },
    { name: 'Dicción', level: 85, color: 'bg-green-500' },
  ],
  'Teoría': [
    { name: 'Lectura de Pentagrama', level: 55, color: 'bg-accent' },
    { name: 'Intervalos', level: 40, color: 'bg-blue-500' },
    { name: 'Armonía Básica', level: 30, color: 'bg-orange-500' },
  ],
  'Default': [
    { name: 'Teoría Musical', level: 50, color: 'bg-accent' },
    { name: 'Entrenamiento Auditivo', level: 30, color: 'bg-blue-500' },
  ]
};

const MILESTONES = [
  { title: 'Nivel 1 Completado', date: 'Oct 2023', achieved: true },
  { title: 'Primera Presentación', date: 'Dic 2023', achieved: true },
  { title: 'Maestro de Escalas Mayores', date: 'Ene 2024', achieved: true },
  { title: 'Eficiencia Nivel 2', date: 'Esperado Abr 2024', achieved: false },
];

// Helper para nombres de artistas
const getArtistName = (inst: string) => {
  switch (inst) {
    case 'Guitarra': return 'Guitarrista';
    case 'Piano': return 'Pianista';
    case 'Violín': return 'Violinista';
    case 'Batería': return 'Baterista';
    case 'Canto': return 'Cantante';
    case 'Teoría': return 'Teórico';
    default: return 'Músico';
  }
};

// Lógica de Niveles
const getLevelInfo = (inst: string, points: number) => {
  const artist = getArtistName(inst);
  if (points >= 9000) return { name: 'Maestro joven', level: 6 };
  if (points >= 6200) return { name: `Virtuoso con la ${inst}`, level: 5 };
  if (points >= 4000) return { name: `${artist} Preparado`, level: 4 };
  if (points >= 2300) return { name: `${artist} en formación`, level: 3 };
  if (points >= 1000) return { name: `Entusiasta de ${inst}`, level: 2 };
  return { name: `Aprendiz de ${inst}`, level: 1 };
};

export default function ProgressPage() {
  const { user } = useAuth();
  const { completions } = useCompletionStore();
  const { availabilities } = useBookingStore();
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (user && user.instruments && user.instruments.length > 0 && !selectedInstrument) {
      setSelectedInstrument(user.instruments[0]);
    } else if (user && (!user.instruments || user.instruments.length === 0) && !selectedInstrument) {
      setSelectedInstrument('Default');
    }
  }, [user, selectedInstrument]);

  // CÁLCULO DINÁMICO DE PUNTOS
  const instrumentStats = useMemo(() => {
    const stats: Record<string, { points: number; levelName: string; levelNum: number }> = {};
    const categories = ['Guitarra', 'Piano', 'Violín', 'Batería', 'Canto', 'Teoría', 'Default'];
    
    categories.forEach(cat => {
      let points = 0;

      // 1. Puntos por Material Completado (150 pts c/u)
      completions.forEach(comp => {
        if (comp.isCompleted && (user?.role === 'student' ? comp.studentId === user.id : true)) {
          const resource = RESOURCES.find(r => r.id === comp.resourceId);
          if (resource && resource.category === cat) {
            points += 150;
          }
        }
      });

      // 2. Puntos por Horas de Clase (100 pts c/u)
      availabilities.forEach(avail => {
        avail.slots.forEach(slot => {
          if (slot.isBooked && slot.bookedBy === user?.name) {
            // Nota: Aquí asumimos que teacherId o el slot mismo está vinculado al instrumento. 
            // Para el prototipo, comparamos el instrumento del docente si estuviera disponible, 
            // o simplemente sumamos a la categoría si coincide (simulado).
            // Para ser precisos, sumaremos a la categoría seleccionada si hay match.
            // En este prototipo, las clases se agrupan en la categoría del instrumento principal del usuario.
            if (cat === user?.instruments?.[0]) {
              points += 100;
            }
          }
        });
      });

      // 3. Puntos por Mejora de Habilidad (10 pts por cada 1%)
      const skills = DEFAULT_SKILLS[cat] || [];
      skills.forEach(s => {
        points += (s.level * 10);
      });

      const levelInfo = getLevelInfo(cat, points);
      stats[cat] = { 
        points, 
        levelName: levelInfo.name, 
        levelNum: levelInfo.level 
      };
    });

    return stats;
  }, [completions, availabilities, user]);

  const totalAchievementPoints = useMemo(() => {
    // Suma de todos los puntos de instrumentos + Hitos (200 pts c/u)
    const basePoints = Object.values(instrumentStats).reduce((sum, s) => sum + s.points, 0);
    const milestonePoints = MILESTONES.filter(m => m.achieved).length * 200;
    return basePoints + milestonePoints;
  }, [instrumentStats]);

  const currentData = useMemo(() => {
    const stats = instrumentStats[selectedInstrument] || instrumentStats['Default'];
    return {
      ...stats,
      skills: DEFAULT_SKILLS[selectedInstrument] || DEFAULT_SKILLS['Default']
    };
  }, [selectedInstrument, instrumentStats]);

  if (!isMounted) return null;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground font-headline tracking-tight">
              {user?.role === 'teacher' ? 'Seguimiento del Alumno' : 'Mi Viaje de Aprendizaje 🚀'}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">Visualizando tu crecimiento musical y logros.</p>
          </div>

          <Card className="rounded-3xl border-none shadow-xl bg-accent text-white px-8 py-4 flex items-center gap-4 hover:scale-105 transition-transform duration-300">
            <Trophy className="w-10 h-10" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Puntos de Logro Globales</p>
              <h2 className="text-3xl font-black">{totalAchievementPoints.toLocaleString()} pts</h2>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-accent rounded-full" />
                <h2 className="text-2xl font-black text-secondary-foreground">Progreso por Instrumento</h2>
              </div>
              
              <div className="w-64">
                <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                  <SelectTrigger className="h-12 rounded-2xl border-2 font-black text-secondary-foreground bg-white shadow-sm">
                    <SelectValue placeholder="Elige un instrumento" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {user?.instruments?.map(inst => (
                      <SelectItem key={inst} value={inst} className="font-bold py-3">
                        {inst}
                      </SelectItem>
                    ))}
                    <SelectItem value="Teoría" className="font-bold py-3">Teoría Musical</SelectItem>
                    <SelectItem value="Default" className="font-bold py-3 text-muted-foreground">Otros / General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-secondary/20 p-8 flex flex-col items-center text-center space-y-4">
                <div className="p-5 bg-white rounded-[2rem] shadow-sm border border-primary/10">
                  <Target className="w-10 h-10 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary-foreground/60">Rango Alcanzado</p>
                  <h4 className="font-black text-2xl text-secondary-foreground mt-1">{currentData.levelName} (Nv. {currentData.levelNum})</h4>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-sm bg-accent/5 p-8 flex flex-col items-center text-center space-y-4">
                <div className="p-5 bg-white rounded-[2rem] shadow-sm border border-accent/10">
                  <Music className="w-10 h-10 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent/70">Puntos de {selectedInstrument}</p>
                  <h4 className="font-black text-3xl text-accent mt-1">{currentData.points.toLocaleString()} pts</h4>
                </div>
              </Card>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 p-8 border-b">
                <CardTitle className="flex items-center gap-3 font-black text-xl">
                  <TrendingUp className="w-6 h-6 text-accent" />
                  Habilidades Técnicas: {selectedInstrument}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {currentData.skills.map((skill, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center font-black">
                      <span className="text-lg text-secondary-foreground">{skill.name}</span>
                      <span className="text-accent bg-accent/10 px-3 py-1 rounded-full text-sm">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-4 rounded-full bg-primary/10" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-secondary-foreground rounded-full" />
              <h2 className="text-2xl font-black text-secondary-foreground">Trayectoria Global</h2>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-md bg-white">
              <CardHeader className="p-8 border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-3 font-black text-xl">
                  <Star className="w-6 h-6 text-accent fill-accent" />
                  Hitos de Carrera
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {MILESTONES.map((m, i) => (
                  <div key={i} className="flex gap-5 items-start group">
                    <div className={cn(
                      "mt-1 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all",
                      m.achieved 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm" 
                        : "bg-muted/30 border-dashed border-muted-foreground/20 text-muted-foreground/40"
                    )}>
                      {m.achieved ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                    </div>
                    <div className="space-y-1">
                      <div className={cn(
                        "font-black text-lg leading-tight",
                        m.achieved ? "text-secondary-foreground" : "text-muted-foreground/60"
                      )}>
                        {m.title}
                      </div>
                      <div className="text-sm font-bold text-muted-foreground">{m.date}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
