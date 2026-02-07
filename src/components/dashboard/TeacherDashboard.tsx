
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useBookingStore, TimeSlot } from '@/lib/booking-store';
import { useAuth } from '@/lib/auth-store';
import { useSkillsStore } from '@/lib/skills-store';
import { useCompletionStore } from '@/lib/completion-store';
import { Clock, Calendar as CalendarIcon, User, Plus, Trash2, Save, GraduationCap, CheckCircle2, ChevronLeft, ChevronRight, Eraser, Video, MapPin, Music, Drum, Keyboard, Mic, BookOpen, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

const calculateDuration = (timeStr: string): number => {
  try {
    const [start, end] = timeStr.split(' - ');
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const startMinutes = h1 * 60 + m1;
    const endMinutes = h2 * 60 + m2;
    return (endMinutes - startMinutes) / 60;
  } catch (e) {
    return 1;
  }
};

export default function TeacherDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayStr, setTodayStr] = useState<string>('');
  const [todayTimestamp, setTodayTimestamp] = useState<number>(0);
  const { toast } = useToast();
  const { availabilities, getDayAvailability, updateAvailability } = useBookingStore();
  const { user, allUsers } = useAuth();
  const { completions } = useCompletionStore();

  const teacherId = user?.id || '2'; 
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    setTodayStr(now.toDateString());
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setTodayTimestamp(startOfToday.getTime());
    setSelectedDate(now);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const data = getDayAvailability(teacherId, selectedDate);
      setLocalSlots(JSON.parse(JSON.stringify(data.slots)));
    }
  }, [selectedDate, isOpen, getDayAvailability, teacherId]);

  const toggleSlotAvailability = (index: number) => {
    const newSlots = [...localSlots];
    if (!newSlots[index].isBooked) {
      newSlots[index].isAvailable = !newSlots[index].isAvailable;
      setLocalSlots(newSlots);
    }
  };

  const updateSlotTime = (index: number, newTime: string) => {
    const newSlots = [...localSlots];
    newSlots[index].time = newTime;
    setLocalSlots(newSlots);
  };

  const addSlot = () => {
    const newSlot: TimeSlot = {
      id: Math.random().toString(36).substring(2, 9),
      time: "08:00 - 09:00",
      isAvailable: true,
      isBooked: false,
      type: 'presencial',
      status: 'pending'
    };
    setLocalSlots([...localSlots, newSlot]);
  };

  const removeSlot = (index: number) => {
    if (localSlots[index].isBooked) {
      toast({
        variant: "destructive",
        title: "No se puede eliminar",
        description: "Este horario ya ha sido reservado por un alumno.",
      });
      return;
    }
    const newSlots = localSlots.filter((_, i) => i !== index);
    setLocalSlots(newSlots);
  };

  const clearAllSlots = () => {
    const bookedSlots = localSlots.filter(s => s.isBooked);
    setLocalSlots(bookedSlots);
    toast({ title: "Día Limpiado 🧹", description: "Se han eliminado los horarios no reservados." });
  };

  const handleSaveAvailability = () => {
    updateAvailability(teacherId, selectedDate, localSlots);
    toast({ title: "Disponibilidad Guardada ✅", description: "Horarios actualizados." });
    setIsOpen(false);
  };

  const currentDayBookedSlots = useMemo(() => {
    const data = getDayAvailability(teacherId, selectedDate);
    const now = new Date();
    return data.slots.filter(s => {
      if (!s.isBooked) return false;
      const timeParts = s.time.split(' - ');
      const endTimeStr = timeParts[1]?.trim() || timeParts[0].trim();
      const [h, m] = endTimeStr.split(':').map(Number);
      const slotEndDate = new Date(selectedDate);
      slotEndDate.setHours(h, m, 0, 0);
      return s.status !== 'completed' && now < slotEndDate;
    });
  }, [selectedDate, getDayAvailability, teacherId, availabilities]);

  const trackedStudents = useMemo(() => {
    const studentsMap = new Map<string, { 
      id: string, 
      name: string, 
      instruments: string[],
      hoursByInstrument: Map<string, number>,
      completedResourcesCount: number
    }>();

    availabilities.forEach(day => {
      if (day.teacherId === teacherId) {
        day.slots.forEach(slot => {
          if (slot.isBooked && (slot.studentId || slot.bookedBy)) {
            const studentId = slot.studentId || slot.bookedBy!;
            const studentProfile = allUsers.find(u => u.id === studentId || u.name === slot.bookedBy);
            
            const duration = calculateDuration(slot.time);
            const isCompleted = slot.status === 'completed';
            
            let studentData = studentsMap.get(studentId);
            if (!studentData) {
              const resCount = completions.filter(c => c.studentId === studentId && c.isCompleted).length;
              
              studentData = { 
                id: studentId, 
                name: studentProfile?.name || slot.bookedBy || 'Alumno', 
                instruments: studentProfile?.instruments || [],
                hoursByInstrument: new Map(),
                completedResourcesCount: resCount
              };
              studentsMap.set(studentId, studentData);
            }

            if (isCompleted) {
              let instrument = slot.instrument;
              if (!instrument || instrument === 'Música') {
                instrument = studentProfile?.instruments?.[0] || 'Música';
              }
              const currentHours = studentData.hoursByInstrument.get(instrument) || 0;
              studentData.hoursByInstrument.set(instrument, currentHours + duration);
            }
          }
        });
      }
    });

    return Array.from(studentsMap.values());
  }, [availabilities, teacherId, allUsers, completions]);

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

  const totalWeeklyEnabledHours = useMemo(() => {
    let total = 0;
    const weekDateStrings = weekDays.map(d => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    availabilities.forEach(day => {
      if (day.teacherId === teacherId && weekDateStrings.includes(day.date)) {
        day.slots.forEach(slot => {
          if (slot.isAvailable || slot.isBooked) {
            total += calculateDuration(slot.time);
          }
        });
      }
    });
    return total;
  }, [availabilities, teacherId, weekDays]);

  const isSelectedDatePast = useMemo(() => {
    if (!todayTimestamp) return false;
    const dateCopy = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    return dateCopy.getTime() < todayTimestamp;
  }, [selectedDate, todayTimestamp]);

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground font-headline tracking-tight">Panel del Prof. {user?.name.split(' ')[0]} 🎻</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Gestiona tu agenda y el progreso de tus alumnos.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-white rounded-xl gap-2 h-12 px-6 shadow-lg shadow-accent/20 hover:scale-105 transition-all font-black">
              <Clock className="w-5 h-5" /> Gestionar Horarios
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem] max-w-5xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
            <DialogHeader className="bg-primary/10 p-6 border-b space-y-2 shrink-0">
              <DialogTitle className="text-2xl font-black text-secondary-foreground flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-accent" />
                Gestionar Horarios
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-6 space-y-6 bg-white overflow-y-auto flex-1 max-h-[60vh]">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1. Día</Label>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => {
                        const prev = new Date(selectedDate);
                        prev.setDate(prev.getDate() - 7);
                        setSelectedDate(prev);
                      }} className="rounded-full h-8 w-8">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        const next = new Date(selectedDate);
                        next.setDate(next.getDate() + 7);
                        setSelectedDate(next);
                      }} className="rounded-full h-8 w-8">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((d, i) => {
                      const isSelected = d.toDateString() === selectedDate.toDateString();
                      const isToday = d.toDateString() === todayStr;
                      const dateAtStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                      const isPast = todayTimestamp > 0 && dateAtStart.getTime() < todayTimestamp;

                      return (
                        <button
                          key={i}
                          disabled={isPast}
                          onClick={() => !isPast && setSelectedDate(d)}
                          className={cn(
                            "flex flex-col items-center py-2 md:py-3 rounded-xl transition-all border-2 relative group",
                            isSelected 
                              ? "bg-accent border-accent text-white shadow-md scale-105" 
                              : "bg-primary/5 border-transparent hover:border-accent/20",
                            isToday && !isSelected && "border-accent/30",
                            isPast && "opacity-40 grayscale pointer-events-none cursor-not-allowed bg-gray-100 border-gray-200"
                          )}
                        >
                          <span className="text-[8px] font-black uppercase tracking-wider">
                            {d.toLocaleDateString('es-ES', { weekday: 'short' })}
                          </span>
                          <span className="text-base font-black">{d.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-base font-black text-secondary-foreground capitalize">
                      {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                    </p>
                    {!isSelectedDatePast && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={clearAllSlots} className="rounded-full border-destructive/50 text-destructive h-8 px-3 text-[10px] font-black">
                          <Eraser className="w-3 h-3 mr-1" /> Limpiar
                        </Button>
                        <Button size="sm" variant="outline" onClick={addSlot} className="rounded-full border-accent text-accent h-8 px-3 text-[10px] font-black">
                          <Plus className="w-3 h-3 mr-1" /> Añadir
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {localSlots.map((slot, i) => (
                      <div key={slot.id} className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                        slot.isBooked ? "bg-orange-50 border-orange-200" : slot.isAvailable ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-100 opacity-60",
                        isSelectedDatePast && "opacity-50 grayscale pointer-events-none"
                      )}>
                        <div className="flex-1 relative">
                          <Input
                            value={slot.time}
                            onChange={(e) => updateSlotTime(i, e.target.value)}
                            disabled={slot.isBooked || isSelectedDatePast}
                            className="h-9 pl-3 text-xs rounded-lg font-bold bg-white border-2"
                          />
                          {slot.isBooked && (
                            <div className="flex items-center gap-1 mt-0.5 ml-1">
                              <User className="w-2 h-2 text-orange-600" />
                              <span className="text-[8px] font-black text-orange-600 uppercase">{slot.bookedBy}</span>
                            </div>
                          )}
                        </div>
                        <Switch 
                          checked={slot.isAvailable || slot.isBooked} 
                          disabled={slot.isBooked || isSelectedDatePast}
                          onCheckedChange={() => toggleSlotAvailability(i)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeSlot(i)} disabled={slot.isBooked || isSelectedDatePast} className="h-7 w-7">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl flex-1 h-12 font-black">Cancelar</Button>
              <Button onClick={handleSaveAvailability} disabled={isSelectedDatePast} className="bg-accent text-white rounded-xl flex-1 h-12 font-black gap-2">Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-none shadow-sm bg-blue-50/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Alumnos Activos</p>
          <div className="text-3xl font-black text-blue-900 mt-1">{trackedStudents.length}</div>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm bg-green-50/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Horas Semanales Habilitadas</p>
          <div className="text-3xl font-black text-green-900 mt-1">{totalWeeklyEnabledHours.toFixed(1)} h</div>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm bg-accent/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-accent">Materiales</p>
          <div className="text-3xl font-black text-accent-foreground mt-1">12</div>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm bg-secondary/20 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-secondary-foreground">Total de horas ejercidas</p>
          <div className="text-3xl font-black text-secondary-foreground mt-1">
            {Math.round(trackedStudents.reduce((acc, s) => {
              let h = 0;
              s.hoursByInstrument.forEach(val => h += val);
              return acc + h;
            }, 0))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 p-6 border-b">
            <CardTitle className="flex items-center gap-2 font-black text-xl">
              <GraduationCap className="w-6 h-6 text-accent" />
              Seguimiento de Alumnos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {trackedStudents.length > 0 ? trackedStudents.map((student) => (
              <div key={student.id} className="flex flex-col gap-4 p-4 rounded-3xl border border-primary/10 bg-white hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-accent shrink-0 shadow-sm">
                      <AvatarImage src={`https://picsum.photos/seed/${student.id}/100`} />
                      <AvatarFallback className="bg-primary text-secondary-foreground font-black">{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-black text-lg text-secondary-foreground truncate leading-tight">{student.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">Resumen Académico</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-accent/5 px-3 py-1.5 rounded-xl border border-accent/10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-accent">Recursos Completados:</span>
                    <span className="text-xs font-black text-secondary-foreground">{student.completedResourcesCount}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {student.instruments.map(inst => {
                    const hours = student.hoursByInstrument.get(inst) || 0;
                    return (
                      <div key={inst} className="bg-primary/5 rounded-2xl p-2 px-3 flex items-center justify-between border border-primary/5">
                        <span className="text-xs font-bold text-secondary-foreground">{inst}</span>
                        <Badge variant="secondary" className="bg-accent text-white rounded-lg px-2 py-0.5 text-[10px] font-black shadow-sm">
                          {hours.toFixed(1)} h
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )) : (
              <div className="py-20 text-center">
                <GraduationCap className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold italic">No hay alumnos con clases registradas todavía.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-accent/5 p-4 border-b">
            <CardTitle className="text-base flex items-center gap-2 font-black">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Sesiones Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentDayBookedSlots.length > 0 ? (
              currentDayBookedSlots.map((cls, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="font-black text-xs">{cls.time.split(' ')[0]}</div>
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate">{cls.bookedBy}</div>
                      <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                        <Music className="w-2.5 h-2.5" /> {cls.instrument || 'Música'}
                      </div>
                    </div>
                  </div>
                  <Badge className={cn(
                    "rounded-full px-2 py-0 text-[8px] font-black uppercase",
                    cls.type === 'virtual' ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
                  )}>
                    {cls.type === 'virtual' ? 'Online' : 'Sede'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground italic text-xs font-medium">
                <p>Sin sesiones pendientes.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
