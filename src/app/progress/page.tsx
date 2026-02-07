
"use client"

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-store';
import { Star, Award, TrendingUp, Music, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for different instruments to demonstrate functionality
const PROGRESS_DATA_BY_INSTRUMENT: Record<string, {
  skills: { name: string; level: number; color: string }[];
  level: string;
  points: number;
}> = {
  'Guitarra': {
    skills: [
      { name: 'Precisión de Ritmo', level: 85, color: 'bg-accent' },
      { name: 'Lectura de Notas', level: 60, color: 'bg-blue-500' },
      { name: 'Dinámicas', level: 45, color: 'bg-orange-500' },
      { name: 'Técnica', level: 72, color: 'bg-green-500' },
    ],
    level: 'Entusiasta de la Guitarra (Nv. 2)',
    points: 2450
  },
  'Piano': {
    skills: [
      { name: 'Independencia de manos', level: 40, color: 'bg-accent' },
      { name: 'Lectura en Clave de Fa', level: 75, color: 'bg-blue-500' },
      { name: 'Escalas Mayores', level: 90, color: 'bg-orange-500' },
      { name: 'Uso del Pedal', level: 30, color: 'bg-green-500' },
    ],
    level: 'Principiante de Piano (Nv. 1)',
    points: 1200
  },
  'Violín': {
    skills: [
      { name: 'Postura del Arco', level: 65, color: 'bg-accent' },
      { name: 'Intonación', level: 50, color: 'bg-blue-500' },
      { name: 'Vibrato', level: 20, color: 'bg-orange-500' },
      { name: 'Lectura Rápida', level: 40, color: 'bg-green-500' },
    ],
    level: 'Aprendiz de Violín (Nv. 1)',
    points: 850
  },
  'Batería': {
    skills: [
      { name: 'Coordinación', level: 70, color: 'bg-accent' },
      { name: 'Velocidad', level: 55, color: 'bg-blue-500' },
      { name: 'Rudimentos', level: 80, color: 'bg-orange-500' },
      { name: 'Groove', level: 65, color: 'bg-green-500' },
    ],
    level: 'Ritmo en Marcha (Nv. 2)',
    points: 1800
  },
  'Canto': {
    skills: [
      { name: 'Respiración', level: 90, color: 'bg-accent' },
      { name: 'Afinación', level: 75, color: 'bg-blue-500' },
      { name: 'Proyección', level: 60, color: 'bg-orange-500' },
      { name: 'Dicción', level: 85, color: 'bg-green-500' },
    ],
    level: 'Voz en Formación (Nv. 2)',
    points: 2100
  },
  'Default': {
    skills: [
      { name: 'Teoría Musical', level: 50, color: 'bg-accent' },
      { name: 'Entrenamiento Auditivo', level: 30, color: 'bg-blue-500' },
    ],
    level: 'Estudiante de Música',
    points: 500
  }
};

const MILESTONES = [
  { title: 'Nivel 1 Completado', date: 'Oct 2023', achieved: true },
  { title: 'Primera Presentación', date: 'Dic 2023', achieved: true },
  { title: 'Maestro de Escalas Mayores', date: 'Ene 2024', achieved: true },
  { title: 'Eficiencia Nivel 2', date: 'Esperado Abr 2024', achieved: false },
];

export default function ProgressPage() {
  const { user } = useAuth();
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');

  useEffect(() => {
    if (user && user.instruments && user.instruments.length > 0 && !selectedInstrument) {
      setSelectedInstrument(user.instruments[0]);
    } else if (user && (!user.instruments || user.instruments.length === 0) && !selectedInstrument) {
      setSelectedInstrument('Default');
    }
  }, [user, selectedInstrument]);

  const currentData = PROGRESS_DATA_BY_INSTRUMENT[selectedInstrument] || PROGRESS_DATA_BY_INSTRUMENT['Default'];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground font-headline tracking-tight">
              {user?.role === 'teacher' ? 'Resumen del Progreso del Estudiante' : 'Mi Viaje de Aprendizaje 🚀'}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">Visualizando tu crecimiento musical y logros.</p>
          </div>

          {(user?.instruments && user.instruments.length > 0) && (
            <div className="w-full md:w-64 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ver progreso de:</label>
              <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-black text-secondary-foreground bg-white shadow-sm">
                  <SelectValue placeholder="Elige un instrumento" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {user.instruments.map(inst => (
                    <SelectItem key={inst} value={inst} className="font-bold py-3">
                      {inst}
                    </SelectItem>
                  ))}
                  <SelectItem value="Default" className="font-bold py-3 text-muted-foreground">Teoría / General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 p-8 border-b">
                <CardTitle className="flex items-center gap-3 font-black text-xl">
                  <TrendingUp className="w-6 h-6 text-accent" />
                  Habilidades en {selectedInstrument === 'Default' ? 'Música' : selectedInstrument}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-secondary/30 p-8 flex flex-col items-center text-center space-y-4">
                <div className="p-5 bg-white rounded-[2rem] shadow-sm border border-primary/10">
                  <Music className="w-10 h-10 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary-foreground/60">Nivel Alcanzado</p>
                  <h4 className="font-black text-2xl text-secondary-foreground mt-1">{currentData.level}</h4>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-sm bg-accent/10 p-8 flex flex-col items-center text-center space-y-4">
                <div className="p-5 bg-white rounded-[2rem] shadow-sm border border-accent/10">
                  <Award className="w-10 h-10 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent/70">Puntos de Ritmo</p>
                  <h4 className="font-black text-3xl text-accent mt-1">{currentData.points.toLocaleString()} pts</h4>
                </div>
              </Card>
            </div>
          </div>

          <Card className="rounded-[2.5rem] border-none shadow-md bg-white">
            <CardHeader className="p-8 border-b bg-gray-50/50">
              <CardTitle className="flex items-center gap-3 font-black text-xl">
                <Star className="w-6 h-6 text-accent fill-accent" />
                Hitos Globales
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
    </AppLayout>
  );
}
