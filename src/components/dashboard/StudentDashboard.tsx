
"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar as CalendarIcon, 
  PlayCircle, 
  Star, 
  Clock, 
  ChevronRight, 
  Music, 
  CheckCircle2, 
  AlertCircle, 
  Video, 
  MapPin,
  Mic,
  Drum,
  BookOpen,
  Guitar,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Check,
  Users,
  Sunrise,
  Sun,
  Moon
} from 'lucide-react';
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
import { useCompletionStore } from '@/lib/completion-store';
import { useResourceStore } from '@/lib/resource-store';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const INSTRUMENT_EMOJIS: Record<string, string> = {
  'Guitarra': '🎸',
  'Piano': '🎹',
  'Violín': '🎻',
  'Batería': '🥁',
  'Canto': '🎤',
  'Teoría': '📖',
  'Bajo': '🎸',
  'Música': '🎵',
  'Tormenta de Oro': '⚡'
};

const INSTRUMENT_CONFIG: Record<string, { color: string, bg: string, border: string }> = {
  'Guitarra': { color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
  'Piano': { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  'Violín': { color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
  'Batería': { color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
  'Canto': { color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  'Teoría': { color: 'text-cyan-600', bg: 'bg-cyan-100', border: 'border-cyan-200' },
  'Bajo': { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200' },
  'Tormenta de Oro': { color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
  'Default': { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' }
};

const normalizeStr = (s: string) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

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

const getTimePeriod = (timeStr: string) => {
  const hour = parseInt(timeStr.split(':')[0]);
  if (hour >= 6 && hour < 12) {
    return { 
      label: 'en la mañana', 
      icon: Sunrise, 
      color: 'text-yellow-600 dark:text-yellow-400', 
      bg: 'bg-yellow-50 dark:bg-yellow-950/30', 
      border: 'border-yellow-200 dark:border-yellow-900/50' 
    };
  }
  if (hour >= 12 && hour < 19) {
    return { 
      label: 'en la tarde', 
      icon: Sun, 
      color: 'text-orange-700 dark:text-orange-400', 
      bg: 'bg-orange-100 dark:bg-orange-950/30', 
      border: 'border-orange-200 dark:border-orange-900/50' 
    };
  }
  return { 
    label: 'en la noche', 
    icon: Moon, 
    color: 'text-indigo-700 dark:text-indigo-400', 
    bg: 'bg-indigo-100 dark:bg-indigo-950/30', 
    border: 'border-indigo-200 dark:border-indigo-900/50' 
  };
};

export default function StudentDashboard() {
  const { user, getTeachers } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<string>('Guitarra');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayStr, setTodayStr] = useState<string>('');
  const [todayTimestamp, setTodayTimestamp] = useState<number>(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  const { getDayAvailability, bookSlot, availabilities } = useBookingStore();
  const { completions, getCompletionStatus } = useCompletionStore();
  const { resources } = useResourceStore();

  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    setTodayStr(now.toDateString());
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setTodayTimestamp(startOfToday.getTime());
    setCurrentTime(now);
    setSelectedDate(now);
  }, []);

  const teachers = useMemo(() => getTeachers(), [getTeachers]);

  const availableInstruments = useMemo(() => {
    const instruments = new Set<string>();
    teachers.forEach(t => {
      t.instruments?.forEach(inst => {
        instruments.add(inst);
      });
    });
    return Array.from(instruments).sort();
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => t.instruments?.includes(selectedInstrument));
  }, [selectedInstrument, teachers]);

  useEffect(() => {
    if (filteredTeachers.length > 0) {
      const isCurrentTeacherValid = filteredTeachers.some(t => t.id === selectedTeacherId);
      if (!isCurrentTeacherValid) {
        setSelectedTeacherId(filteredTeachers[0].id);
      }
    } else {
      setSelectedTeacherId('');
    }
  }, [selectedInstrument, filteredTeachers, selectedTeacherId]);

  const availability = useMemo(() => {
    if (!selectedTeacherId) return { slots: [] };
    return getDayAvailability(selectedTeacherId, selectedDate);
  }, [selectedTeacherId, selectedDate, getDayAvailability, availabilities]);

  const freeSlots = useMemo(() => {
    if (!currentTime || !selectedDate) return [];
    
    const isToday = selectedDate.toDateString() === currentTime.toDateString();
    
    return availability.slots.filter(s => {
      if (!s.isAvailable || s.isBooked) return false;
      
      const startTimeStr = s.time.split(' - ')[0];
      const [h, m] = startTimeStr.split(':').map(Number);
      const slotStartTime = new Date(selectedDate);
      slotStartTime.setHours(h, m, 0, 0);

      if (isToday && currentTime.getTime() >= slotStartTime.getTime()) {
        return false;
      }
      
      const selectedDateStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
      return selectedDateStart >= todayTimestamp;
    });
  }, [availability.slots, selectedDate, currentTime, todayTimestamp]);

  const myUpcomingLessons = useMemo(() => {
    if (!user || !currentTime) return [];
    
    const lessons: any[] = [];
    availabilities.forEach(dayAvail => {
      dayAvail.slots.forEach(slot => {
        const isParticipant = slot.isBooked && (
          slot.studentId === user.id || 
          slot.bookedBy === user.name || 
          slot.students?.some(st => st.id === user.id)
        );

        if (isParticipant) {
          const teacher = teachers.find(t => t.id === dayAvail.teacherId);
          const lessonDate = dayAvail.date;
          
          const timeParts = slot.time.split(' - ');
          let startTimeStr = timeParts[0].trim();
          let endTimeStr = timeParts[1]?.trim() || startTimeStr;

          const formatTime = (t: string) => {
            if (t.includes(':')) {
              const [h, m] = t.split(':');
              return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
            }
            return t.padStart(2, '0') + ':00';
          };

          const startTime = formatTime(startTimeStr);
          const endTime = formatTime(endTimeStr);
          
          const endDateTime = new Date(`${lessonDate}T${endTime}:00`);
          
          if (currentTime.getTime() < endDateTime.getTime()) {
            lessons.push({
              id: slot.id,
              date: lessonDate,
              time: slot.time,
              teacherName: slot.teacherName || teacher?.name || 'Profesor',
              instrument: slot.instrument || (teacher?.instruments?.includes(selectedInstrument) ? selectedInstrument : (teacher?.instruments?.[0] || 'Música')),
              type: slot.type,
              isGroup: slot.isGroup,
              sortDate: new Date(`${lessonDate}T${startTime}:00`)
            });
          }
        }
      });
    });

    return lessons
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .slice(0, 4);
  }, [availabilities, user, currentTime, teachers, selectedInstrument]);

  const nextLesson = myUpcomingLessons[0];

  const topInstrument = useMemo(() => {
    if (!user) return 'Música';
    
    const studentInstruments = [...(user.instruments || []), 'Teoría'];
    const stats: Record<string, number> = {};

    studentInstruments.forEach(cat => {
      let points = 0;
      
      completions.forEach(comp => {
        if (comp.isCompleted && String(comp.studentId) === String(user.id)) {
          const resource = resources.find(r => r.id === comp.resourceId);
          if (resource) {
            const isTarget = normalizeStr(resource.category) === normalizeStr(cat);
            if (isTarget) points += 150;
          }
        }
      });

      availabilities.forEach(day => {
        day.slots.forEach(slot => {
          const isMyCompletedSlot = slot.isBooked && 
            slot.status === 'completed' && 
            (String(slot.studentId) === String(user.id) || slot.students?.some(st => String(st.id) === String(user.id)));

          if (isMyCompletedSlot) {
            const slotInst = slot.instrument || 'Música';
            if (normalizeStr(slotInst) === normalizeStr(cat)) {
              points += Math.round(calculateDuration(slot.time) * 20);
            }
          }
        });
      });

      stats[cat] = points;
    });

    let maxPts = -1;
    let bestInst = user.instruments?.[0] || 'Música';
    
    Object.entries(stats).forEach(([inst, pts]) => {
      if (pts > maxPts) {
        maxPts = pts;
        bestInst = inst;
      }
    });

    return bestInst;
  }, [user, completions, availabilities, resources]);

  const recommendedResources = useMemo(() => {
    if (!user) return [];
    
    const userInstruments = user.instruments || [];
    
    return resources.filter(res => {
      const isRelevant = userInstruments.includes(res.category) || res.category === 'Teoría';
      const isCompleted = getCompletionStatus(res.id, user.id);
      return isRelevant && !isCompleted;
    }).slice(0, 3);
  }, [user, getCompletionStatus, resources]);

  const handleBookLesson = () => {
    if (!selectedSlotId || !user || !selectedTeacherId) return;

    const teacher = teachers.find(t => t.id === selectedTeacherId);
    bookSlot(selectedTeacherId, selectedDate, selectedSlotId, user.name, user.id, selectedInstrument, teacher?.name);
    
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

  if (!isMounted) return null;

  const topInstConfig = INSTRUMENT_CONFIG[topInstrument] || INSTRUMENT_CONFIG['Default'];

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
          <DialogContent className="rounded-[2.5rem] max-w-4xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
            <DialogHeader className="bg-primary/10 p-8 border-b space-y-2 shrink-0">
              <DialogTitle className="text-3xl font-black text-foreground flex items-center gap-3">
                <Music className="w-8 h-8 text-accent" />
                Agendar Sesión
              </DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground font-medium">
                Elige tu instrumento y profesor para encontrar el horario perfecto.
              </DialogDescription>
            </DialogHeader>

            <div className="p-8 space-y-8 bg-card overflow-y-auto flex-1 max-h-[60vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">1. Instrumento</label>
                      <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                        <SelectTrigger className="rounded-2xl h-14 text-lg font-bold border-2 bg-card text-foreground">
                          <SelectValue placeholder="¿Qué quieres practicar?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {availableInstruments.map(inst => {
                            const config = INSTRUMENT_CONFIG[inst] || INSTRUMENT_CONFIG['Default'];
                            const emoji = INSTRUMENT_EMOJIS[inst] || '🎵';
                            return (
                              <SelectItem key={inst} value={inst} className="font-bold py-3">
                                <div className="flex items-center gap-3">
                                  <div className={cn("w-10 h-10 flex items-center justify-center text-xl rounded-xl border shadow-sm", config.bg, config.border)}>
                                    {emoji}
                                  </div>
                                  <span>{inst}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">2. Elige tu Profesor</label>
                      <div className="grid grid-cols-1 gap-2">
                        {filteredTeachers.length > 0 ? filteredTeachers.map(t => (
                          <Button
                            key={t.id}
                            variant={selectedTeacherId === t.id ? "default" : "outline"}
                            className={cn(
                              "h-16 rounded-2xl justify-start px-4 border-2 font-black transition-all",
                              selectedTeacherId === t.id 
                                ? "bg-accent border-accent text-white shadow-lg" 
                                : "bg-card text-foreground hover:border-accent/30 hover:bg-accent/5"
                            )}
                            onClick={() => setSelectedTeacherId(t.id)}
                          >
                            <Avatar className="w-8 h-8 mr-3 border-2 border-white/20">
                                {t.photoUrl ? (
                                  <AvatarImage src={t.photoUrl} className="object-cover" />
                                ) : (
                                  <AvatarImage src={`https://picsum.photos/seed/${t.avatarSeed || t.id}/100`} />
                                )}
                                <AvatarFallback>{t.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                                <p className="text-sm leading-none">{t.name}</p>
                                <p className="text-[10px] opacity-70 uppercase tracking-tighter mt-1">{selectedInstrument}</p>
                            </div>
                            {selectedTeacherId === t.id && <CheckCircle2 className="ml-auto w-5 h-5" />}
                          </Button>
                        )) : (
                          <p className="text-sm font-bold text-muted-foreground text-center py-4 italic">No hay profesores disponibles para este instrumento.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">3. Selecciona el Día</label>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setDate(selectedDate.getDate() - 7);
                            setSelectedDate(newDate);
                          }}
                          className="h-8 w-8 rounded-full hover:bg-accent/10 text-foreground"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setDate(selectedDate.getDate() + 7);
                            setSelectedDate(newDate);
                          }}
                          className="h-8 w-8 rounded-full hover:bg-accent/10 text-foreground"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
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
                              "flex flex-col items-center py-3 rounded-xl transition-all border-2 relative",
                              isSelected 
                                ? "bg-accent border-accent text-white shadow-md" 
                                : "bg-primary/5 border-transparent hover:border-accent/20",
                              isToday && !isSelected && "border-accent/30",
                              isPast && "opacity-40 grayscale pointer-events-none cursor-not-allowed bg-muted border-border"
                            )}
                          >
                            <span className={cn("text-[8px] font-black uppercase", isSelected ? "text-white" : "text-muted-foreground")}>{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                            <span className={cn("text-lg font-black", isSelected ? "text-white" : "text-foreground")}>{d.getDate()}</span>
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
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">HORARIOS LIBRES RESTANTES</label>
                  <div className="grid grid-cols-1 gap-2">
                    {freeSlots.length > 0 ? (
                      freeSlots.map((slot) => {
                        const isSelected = selectedSlotId === slot.id;
                        const period = getTimePeriod(slot.time);
                        return (
                          <Button
                            key={slot.id}
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                              "justify-between rounded-2xl h-20 border-2 font-black px-6",
                              isSelected 
                                ? 'bg-accent text-white border-accent shadow-md' 
                                : 'bg-card text-foreground border-primary/5 hover:border-accent/30'
                            )}
                            onClick={() => setSelectedSlotId(slot.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2.5 rounded-xl border shadow-inner",
                                isSelected ? "bg-white/20 border-white/30" : `${period.bg} ${period.border} ${period.color}`
                              )}>
                                <period.icon className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col items-start">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg leading-none">{slot.time}</span>
                                    <span className={cn(
                                      "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border",
                                      isSelected ? "bg-white/20 border-white/30 text-white" : `${period.bg} ${period.border} ${period.color}`
                                    )}>
                                      {period.label}
                                    </span>
                                  </div>
                                  <span className={cn(
                                      "text-[9px] font-black uppercase flex items-center gap-1 mt-1",
                                      slot.type === 'virtual' ? (isSelected ? "text-white/80" : "text-blue-500") : (isSelected ? "text-white/80" : "text-red-500")
                                  )}>
                                      {slot.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                      {slot.type === 'virtual' ? 'Online' : 'Presencial'}
                                  </span>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="w-5 h-5 animate-in zoom-in" />}
                          </Button>
                        );
                      })
                    ) : (
                      <div className="bg-muted/10 p-8 rounded-[2.5rem] text-center border-4 border-dashed border-primary/5 space-y-4">
                        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/30" />
                        <div className="space-y-2">
                          <p className="font-black text-muted-foreground">¡Vaya! Todos los cupos están llenos para este día.</p>
                          <p className="text-xs font-bold text-muted-foreground/70 italic">Te sugerimos esperar a que se libere un cupo o elegir otro día en el calendario.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-muted/30 flex gap-4 border-t shrink-0 mt-auto">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-2xl flex-1 h-14 font-black text-foreground">
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
        <Card className={cn("rounded-[2.5rem] border-none shadow-sm p-6", topInstConfig.bg.replace('/10', '/30'))}>
          <CardHeader className="p-0 pb-4">
            <CardTitle className={cn("text-sm font-black uppercase tracking-widest flex items-center gap-2", topInstConfig.color)}>
              <Star className="w-5 h-5 fill-current" />
              Tu Instrumento Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className={cn("text-4xl font-black truncate", topInstConfig.color)}>
              {topInstrument}
            </div>
            <p className={cn("text-sm font-bold mt-1 opacity-60", topInstConfig.color)}>Máximo Progreso</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-emerald-50 dark:bg-emerald-950/20 p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className={cn("text-sm font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-2")}>
              <CalendarIcon className="w-5 h-5 text-accent" />
              CLASE MÁS PROXIMA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-black text-emerald-900 dark:text-emerald-300 leading-tight truncate">
              {nextLesson ? nextLesson.time.split(' ')[0] : 'Sin fecha'}
            </div>
            <p className="text-sm text-emerald-700/60 dark:text-emerald-400/60 font-bold mt-1">
              {nextLesson 
                ? `${new Date(nextLesson.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long' })} con ${nextLesson.teacherName}` 
                : '¡Agenda una clase!'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-sm bg-orange-100/50 dark:bg-orange-950/20 p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              TOTAL RESERVAS PENDIENTES
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-5xl font-black text-orange-900 dark:text-orange-300">{myUpcomingLessons.length}</div>
            <p className="text-sm text-orange-600 dark:text-orange-400 font-bold mt-1">Clases programadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-card">
          <CardHeader className="border-b bg-primary/5 p-6">
            <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
              <CalendarIcon className="w-6 h-6 text-accent" />
              Tus Próximas Clases
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {myUpcomingLessons.length > 0 ? (
              myUpcomingLessons.map((lesson, i) => {
                const config = INSTRUMENT_CONFIG[lesson.instrument] || INSTRUMENT_CONFIG['Default'];
                const emoji = INSTRUMENT_EMOJIS[lesson.instrument] || '🎵';
                return (
                  <div key={lesson.id || i} className="flex items-center justify-between p-4 sm:p-6 hover:bg-primary/5 transition-colors border-b last:border-0 border-border">
                    <div className="flex gap-3 sm:gap-4 items-center min-w-0">
                      <div className={cn("w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-3xl sm:text-4xl rounded-3xl shadow-md border shrink-0", config.bg, config.border)}>
                        {lesson.isGroup ? '🎓' : emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-base sm:text-lg text-foreground leading-tight truncate flex items-center gap-2">
                          <span>{lesson.isGroup ? `Clase Grupal Especial: ${lesson.instrument}` : `Lección de ${lesson.instrument}`}</span>
                        </div>
                        <div className="text-[11px] sm:text-sm text-muted-foreground font-bold truncate">
                          {new Date(lesson.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })} @ {lesson.time}
                        </div>
                        <div className={cn(
                            "text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1 mt-1",
                            lesson.type === 'virtual' ? "text-blue-500" : "text-red-500"
                        )}>
                          {lesson.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          {lesson.type === 'virtual' ? 'Online' : 'Presencial'}
                        </div>
                      </div>
                    </div>
                    <Badge className="hidden sm:inline-flex bg-secondary text-secondary-foreground font-black px-4 py-1 rounded-full shrink-0 shadow-sm">
                      {lesson.teacherName}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="p-16 text-center">
                <Music className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold italic">No tienes clases agendadas próximamente.</p>
                <Button 
                  variant="link" 
                  className="text-accent font-black mt-2 underline"
                  onClick={() => setIsOpen(true)}
                >
                  Haz tu primera reserva aquí
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-card">
          <CardHeader className="border-b bg-accent/5 p-6">
            <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
              <PlayCircle className="w-6 h-6 text-accent" />
              Recursos Recomendados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recommendedResources.length > 0 ? (
              recommendedResources.map((resource, i) => (
                <div key={i} className="flex items-center justify-between p-4 sm:p-6 hover:bg-accent/5 transition-colors border-b last:border-0 border-border">
                  <div className="flex gap-3 sm:gap-4 items-center min-w-0">
                    <div className="bg-white dark:bg-slate-800 p-2 sm:p-4 rounded-3xl shadow-md border border-primary/10 shrink-0">
                      <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-base sm:text-lg text-foreground leading-tight truncate">{resource.title}</div>
                      <div className="text-[11px] sm:text-sm text-muted-foreground font-bold truncate">{resource.length} • {resource.type}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/10 shrink-0 text-accent" onClick={() => router.push('/library')}>
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <Music className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold italic">¡Todo al día! No hay recursos pendientes para tus instrumentos.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
