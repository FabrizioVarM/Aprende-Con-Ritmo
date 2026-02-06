"use client"

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function TeacherDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground font-headline">Panel del Prof. Carlos 🎻</h1>
        <p className="text-muted-foreground mt-1 text-lg">Tienes 4 clases programadas para hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-600">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">24</div>
            <p className="text-xs text-blue-400">+2 este mes</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-none shadow-sm bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-green-600">Asistencia Prom.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">94%</div>
            <p className="text-xs text-green-400">Sobre el promedio</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-accent">Materiales Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">12</div>
            <p className="text-xs text-accent/70">Últimos 7 días</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-secondary-foreground">Horas Clase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">120</div>
            <p className="text-xs text-secondary-foreground/60">Este semestre</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Seguimiento de Progreso</CardTitle>
            <Button variant="outline" size="sm">Ver Todos</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: 'Ana García', level: 'Guitarra 2', progress: 85 },
              { name: 'Liam Smith', level: 'Piano 1', progress: 45 },
              { name: 'Emma Wilson', level: 'Violín 3', progress: 72 },
              { name: 'Sophia Chen', level: 'Guitarra 1', progress: 20 },
            ].map((student, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold">{student.name}</span>
                  <span className="text-muted-foreground">{student.level} - {student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-md overflow-hidden">
          <CardHeader className="border-b bg-white/50">
            <CardTitle>Clases de Hoy</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { time: '10:00 AM', student: 'Ana García', mode: 'Presencial' },
              { time: '11:30 AM', student: 'Liam Smith', mode: 'En línea' },
              { time: '02:00 PM', student: 'Lección Grupal', mode: 'Taller' },
              { time: '04:00 PM', student: 'Emma Wilson', mode: 'Presencial' },
            ].map((cls, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-bold">{cls.time}</div>
                  <div className="text-sm text-muted-foreground">{cls.student}</div>
                </div>
                <Button variant="ghost" size="sm" className="text-accent font-bold">
                  Iniciar
                </Button>
              </div>
            ))}
            <div className="p-4 bg-muted/30">
              <Button className="w-full bg-accent text-white rounded-xl">Gestionar Disponibilidad</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
