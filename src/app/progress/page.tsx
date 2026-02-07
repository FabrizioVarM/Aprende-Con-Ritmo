
"use client"

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/lib/auth-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useBookingStore } from '@/lib/booking-store';
import { useSkillsStore } from '@/lib/skills-store';
import { RESOURCES } from '@/lib/resources';
import { Star, TrendingUp, Music, CheckCircle2, Trophy, Target, Users, ShieldCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock de estudiantes corregido para coincidir con auth-store.ts
const MOCK_STUDENTS = [
  { id: '1', name: 'Ana Garcia', instruments: ['Guitarra', 'Canto'] },
  { id: '4', name: 'Liam Smith', instruments: ['Piano', 'Teoría'] },
  { id: '5', name: 'Emma Wilson', instruments: ['Violín'] },
  { id: '6', name: 'Tom Holland', instruments: ['Batería', 'Guitarra'] },
];

const DEFAULT_SKILLS_CONFIG: Record<string, { name: string; color: string; defaultLevel: number }[]> = {
  'Guitarra': [
    { name: 'Precisión de Ritmo', color: 'bg-accent', defaultLevel: 20 },
    { name: 'Lectura de Notas', color: 'bg-blue-500', defaultLevel: 10 },
    { name: 'Dinámicas', color: 'bg-orange-500', defaultLevel: 5 },
    { name: 'Técnica', color: 'bg-green-500', defaultLevel: 15 },
  ],
  'Piano': [
    { name: 'Independencia de manos', color: 'bg-accent', defaultLevel: 15 },
    { name: 'Lectura en Clave de Fa', color: 'bg-blue-500', defaultLevel: 20 },
    { name: 'Escalas Mayores', color: 'bg-orange-500', defaultLevel: 30 },
    { name: 'Uso del Pedal', color: 'bg-green-500', defaultLevel: 10 },
  ],
  'Violín': [
    { name: 'Postura del Arco', color: 'bg-accent', defaultLevel: 30 },
    { name: 'Intonación', color: 'bg-blue-500', defaultLevel: 15 },
    { name: 'Vibrato', color: 'bg-orange-500', defaultLevel: 5 },
    { name: 'Lectura Rápida', color: 'bg-green-500', defaultLevel: 10 },
  ],
  'Batería': [
    { name: 'Coordinación', color: 'bg-accent', defaultLevel: 25 },
    { name: 'Velocidad', color: 'bg-blue-500', defaultLevel: 20 },
    { name: 'Rudimentos', color: 'bg-orange-500', defaultLevel: 30 },
    { name: 'Groove', color: 'bg-green-500', defaultLevel: 20 },
  ],
  'Canto': [
    { name: 'Respiración', color: 'bg-accent', defaultLevel: 40 },
    { name: 'Afinación', color: 'bg-blue-500', defaultLevel: 30 },
    { name: 'Proyección', color: 'bg-orange-500', defaultLevel: 20 },
    { name: 'Dicción', color: 'bg-green-500', defaultLevel: 35 },
  ],
  'Teoría': [
    { name: 'Lectura de Pentagrama', color: 'bg-accent', defaultLevel: 10 },
    { name: 'Intervalos', color: 'bg-blue-500', defaultLevel: 5 },
    { name: 'Armonía Básica', color: 'bg-orange-500', defaultLevel: 0 },
  ],
  'Default': [
    { name: 'Teoría Musical', color: 'bg-accent', defaultLevel: 10 },
    { name: 'Entrenamiento Auditivo', color: 'bg-blue-500', defaultLevel: 5 },
  ]
};

const MILESTONES = [
  { title: 'Nivel 1 Completado', date: 'Oct 2023', achieved: true },
  { title: 'Primera Presentación', date: 'Dic 2023', achieved: true },
  { title: 'Maestro de Escalas Mayores', date: 'Ene 2024', achieved: true },
  { title: 'Eficiencia Nivel 2', date: 'Esperado Abr 2024', achieved: false },
];

// Función auxiliar para calcular duración en horas desde un string "HH:mm - HH:mm"
const calculateDuration = (timeStr: string): number => {
  try {
    const [start, end] = timeStr.split(' - ');
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const startMinutes = h1 * 60 + m1;
    const endMinutes = h2 * 60 + m2;
    return (endMinutes - startMinutes) / 60;
  } catch (e) {
    return 1; // Default a 1 hora si falla el parseo
  }
};

const getLevelInfo = (inst: string, points: number) => {
  const getBaseName = (p: number, i: string) => {
    if (i === 'Teoría') {
      if (p >= 9000) return 'Sabio de la Composición';
      if (p >= 6200) return 'Virtuoso de la Estructura';
      if (p >= 4000) return 'Maestro del Solfeo';
      if (p >= 2300) return 'Arquitecto de Sonidos';
      if (p >= 1000) return 'Explorador del Pentagrama';
      return 'Aprendiz de Armonía';
    }
    const suffix = i === 'Batería' ? 'ista' : i === 'Piano' ? 'ista' : i === 'Guitarra' ? 'ista' : i === 'Violín' ? 'ista' : i === 'Canto' ? 'ante' : 'ista';
    const artist = i.replace(/a$|o$/, '') + suffix;

    if (p >= 9000) return 'Maestro joven';
    if (p >= 6200) return `Virtuoso con la ${i}`;
    if (p >= 4000) return `${artist} Preparado`;
    if (p >= 2300) return `${artist} en formación`;
    if (p >= 1000) return `Entusiasta de ${i}`;
    return `Aprendiz de ${i}`;
  };

  const levelNum = points >= 9000 ? 6 : points >= 6200 ? 5 : points >= 4000 ? 4 : points >= 2300 ? 3 : points >= 1000 ? 2 : 1;
  return { name: getBaseName(points, inst), level: levelNum };
};

export default function ProgressPage() {
  const { user } = useAuth();
  const { completions } = useCompletionStore();
  const { availabilities } = useBookingStore();
  const { updateSkill, getSkillLevel } = useSkillsStore();
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  const isStaff = user?.role === 'teacher' || user?.role === 'admin';

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      const initialStudentId = isStaff ? MOCK_STUDENTS[0].id : user.id;
      setSelectedStudentId(initialStudentId);
    }
  }, [user, isStaff]);

  const currentStudent = useMemo(() => {
    if (isStaff) return MOCK_STUDENTS.find(s => s.id === selectedStudentId);
    return user ? { id: user.id, name: user.name, instruments: user.instruments || [] } : null;
  }, [selectedStudentId, isStaff, user]);

  useEffect(() => {
    if (currentStudent && currentStudent.instruments?.length > 0) {
      if (!selectedInstrument || !currentStudent.instruments.includes(selectedInstrument)) {
        setSelectedInstrument(currentStudent.instruments[0]);
      }
    } else if (currentStudent) {
      setSelectedInstrument('Default');
    }
  }, [currentStudent, selectedInstrument]);

  const instrumentStats = useMemo(() => {
    if (!currentStudent) return {};
    const stats: Record<string, { points: number; completedHours: number; levelName: string; levelNum: number }> = {};
    const categories = ['Guitarra', 'Piano', 'Violín', 'Batería', 'Canto', 'Teoría', 'Default'];
    
    categories.forEach(cat => {
      let points = 0;
      let completedHours = 0;

      // 1. Puntos por recursos completados (150 pts cada uno)
      completions.forEach(comp => {
        if (comp.isCompleted && comp.studentId === currentStudent.id) {
          const resource = RESOURCES.find(r => r.id === comp.resourceId);
          if (resource && resource.category === cat) points += 150;
        }
      });

      // 2. Puntos por clases completadas (1 hora = 10 pts)
      // Se calculan dinámicamente según la duración real de la sesión
      availabilities.forEach(avail => {
        avail.slots.forEach(slot => {
          if (slot.isBooked && (slot.studentId === currentStudent.id || slot.bookedBy === currentStudent.name) && slot.instrument === cat) {
            if (slot.status === 'completed') {
              const duration = calculateDuration(slot.time);
              points += Math.round(duration * 10);
              completedHours += duration;
            }
          }
        });
      });

      // 3. Puntos por niveles de habilidades (nivel * 10)
      const skillConfigs = DEFAULT_SKILLS_CONFIG[cat] || [];
      skillConfigs.forEach(sc => {
        const level = getSkillLevel(currentStudent.id, cat, sc.name, sc.defaultLevel);
        points += (level * 10);
      });

      const levelInfo = getLevelInfo(cat, points);
      stats[cat] = { points, completedHours, levelName: levelInfo.name, levelNum: levelInfo.level };
    });

    return stats;
  }, [completions, availabilities, currentStudent, getSkillLevel]);

  const totalAchievementPoints = useMemo(() => {
    const basePoints = Object.values(instrumentStats).reduce((sum, s) => sum + s.points, 0);
    const milestonePoints = MILESTONES.filter(m => m.achieved).length * 200;
    return basePoints + milestonePoints;
  }, [instrumentStats]);

  const currentSkills = useMemo(() => {
    if (!currentStudent || !selectedInstrument) return [];
    const configs = DEFAULT_SKILLS_CONFIG[selectedInstrument] || DEFAULT_SKILLS_CONFIG['Default'];
    return configs.map(sc => ({
      ...sc,
      level: getSkillLevel(currentStudent.id, selectedInstrument, sc.name, sc.defaultLevel)
    }));
  }, [currentStudent, selectedInstrument, getSkillLevel]);

  if (!isMounted || !user) return null;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground font-headline tracking-tight">
              {isStaff ? 'Seguimiento del Alumno 👩‍🏫' : 'Mi Viaje de Aprendizaje 🚀'}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">Visualizando el crecimiento musical y logros.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {isStaff && (
              <Card className="rounded-[2rem] border-2 border-accent/20 p-2 pl-4 flex items-center gap-4 bg-white shadow-sm">
                <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="w-48 h-10 rounded-xl border-none font-black text-secondary-foreground">
                    <SelectValue placeholder="Alumno" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {MOCK_STUDENTS.map(s => (
                      <SelectItem key={s.id} value={s.id} className="font-bold">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>
            )}
            
            <Card className="rounded-[2rem] border-none shadow-xl bg-accent text-white px-8 py-4 flex items-center gap-4 shrink-0">
              <Trophy className="w-8 h-8" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Puntos Globales</p>
                <h2 className="text-2xl font-black">{totalAchievementPoints.toLocaleString()} pts</h2>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-accent rounded-full" />
                <h2 className="text-2xl font-black text-secondary-foreground">Habilidades y Nivel</h2>
              </div>
              
              <div className="w-full md:w-64">
                <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                  <SelectTrigger className="h-12 rounded-2xl border-2 font-black text-secondary-foreground bg-white shadow-sm">
                    <SelectValue placeholder="Instrumento" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {currentStudent?.instruments?.map(inst => (
                      <SelectItem key={inst} value={inst} className="font-bold py-3">{inst}</SelectItem>
                    ))}
                    <SelectItem value="Teoría" className="font-bold py-3">Teoría Musical</SelectItem>
                    <SelectItem value="Default" className="font-bold py-3 text-muted-foreground">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-secondary/20 p-8 flex flex-col items-center text-center space-y-4">
                <Target className="w-10 h-10 text-secondary-foreground" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary-foreground/60">Rango en {selectedInstrument}</p>
                  <h4 className="font-black text-xl text-secondary-foreground mt-1">
                    {instrumentStats[selectedInstrument]?.levelName} (Nv. {instrumentStats[selectedInstrument]?.levelNum})
                  </h4>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-sm bg-accent/5 p-8 flex flex-col items-center text-center space-y-4">
                <Music className="w-10 h-10 text-accent" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent/70">Puntos de {selectedInstrument}</p>
                  <h4 className="font-black text-2xl text-accent mt-1">{instrumentStats[selectedInstrument]?.points.toLocaleString()} pts</h4>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-sm bg-blue-50 p-8 flex flex-col items-center text-center space-y-4">
                <Clock className="w-10 h-10 text-blue-600" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-700/70">Horas de Clase</p>
                  <h4 className="font-black text-2xl text-blue-800 mt-1">{instrumentStats[selectedInstrument]?.completedHours.toFixed(1)} h</h4>
                </div>
              </Card>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 p-8 border-b">
                <CardTitle className="flex items-center gap-3 font-black text-xl">
                  <TrendingUp className="w-6 h-6 text-accent" />
                  Evolución Técnica: {selectedInstrument}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                {currentSkills.map((skill, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex justify-between items-center font-black">
                      <span className="text-lg text-secondary-foreground">{skill.name}</span>
                      <span className="text-accent bg-accent/10 px-4 py-1 rounded-full text-sm font-black">{skill.level}%</span>
                    </div>
                    
                    {isStaff ? (
                      <div className="flex items-center gap-6">
                        <Slider 
                          value={[skill.level]} 
                          max={100} 
                          step={1} 
                          className="flex-1"
                          onValueChange={(vals) => updateSkill(currentStudent!.id, selectedInstrument, skill.name, vals[0])}
                        />
                        <span className="text-[10px] font-black text-accent w-10 uppercase tracking-widest">Editar</span>
                      </div>
                    ) : (
                      <Progress value={skill.level} className="h-4 rounded-full bg-primary/10" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-secondary-foreground rounded-full" />
              <h2 className="text-2xl font-black text-secondary-foreground">Trayectoria</h2>
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
                      "mt-1 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2",
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
