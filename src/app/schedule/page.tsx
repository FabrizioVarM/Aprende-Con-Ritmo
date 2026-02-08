
"use client"

import { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Video, MapPin, Plus, Music, AlertCircle, Calendar as CalendarIcon, CheckCircle2, AlertCircle as AlertIcon, Trash2, ChevronLeft, ChevronRight, Sunrise, Sun, Moon, Drum, Mic, BookOpen, Check, Info, User as UserIcon, ShieldCheck, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useBookingStore, TimeSlot } from '@/lib/booking-store';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const DEFAULT_TEACHER_ID = '2';
const DEFAULT_TEACHER_NAME = 'Carlos';
const DEFAULT_TEACHER_INSTRUMENT = 'Guitarra';

const formatToAmPm = (timeRange: string) => {
  const startPart = timeRange.split(' - ')[0];
  const [hourStr, minStr] = startPart.split(':');
  const hour = parseInt(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minStr} ${ampm}`;
};

const getTimePeriod = (timeStr: string) => {
  const hour = parseInt(timeStr.split(':')[0]);
  if (hour >= 6 && hour < 12) {
    return { 
      label: 'en la mañana', 
      icon: Sunrise, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-200' 
    };
  }
  if (hour >= 12 && hour < 19) {
    return { 
      label: 'en la tarde', 
      icon: Sun, 
      color: 'text-orange-700', 
      bg: 'bg-orange-100', 
      border: 'border-orange-200' 
    };
  }
  return { 
    label: 'en la noche', 
    icon: Moon, 
    color: 'text-indigo-700', 
    bg: 'bg-indigo-100', 
    border: 'border-indigo-200' 
  };
};

export default function SchedulePage() {
  const { user, allUsers, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [todayStr, setTodayStr] = useState<string>('');
  const [todayTimestamp, setTodayTimestamp] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingInstrument, setBookingInstrument] = useState<string>('');
  
  // Group class state
  const [groupStudents, setGroupStudents] = useState<string[]>([]);
  const [groupTeachers, setGroupTeachers] = useState<string[]>([]);
  const [groupStartTime, setGroupStartTime] = useState("16:00");
  const [groupInstrument, setGroupInstrument] = useState("Tormenta de Oro");
  const [groupType, setGroupType] = useState<'virtual' | 'presencial'>('presencial');

  const { toast } = useToast();
  const { getDayAvailability, bookSlot, cancelBooking, availabilities, setSlotStatus, createGroupClass } = useBookingStore();

  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    setTodayStr(now.toDateString());
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setTodayTimestamp(startOfToday.getTime());
    setDate(now);
    setCurrentTime(now);
  }, []);

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const teacherId = isTeacher ? user?.id : DEFAULT_TEACHER_ID;

  const studentsList = useMemo(() => allUsers.filter(u => u.role === 'student'), [allUsers]);
  const otherTeachersList = useMemo(() => allUsers.filter(u => u.role === 'teacher'), [allUsers]);

  const currentTeacherProfile = useMemo(() => {
    return allUsers.find(u => u.id === (isTeacher ? user?.id : DEFAULT_TEACHER_ID));
  }, [allUsers, isTeacher, user]);

  const teacherInstruments = useMemo(() => {
    return currentTeacherProfile?.instruments || [DEFAULT_TEACHER_INSTRUMENT];
  }, [currentTeacherProfile]);

  useEffect(() => {
    if (isBookingOpen && teacherInstruments.length > 0 && !bookingInstrument) {
      setBookingInstrument(teacherInstruments[0]);
    }
  }, [isBookingOpen, teacherInstruments, bookingInstrument]);

  const dateStrKey = useMemo(() => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, [date]);

  const availability = useMemo(() => {
    return getDayAvailability(teacherId!, date);
  }, [teacherId, date, getDayAvailability, availabilities]);
  
  const allDaySlots = availability.slots;

  const isPastSlot = (slotTime: string) => {
    const slotEndTimeStr = slotTime.split(' - ')[1];
    const [h, m] = slotEndTimeStr.split(':');
    const slotEndDate = new Date(date);
    slotEndDate.setHours(parseInt(h), parseInt(m), 0, 0);
    const comparisonTime = currentTime || new Date();
    return comparisonTime > slotEndDate;
  };

  const mySlots = useMemo(() => {
    if (isTeacher) {
      return allDaySlots.filter(s => s.isBooked);
    }
    return allDaySlots.filter(s => s.isBooked && (s.studentId === user?.id || s.bookedBy === user?.name || s.students?.some(st => st.id === user?.id)));
  }, [allDaySlots, user, isTeacher]);

  const otherAvailableSlots = useMemo(() => {
    if (!currentTime) return [];
    const isToday = date.toDateString() === currentTime.toDateString();

    return allDaySlots.filter(s => {
      if (!s.isAvailable || s.isBooked) return false;

      const startTimeStr = s.time.split(' - ')[0];
      const [h, m] = startTimeStr.split(':').map(Number);
      const slotStartTime = new Date(date);
      slotStartTime.setHours(h, m, 0, 0);

      if (isToday) {
        return currentTime.getTime() < slotStartTime.getTime();
      }

      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      return dateStart >= todayTimestamp;
    });
  }, [allDaySlots, date, currentTime, todayTimestamp]);

  const allBookings = useMemo(() => {
    if (!isAdmin) return [];
    const list: any[] = [];
    availabilities.forEach(day => {
      if (day.date === dateStrKey) {
        day.slots.forEach(slot => {
          if (slot.isBooked) {
            const teacher = allUsers.find(u => u.id === day.teacherId);
            list.push({
              ...slot,
              teacherId: day.teacherId,
              teacherName: slot.teacherName || teacher?.name || 'Profesor',
              date: day.date
            });
          }
        });
      }
    });
    return list.sort((a, b) => a.time.localeCompare(b.time));
  }, [isAdmin, availabilities, dateStrKey, allUsers]);

  const teacherPendingClasses = useMemo(() => 
    mySlots.filter(s => !isPastSlot(s.time)),
  [mySlots, date, currentTime]);

  const teacherPastClasses = useMemo(() => 
    mySlots.filter(s => isPastSlot(s.time)),
  [mySlots, date, currentTime]);

  const academicGroupClasses = useMemo(() => {
    const list: any[] = [];
    availabilities.forEach(day => {
      if (day.date === dateStrKey) {
        day.slots.forEach(slot => {
          if (slot.isBooked && slot.isGroup) {
            const teacher = allUsers.find(u => u.id === day.teacherId);
            list.push({
              ...slot,
              teacherId: day.teacherId,
              teacherName: slot.teacherName || teacher?.name || 'Profesor',
              date: day.date
            });
          }
        });
      }
    });
    return list;
  }, [availabilities, dateStrKey, allUsers]);

  const handleBook = () => {
    if (!selectedSlotId || !date || !user) return;
    const instrument = bookingInstrument || user.instruments?.[0] || DEFAULT_TEACHER_INSTRUMENT;
    const teacherName = currentTeacherProfile?.name || DEFAULT_TEACHER_NAME;
    bookSlot(teacherId!, date, selectedSlotId, user.name, user.id, instrument, teacherName);
    toast({ title: "¡Reserva Exitosa! 🎸", description: "Tu clase ha sido agendada con éxito." });
    setIsBookingOpen(false);
    setSelectedSlotId(null);
    setBookingInstrument('');
  };

  const handleCreateGroupClass = () => {
    if (groupStudents.length === 0 || !user) return;
    
    const selectedStudents = studentsList
      .filter(s => groupStudents.includes(s.id))
      .map(s => ({ id: s.id, name: s.name }));

    const selectedTeachers = otherTeachersList
      .filter(t => groupTeachers.includes(t.id))
      .map(t => ({ id: t.id, name: t.name }));

    const [h, m] = groupStartTime.split(':').map(Number);
    const endMinutes = h * 60 + m + 90;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const timeRange = `${groupStartTime} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    // On group classes, the primary teacher listed is the current user if teacher
    // or the first selected teacher if admin
    const hostId = isTeacher ? user.id : (selectedTeachers.length > 0 ? selectedTeachers[0].id : user.id);
    const hostName = isTeacher ? user.name : (selectedTeachers.length > 0 ? selectedTeachers[0].name : user.name);
    
    const collaborators = selectedTeachers.filter(t => t.id !== hostId);

    createGroupClass(hostId, date, timeRange, selectedStudents, groupInstrument, groupType, collaborators);
    
    toast({ 
      title: "Clase Grupal Agendada 🎓", 
      description: `Se ha creado una sesión especial para ${selectedStudents.length} alumnos.` 
    });
    
    setIsGroupDialogOpen(false);
    setGroupStudents([]);
    setGroupTeachers([]);
  };

  const handleCancel = (slotId: string, customTeacherId?: string) => {
    const tId = customTeacherId || teacherId;
    if (!tId) return;
    cancelBooking(tId, date, slotId);
    toast({ title: "Clase Cancelada 🗑️", description: "La reserva ha sido eliminada." });
  };

  const handleToggleStatus = (slot: any, customTeacherId?: string) => {
    const tId = customTeacherId || teacherId;
    if (!tId) return;

    const newStatus = slot.status === 'completed' ? 'pending' : 'completed';
    setSlotStatus(tId, dateStrKey, slot.id, newStatus);

    if (newStatus === 'completed') {
      toast({
        title: "Logro Validado ✅",
        description: `Se han sumado los puntos correspondientes al progreso del alumno.`,
      });
    } else {
      toast({
        title: "Estado Actualizado",
        description: "La clase ha vuelto a estado pendiente (puntos actualizados).",
      });
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
    setDate(newDate);
  };

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [date]);

  if (!isMounted || loading || !user) return null;

  const SlotCard = ({ slot, isMine, isStaffView, customTeacherId }: { slot: any, isMine: boolean, isStaffView?: boolean, customTeacherId?: string }) => {
    const period = getTimePeriod(slot.time);
    const displayTime = formatToAmPm(slot.time);
    const isCompleted = slot.status === 'completed';
    const isPast = isPastSlot(slot.time);
    const emoji = INSTRUMENT_EMOJIS[slot.instrument || 'Música'] || '🎵';

    const currentTeacherId = customTeacherId || (isStaffView || isTeacher ? teacherId : DEFAULT_TEACHER_ID);
    const teacherProfile = allUsers.find(u => u.id === currentTeacherId);
    const teacherInstrumentsList = (teacherProfile?.instruments || [DEFAULT_TEACHER_INSTRUMENT]);

    return (
      <Card className={cn(
        "rounded-[2rem] border-2 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md",
        isMine || isStaffView
          ? (isCompleted ? 'bg-emerald-50 border-emerald-200' : (isPast && isMine ? 'bg-orange-50 border-orange-200' : 'bg-accent/5 border-accent shadow-lg shadow-accent/10')) 
          : 'bg-white border-primary/5 hover:border-accent/20'
      )}>
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <div className={cn(
              "flex flex-col items-center justify-center min-w-[75px] sm:min-w-[95px] h-16 sm:h-20 rounded-2xl shrink-0 shadow-inner",
              isMine || isStaffView ? (isCompleted ? "bg-emerald-500 text-white" : (isPast && isMine ? "bg-orange-500 text-white" : "bg-accent text-white")) : "bg-primary/10 text-secondary-foreground"
            )}>
              <span className="text-sm sm:text-base font-black leading-none text-center">{displayTime}</span>
            </div>
            
            <div className="min-w-0 space-y-0.5 sm:space-y-1">
              {slot.isBooked ? (
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center text-xl rounded-xl border shadow-sm bg-primary/5">
                      {slot.isGroup ? '🎓' : emoji}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      {slot.isGroup ? `${slot.instrument}` : `Clase de ${slot.instrument || 'Música'}`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-xl font-black text-accent flex items-center gap-2">
                      <UserIcon className="w-5 h-5" />
                      {slot.isGroup ? (
                        <span className="truncate">Profesores: {[slot.teacherName || (teacherProfile?.name || DEFAULT_TEACHER_NAME), ...(slot.teachers?.map((t: any) => t.name) || [])].join(', ')}</span>
                      ) : (
                        <span>Prof. {slot.teacherName || (teacherProfile?.name || DEFAULT_TEACHER_NAME)}</span>
                      )}
                    </div>
                    <div className="text-lg font-black text-secondary-foreground flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      {slot.isGroup ? (
                        <span className="truncate">Participantes: {slot.students?.map((s: any) => s.name).join(', ')}</span>
                      ) : (
                        <span>Alumno: {slot.bookedBy}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                    <span className={cn(
                        "flex items-center gap-1 shrink-0",
                        slot.type === 'virtual' ? "text-blue-500" : "text-red-500"
                    )}>
                      {slot.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {slot.type === 'virtual' ? 'Online' : 'Presencial'}
                    </span>
                    <span className={cn(
                      "flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full border shadow-sm",
                      `${period.bg} ${period.border} ${period.color}`
                    )}>
                      <period.icon className="w-2.5 h-2.5" />
                      {period.label}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className={cn(
                    "text-base sm:text-lg font-black tracking-tight truncate flex items-center gap-2",
                    (isMine || isStaffView) ? (isCompleted ? "text-emerald-700" : (isPast && isMine ? "text-orange-700" : "text-accent")) : "text-secondary-foreground"
                  )}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-muted-foreground shrink-0 text-xs font-black uppercase tracking-widest">Disponible:</span>
                      <div className="flex items-center gap-2 truncate p-1">
                        {teacherInstrumentsList.map((inst, idx) => {
                          const emoji = INSTRUMENT_EMOJIS[inst] || '🎵';
                          return (
                            <TooltipProvider key={idx}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-2xl hover:scale-125 transition-transform cursor-help">
                                    {emoji}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-xl font-black text-[10px] py-1 uppercase tracking-widest">
                                  {inst}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </div>
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <span className="flex items-center gap-1 shrink-0 text-secondary-foreground">
                      <UserIcon className="w-3 h-3 text-accent" /> 
                      {teacherProfile?.name || DEFAULT_TEACHER_NAME}
                    </span>
                    <span className={cn(
                        "flex items-center gap-1 shrink-0",
                        slot.type === 'virtual' ? "text-blue-500" : "text-red-500"
                    )}>
                      {slot.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {slot.type === 'virtual' ? 'Online' : 'Presencial'}
                    </span>
                    <span className={cn(
                      "flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full border shadow-sm",
                      `${period.bg} ${period.border} ${period.color}`
                    )}>
                      <period.icon className="w-2.5 h-2.5" />
                      {period.label}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {(isStaffView || isTeacher || isAdmin) && slot.isBooked ? (
              <div className="flex items-center gap-3">
                {isPast && (
                  <div className="flex flex-col items-center gap-1.5 border-r border-primary/10 pr-3">
                    <span className={cn("text-[9px] font-black uppercase", isCompleted ? "text-emerald-600" : "text-orange-600")}>
                      {isCompleted ? 'Completado' : 'Pendiente'}
                    </span>
                    <Switch 
                      checked={isCompleted} 
                      onCheckedChange={() => handleToggleStatus(slot, customTeacherId)} 
                    />
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleCancel(slot.id, customTeacherId)} 
                  className="text-destructive hover:bg-destructive/10 rounded-full h-10 w-10 shrink-0"
                  title="Eliminar reserva"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ) : isMine ? (
              <>
                {!isPast && (
                  <Button variant="ghost" size="icon" onClick={() => handleCancel(slot.id)} className="text-destructive hover:bg-destructive/10 rounded-full h-9 w-9 sm:h-10 sm:w-10">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-2xl transition-all", 
                  isCompleted ? "bg-emerald-100 text-emerald-700" : (isPast ? "bg-orange-100 text-orange-700" : "bg-accent/10 text-accent")
                )}>
                  {isCompleted ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Completado</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      {isPast && (
                        <span className="text-[10px] font-black uppercase tracking-widest">Revisando</span>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              !slot.isBooked && (
                <Button 
                  size="sm" 
                  className="bg-accent text-white rounded-xl font-black px-4 h-10 shadow-lg shadow-accent/20 hover:scale-105 transition-all"
                  onClick={() => {
                    setSelectedSlotId(slot.id);
                    setIsBookingOpen(true);
                  }}
                >
                  Reservar
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground font-headline tracking-tight">
              {isAdmin ? 'Monitor Global de Clases 🏢' : (isTeacher ? 'Gestión de Clases 👩‍🏫' : 'Tu Agenda Musical 📅')}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">
              {isAdmin 
                ? 'Supervisa todas las actividades de la academia en tiempo real.' 
                : (isTeacher ? 'Controla tus sesiones, marca completadas y suma puntos a tus alumnos.' : 'Gestiona tus clases y descubre nuevos horarios.')}
            </p>
          </div>
          
          <div className="flex gap-2">
            {(isTeacher || isAdmin) && (
              <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary text-secondary-foreground border-2 border-secondary-foreground/10 rounded-2xl gap-2 h-14 px-8 shadow-xl hover:scale-105 transition-all font-black">
                    <Users className="w-5 h-5" /> Nueva Clase Grupal
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] max-w-2xl border-none p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <DialogHeader className="bg-primary/10 p-8 border-b space-y-2 shrink-0">
                    <DialogTitle className="text-2xl font-black text-secondary-foreground flex items-center gap-3">
                      <GraduationCap className="w-8 h-8 text-accent" />
                      Clase Grupal Especial 🎓
                    </DialogTitle>
                    <DialogDescription className="text-base text-secondary-foreground/70 font-medium">
                      Programar sesión de 90 minutos para múltiples alumnos y profesores.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1. Alumnos Participantes</Label>
                          <ScrollArea className="h-40 rounded-2xl border-2 p-4">
                            <div className="space-y-3">
                              {studentsList.map(student => (
                                <div key={student.id} className="flex items-center space-x-3">
                                  <Checkbox 
                                    id={`student-${student.id}`} 
                                    checked={groupStudents.includes(student.id)}
                                    onCheckedChange={(checked) => {
                                      setGroupStudents(prev => 
                                        checked ? [...prev, student.id] : prev.filter(id => id !== student.id)
                                      )
                                    }}
                                  />
                                  <label htmlFor={`student-${student.id}`} className="text-sm font-bold leading-none cursor-pointer">
                                    {student.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">2. Profesores Participantes</Label>
                          <ScrollArea className="h-40 rounded-2xl border-2 p-4">
                            <div className="space-y-3">
                              {otherTeachersList.map(t => (
                                <div key={t.id} className="flex items-center space-x-3">
                                  <Checkbox 
                                    id={`teacher-invite-${t.id}`} 
                                    checked={groupTeachers.includes(t.id)}
                                    onCheckedChange={(checked) => {
                                      setGroupTeachers(prev => 
                                        checked ? [...prev, t.id] : prev.filter(id => id !== t.id)
                                      )
                                    }}
                                  />
                                  <label htmlFor={`teacher-invite-${t.id}`} className="text-sm font-bold leading-none cursor-pointer">
                                    {t.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">3. Configuración</Label>
                          <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-xs font-bold">Hora de Inicio</span>
                              <Input 
                                type="time" 
                                value={groupStartTime}
                                onChange={(e) => setGroupStartTime(e.target.value)}
                                className="h-12 rounded-xl border-2 font-black"
                              />
                              <span className="text-[9px] text-accent font-black uppercase">Duración: 90 minutos</span>
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                              <span className="text-xs font-bold">Categoría</span>
                              <Select value={groupInstrument} onValueChange={setGroupInstrument}>
                                <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {['Música', 'Guitarra', 'Piano', 'Bajo', 'Violín', 'Batería', 'Canto', 'Teoría', 'Tormenta de Oro'].map(cat => (
                                    <SelectItem key={cat} value={cat} className="font-bold">{cat}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 bg-gray-50 flex gap-3 border-t shrink-0 mt-auto">
                    <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)} className="rounded-2xl flex-1 h-12 border-primary/10 font-black">Cancelar</Button>
                    <Button 
                      onClick={handleCreateGroupClass} 
                      disabled={groupStudents.length === 0} 
                      className="bg-accent text-white rounded-2xl flex-1 h-12 font-black shadow-lg shadow-accent/20"
                    >
                      Confirmar Clase Grupal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {!isTeacher && !isAdmin && (
              <Dialog 
                open={isBookingOpen} 
                onOpenChange={(open) => {
                  setIsBookingOpen(open);
                  if (!open) {
                    setSelectedSlotId(null);
                    setBookingInstrument('');
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-accent text-white rounded-2xl gap-2 h-14 px-8 shadow-xl shadow-accent/20 hover:scale-105 transition-all font-black">
                    <Plus className="w-5 h-5" /> Nueva Reserva Rápida
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] max-w-md border-none p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <DialogHeader className="bg-primary/10 p-8 border-b space-y-2 shrink-0">
                    <DialogTitle className="text-2xl font-black text-secondary-foreground">Agendar Sesión 🎵</DialogTitle>
                    <DialogDescription className="space-y-1">
                      <span className="block text-base text-secondary-foreground/70 font-medium">
                        {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                      <span className="block text-xs font-bold text-accent italic">
                        Elija el horario de su profesor, y a continuación elija el instrumento disponible.
                      </span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-white max-h-[60vh]">
                    {otherAvailableSlots.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {otherAvailableSlots.map((slot) => {
                          const isSelected = selectedSlotId === slot.id;
                          const period = getTimePeriod(slot.time);
                          return (
                            <div 
                              key={slot.id} 
                              className={cn(
                                "p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4",
                                isSelected 
                                  ? "bg-accent/5 border-accent shadow-md ring-2 ring-accent/20" 
                                  : "bg-white border-primary/10 hover:border-accent/30"
                              )}
                              onClick={() => {
                                setSelectedSlotId(slot.id);
                                if (!bookingInstrument && teacherInstruments.length > 0) {
                                  setBookingInstrument(teacherInstruments[0]);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "p-2.5 rounded-2xl border shadow-inner",
                                    isSelected ? "bg-accent text-white border-accent" : `${period.bg} ${period.border} ${period.color}`
                                  )}>
                                    <period.icon className="w-5 h-5 shrink-0" />
                                  </div>
                                  <div className="flex flex-col items-start min-w-0">
                                    <span className={cn("text-xl font-black leading-tight", isSelected ? "text-accent" : "text-secondary-foreground")}>
                                      {formatToAmPm(slot.time)}
                                    </span>
                                    <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-widest">
                                      {currentTeacherProfile?.name || DEFAULT_TEACHER_NAME} • {isSelected ? 'Configurando...' : 'Disponible'}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && <CheckCircle2 className="w-6 h-6 text-accent shrink-0 animate-in zoom-in" />}
                              </div>

                              {isSelected && (
                                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-1 duration-200 border-t border-accent/10" onClick={(e) => e.stopPropagation()}>
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                                    <Music className="w-3 h-3" /> ¿Qué instrumento tocarás?
                                  </Label>
                                  <Select value={bookingInstrument} onValueChange={setBookingInstrument}>
                                    <SelectTrigger className="h-12 rounded-2xl border-2 border-accent/30 bg-white font-black text-secondary-foreground focus:ring-accent">
                                      <SelectValue placeholder="Seleccionar instrumento" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-2">
                                      {teacherInstruments.map(inst => (
                                        <SelectItem key={inst} value={inst} className="font-bold py-3">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">{INSTRUMENT_EMOJIS[inst] || '🎵'}</span>
                                            <span>{inst}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-muted/20 p-8 rounded-3xl text-center border-2 border-dashed border-primary/10">
                        <AlertIcon className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-sm font-bold text-muted-foreground">¡se llenaron todos los cupos!</p>
                      </div>
                    )}
                  </div>
                  <div className="p-8 bg-gray-50 flex gap-3 border-t shrink-0 mt-auto">
                    <Button variant="outline" onClick={() => setIsBookingOpen(false)} className="rounded-2xl flex-1 h-12 border-primary/10 font-black">Cancelar</Button>
                    <Button onClick={handleBook} disabled={!selectedSlotId} className="bg-accent text-white rounded-2xl flex-1 h-12 font-black shadow-lg shadow-accent/20">Confirmar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 p-6 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-accent" />
                  Semana Actual
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')} className="h-8 w-8 rounded-full"><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')} className="h-8 w-8 rounded-full"><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-2">
                  {weekDays.map((d, i) => {
                    const isSelected = d.toDateString() === date.toDateString();
                    const isToday = d.toDateString() === todayStr;
                    return (
                      <button key={i} onClick={() => setDate(d)} className={cn("flex items-center justify-between p-4 rounded-2xl transition-all border-2", isSelected ? "bg-accent border-accent text-white shadow-lg" : "bg-white border-primary/5 hover:border-accent/30", isToday && !isSelected && "border-accent/30")}>
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{d.toLocaleDateString('es-ES', { weekday: 'long' })}</span>
                          <span className="text-xl font-black">{d.getDate()}</span>
                        </div>
                        {isToday && <Badge className={cn("rounded-full px-3 py-1 text-[9px] font-black", isSelected ? "bg-white text-accent" : "bg-accent text-white")}>HOY</Badge>}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl border border-primary/10">
              <div className="bg-accent/10 p-3 rounded-2xl shadow-sm"><Clock className="w-6 h-6 text-accent" /></div>
              <div>
                <h3 className="text-4xl font-black text-secondary-foreground capitalize leading-tight">{date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Resumen del día</p>
              </div>
            </div>
            
            <div className="space-y-10">
              {isAdmin ? (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-accent" />
                    <h2 className="text-xl font-black text-secondary-foreground">Todas las Reservas de la Academia 🌟</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {allBookings.length > 0 ? (
                      allBookings.map((slot) => (
                        <SlotCard 
                          key={`${slot.teacherId}-${slot.id}`} 
                          slot={slot} 
                          isMine={false} 
                          isStaffView={true} 
                          customTeacherId={slot.teacherId} 
                        />
                      ))
                    ) : (
                      <div className="py-20 text-center bg-primary/5 rounded-[2rem] border-2 border-dashed border-primary/10">
                        <CalendarIcon className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-bold italic">No hay clases reservadas para este día en toda la academia.</p>
                      </div>
                    )}
                  </div>
                </section>
              ) : isTeacher ? (
                <>
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-accent rounded-full" />
                      <h2 className="text-xl font-black text-secondary-foreground">Próximas Clases Pendientes ⏳</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {teacherPendingClasses.length > 0 ? (
                        teacherPendingClasses.map((slot) => <SlotCard key={slot.id} slot={slot} isMine={false} isStaffView={true} />)
                      ) : (
                        <div className="py-8 text-center bg-accent/5 rounded-[2rem] border-2 border-dashed border-accent/10">
                          <p className="text-sm font-bold text-muted-foreground">No hay clases pendientes para el resto del día.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {academicGroupClasses.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-6 h-6 text-secondary-foreground" />
                        <h2 className="text-xl font-black text-secondary-foreground">Clases Grupales de la Academia 🌍</h2>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {academicGroupClasses.map((slot) => (
                          <SlotCard 
                            key={`${slot.teacherId}-${slot.id}`} 
                            slot={slot} 
                            isMine={false} 
                            isStaffView={true} 
                            customTeacherId={slot.teacherId} 
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                      <h2 className="text-xl font-black text-secondary-foreground">Clases para Validar/Pasadas 👩‍🎓</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {teacherPastClasses.length > 0 ? (
                        teacherPastClasses.map((slot) => <SlotCard key={slot.id} slot={slot} isMine={false} isStaffView={true} />)
                      ) : (
                        <div className="py-8 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                          <p className="text-sm font-bold text-muted-foreground">No hay clases pasadas para validar hoy.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-accent rounded-full" />
                      <h2 className="text-xl font-black text-secondary-foreground">Mis Clases Confirmadas 🌟</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {mySlots.length > 0 ? (
                        mySlots.map((slot) => <SlotCard key={slot.id} slot={slot} isMine={true} />)
                      ) : (
                        <div className="py-8 text-center bg-accent/5 rounded-[2rem] border-2 border-dashed border-accent/10">
                          <p className="text-sm font-bold text-muted-foreground">No tienes clases reservadas para este día.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-primary rounded-full" />
                      <h2 className="text-xl font-black text-secondary-foreground">Horarios Disponibles para una Reserva Rápida 🎸</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {otherAvailableSlots.length > 0 ? (
                        otherAvailableSlots.map((slot) => <SlotCard key={slot.id} slot={slot} isMine={false} />)
                      ) : (
                        <div className="py-8 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                          <p className="text-sm font-bold text-muted-foreground">No hay más horarios disponibles hoy.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
