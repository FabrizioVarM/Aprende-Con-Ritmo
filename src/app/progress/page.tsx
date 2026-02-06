
"use client"

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-store';
import { Star, Award, TrendingUp, Music, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProgressPage() {
  const { user } = useAuth();

  const SKILLS = [
    { name: 'Precisión de Ritmo', level: 85, color: 'bg-accent' },
    { name: 'Lectura de Notas', level: 60, color: 'bg-blue-500' },
    { name: 'Dinámicas', level: 45, color: 'bg-orange-500' },
    { name: 'Técnica', level: 72, color: 'bg-green-500' },
  ];

  const MILESTONES = [
    { title: 'Nivel 1 Completado', date: 'Oct 2023', achieved: true },
    { title: 'Primera Presentación', date: 'Dic 2023', achieved: true },
    { title: 'Maestro de Escalas Mayores', date: 'Ene 2024', achieved: true },
    { title: 'Eficiencia Nivel 2', date: 'Esperado Abr 2024', achieved: false },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline">
            {user?.role === 'teacher' ? 'Resumen del Progreso del Estudiante' : 'Mi Viaje de Aprendizaje 🚀'}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Visualizando tu crecimiento musical y logros.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-3xl border-none shadow-md overflow-hidden">
              <CardHeader className="bg-primary/20">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Desarrollo de Habilidades
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {SKILLS.map((skill, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-lg">{skill.name}</span>
                      <span className="text-accent">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-3" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="rounded-3xl border-none shadow-sm bg-secondary/20 p-6 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <Music className="w-8 h-8 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-xl">Nivel Actual</h4>
                  <p className="text-muted-foreground">Entusiasta de la Guitarra (Nv. 2)</p>
                </div>
              </Card>

              <Card className="rounded-3xl border-none shadow-sm bg-accent/10 p-6 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-xl">Puntos de Logro</h4>
                  <p className="text-muted-foreground">2,450 Puntos de Ritmo</p>
                </div>
              </Card>
            </div>
          </div>

          <Card className="rounded-3xl border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                Hitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className={cn(
                    "mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    m.achieved ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    {m.achieved ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div>
                    <div className={cn("font-bold", !m.achieved && "text-muted-foreground")}>{m.title}</div>
                    <div className="text-sm text-muted-foreground">{m.date}</div>
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
