
"use client"

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-store';
import { useBookingStore } from '@/lib/booking-store';
import { 
  Users, 
  Music, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  Settings,
  Clock,
  CalendarDays,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { allUsers, getTeachers } = useAuth();
  const { availabilities } = useBookingStore();

  const teachers = useMemo(() => getTeachers(), [getTeachers]);
  const studentsCount = useMemo(() => allUsers.filter(u => u.role === 'student').length, [allUsers]);

  const calculateWeeklyAvailability = (teacherId: string) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
    
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    });

    let availableHours = 0;
    let totalSlots = 0;

    availabilities.forEach(dayAvail => {
      if (dayAvail.teacherId === teacherId && weekDates.includes(dayAvail.date)) {
        dayAvail.slots.forEach(slot => {
          if (slot.isAvailable && !slot.isBooked) {
            try {
              const [start, end] = slot.time.split(' - ');
              const [h1, m1] = start.split(':').map(Number);
              const [h2, m2] = end.split(':').map(Number);
              availableHours += (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
              totalSlots++;
            } catch (e) {
              availableHours += 1;
              totalSlots++;
            }
          }
        });
      }
    });

    return { hours: availableHours, slots: totalSlots };
  };

  const teachersAvailability = useMemo(() => {
    return teachers.map(t => ({
      ...t,
      availability: calculateWeeklyAvailability(t.id)
    })).sort((a, b) => b.availability.hours - a.availability.hours);
  }, [teachers, availabilities]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline tracking-tight">Centro de Administración 🏢</h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Resumen de las operaciones y crecimiento de la escuela.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-2xl gap-2 h-12 border-2 font-black">
            <Settings className="w-4 h-4" /> Ajustes
          </Button>
          <Button className="bg-accent text-white rounded-2xl gap-2 h-12 shadow-lg shadow-accent/20 font-black px-6">
            <UserPlus className="w-4 h-4" /> Agregar Usuario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alumnos Totales</p>
                <h3 className="text-2xl font-black text-secondary-foreground">{studentsCount.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Music className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profesores Activos</p>
                <h3 className="text-2xl font-black text-secondary-foreground">{teachers.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-2xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ingresos (Sim)</p>
                <h3 className="text-2xl font-black text-secondary-foreground">$42,500</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Retención</p>
                <h3 className="text-2xl font-black text-secondary-foreground">92%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 p-8 border-b flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-accent" />
                Disponibilidad Docente Semanal
              </CardTitle>
              <p className="text-xs font-bold text-muted-foreground italic uppercase tracking-wider">Horas habilitadas por los profesores para reserva</p>
            </div>
            <Badge className="bg-accent text-white rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">Semana Actual</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {teachersAvailability.length > 0 ? teachersAvailability.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 border-2 border-primary/20 shadow-sm transition-transform group-hover:scale-105">
                      {t.photoUrl ? (
                        <AvatarImage src={t.photoUrl} className="object-cover" />
                      ) : (
                        <AvatarImage src={`https://picsum.photos/seed/${t.id}/150`} />
                      )}
                      <AvatarFallback className="bg-primary text-secondary-foreground font-black">{t.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="font-black text-lg text-secondary-foreground">{t.name}</div>
                      <div className="flex flex-wrap gap-2">
                        {t.instruments?.map(inst => (
                          <span key={inst} className="text-[9px] font-black uppercase tracking-widest bg-secondary/30 text-secondary-foreground px-2 py-0.5 rounded-full border border-secondary/10">
                            {inst}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-2xl font-black text-accent">{t.availability.hours.toFixed(1)}h</span>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                        {t.availability.slots} turnos libres
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground/40 group-hover:text-accent transition-all group-hover:translate-x-1">
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center space-y-4">
                  <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                  <p className="text-muted-foreground font-bold italic">No hay profesores registrados en el sistema.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="border-b bg-white/50 p-6">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { user: 'Juan Pérez', action: 'Nueva Inscripción', time: 'Hace 10m' },
              { user: 'Prof. Carlos', action: 'Agenda Actualizada', time: 'Hace 1h' },
              { user: 'Emma Lou', action: 'Clase Reservada', time: 'Hace 2h' },
              { user: 'Sistema', action: 'Sincronización OK', time: 'Hace 4h' },
              { user: 'Alex Doe', action: 'Nueva Disponibilidad', time: 'Hace 1d' },
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-4 p-5 border-b last:border-0 hover:bg-muted/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <div className="flex-1">
                  <div className="text-sm font-black text-secondary-foreground">{act.action}</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{act.user}</div>
                </div>
                <div className="text-[10px] text-muted-foreground italic font-medium">{act.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
