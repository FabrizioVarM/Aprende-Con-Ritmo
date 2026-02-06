
"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, PlayCircle, Star, Clock, ChevronRight, Music, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBookingStore } from '@/lib/booking-store';
import { useAuth } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

const TEACHERS = [
  { id: '2', name: 'Prof. Carlos', instrument: 'Guitarra' },
  { id: '4', name: 'Prof. Elena', instrument: 'Teoría' },
  { id: '5', name: 'Prof. Marcos', instrument: 'Piano' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('2');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayStr, setTodayStr] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { getDayAvailability, bookSlot, availabilities } = useBookingStore();

  useEffect(() => {
    const today = new Date();
    setTodayStr(today.toDateString());
  }, []);

  const availability = useMemo(() => {
    return getDayAvailability(selectedTeacherId, selectedDate);
  }, [selectedTeacherId, selectedDate, getDayAvailability]);

  const freeSlots = availability.slots.filter(s => s.isAvailable && !s.isBooked);

  const myUpcomingLessons = useMemo(() => {
    if (!user) return [];
    
    const lessons: any[] = [];
    availabilities.forEach(dayAvail => {
      dayAvail.slots.forEach(slot => {
        if (slot.isBooked && slot.bookedBy === user.name) {
          const teacher = TEACHERS.find(t => t.id === dayAvail.teacherId);
          const lessonDate = dayAvail.date;
          const timeStart = slot.time.split(' ')[0];
          
          lessons.push({
            date: lessonDate,
            time: slot.time,
            teacherName: teacher?.name || 'Profesor',
            instrument: teacher?.instrument || 'General',
            sortDate: new Date(`${lessonDate}T${timeStart}:00`)
          });
        }
      });
    });

    const now = new Date();

    return lessons
      .filter(l => l.sortDate >= now)
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());
  }, [availabilities, user]);

  const nextLesson = myUpcomingLessons[0];

  const handleBookLesson = () => {
    if (!selectedSlotId || !user) return;

    bookSlot(selectedTeacherId, selectedDate, selectedSlotId, user.name);
    
    toast({
      title: "¡Reserva Exitosa! 🎸",
      description: "Tu clase ha sido agendada con éxito.",
    });
    
    setIsOpen(false);
    setSelectedSlotId(null);
  };

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground font-headline tracking-tight">¡Hola, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">¿Listo para tu próximo avance musical?</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-white rounded-2xl px-8 h-14 text-lg font-black shadow-xl shadow-accent/20 hover:scale-105 transition-all">
              Agendar Nueva Lección
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] max-w-4xl border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-primary/10 p-8 border-b">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-secondary-foreground flex items-center gap-3">
                  <Music className="w-8 h-8 text-accent" />
                  Agendar Sesión
                </DialogTitle>
                <DialogDescription className="text-lg text-secondary-foreground/70 font-medium">
                  Elige a tu profesor y encuentra el horario perfecto.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-8 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">1. Profesor</label>
                    <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                      <SelectTrigger className="rounded-2xl h-14 text-lg font-bold border-2">
                        <SelectValue placeholder="Elige un profesor" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {TEACHERS.map(t => (
                          <SelectItem key={t.id} value={t.id} className="font-bold py-3">
                            {t.name} ({t.instrument})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">2. Selecciona el Día</label>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((d, i) => {
                        const isSelected = d.toDateString() === selectedDate.toDateString();
                        const isToday = d.toDateString() === todayStr;
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedDate(d)}
                            className={cn(
                              "flex flex-col items-center py-3 rounded-xl transition-all border-2 relative",
                              isSelected 
                                ? "bg-accent border-accent text-white" 
                                : "bg-primary/5 border-transparent hover:border-accent/30",
                              isToday && !isSelected && "border-accent/30"
                            )}
                          >
                            <span className="text-[8px] font-black uppercase">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                            <span className="text-lg font-black">{d.getDate()}</span>
                            {isToday && (
                              <span className={cn(
                                "text-[7px] font-black uppercase absolute -bottom-1",
                                isSelected ? "text-white/80" : "text-accent"
                              )}>
                                HOY
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">3. Horarios Libres</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {freeSlots.length > 0 ? (
                      freeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedSlotId === slot.id ? "default" : "outline"}
                          className={cn(
                            "justify-between rounded-2xl h-14 border-2 font-black px-6 text-lg",
                            selectedSlotId === slot.id 
                              ? 'bg-accent text-white border-accent' 
                              : 'border-primary/5 hover:border-accent/30'
                          )}
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          <span className="flex items-center gap-3">
                            <Clock className="w-5 h-5" />
                            {slot.time}
                          </span>
                          {selectedSlotId === slot.id && <CheckCircle2 className="w-5 h-5 animate-in zoom-in" />}
                        </Button>
                      ))
                    ) : (
                      <div className="bg-muted/10 p-10 rounded-[2rem] text-center border-2 border-dashed">
                        <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="font-black text-muted-foreground">Sin cupos libres</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex gap-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-2xl flex-1 h-14 font-black">
                Cancelar
              </Button>
              <Button 
                onClick={handleBookLesson} 
                disabled={!selectedSlotId}
                className="bg-accent text-white rounded-2xl flex-1 h-14 font-black shadow-xl"
              >
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-secondary/30 p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-secondary-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-accent fill-accent" />
              Tu Instrumento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-4xl font-black text-secondary-foreground truncate">
              {user?.instruments?.[0] || 'Música'}
            </div>
            <p className="text-sm text-secondary-foreground/60 font-bold mt-1">Instrumento Principal</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-primary/20 p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-secondary-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-accent" />
              Siguiente Cita
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-black text-secondary-foreground leading-tight truncate">
              {nextLesson ? nextLesson.time.split(' ')[0] : 'Sin fecha'}
            </div>
            <p className="text-sm text-secondary-foreground/60 font-bold mt-1">
              {nextLesson 
                ? `${new Date(nextLesson.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long' })} con ${nextLesson.teacherName}` 
                : '¡Agenda una clase!'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-sm bg-orange-100/50 p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-orange-600 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Total Reservas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-5xl font-black text-orange-900">{myUpcomingLessons.length}</div>
            <p className="text-sm text-orange-600 font-bold mt-1">Clases próximas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="border-b bg-primary/5 p-6">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-accent" />
              Tus Próximas Clases
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {myUpcomingLessons.length > 0 ? (
              myUpcomingLessons.slice(0, 4).map((lesson, i) => (
                <div key={i} className="flex items-center justify-between p-6 hover:bg-primary/5 transition-colors border-b last:border-0">
                  <div className="flex gap-4 items-center">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-primary/10">
                      <Music className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <div className="font-black text-lg text-secondary-foreground leading-tight">Lección de {lesson.instrument}</div>
                      <div className="text-sm text-muted-foreground font-bold">
                        {new Date(lesson.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })} @ {lesson.time}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground font-black px-4 py-1 rounded-full">
                    {lesson.teacherName}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <Music className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold italic">No tienes clases agendadas próximamente.</p>
                <Button 
                  variant="link" 
                  className="text-accent font-black mt-2"
                  onClick={() => setIsOpen(true)}
                >
                  Haz tu primera reserva aquí
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="border-b bg-accent/5 p-6">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-accent" />
              Recursos Recomendados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { title: 'Intro a Acordes', length: '15 min', type: 'Video' },
              { title: 'Hoja de Práctica #4', length: '2 págs', type: 'PDF' },
              { title: 'Pentatónica Menor', length: '12 min', type: 'Video' },
            ].map((resource, i) => (
              <div key={i} className="flex items-center justify-between p-6 hover:bg-accent/5 transition-colors border-b last:border-0">
                <div className="flex gap-4 items-center">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-primary/10">
                    <PlayCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="font-black text-lg text-secondary-foreground leading-tight">{resource.title}</div>
                    <div className="text-sm text-muted-foreground font-bold">{resource.length}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/10">
                  <ChevronRight className="w-6 h-6 text-accent" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
