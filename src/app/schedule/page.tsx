
"use client"

import { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Video, MapPin, Plus, Music, AlertCircle, Calendar as CalendarIcon, CheckCircle2, AlertCircle as AlertIcon, Trash2, ChevronLeft, ChevronRight, ChevronDown, Sunrise, Sun, Moon, User as UserIcon, ShieldCheck, GraduationCap, Users, Check, MousePointerClick, MapPin as MapPinIcon, AlertTriangle, Building2, Home } from 'lucide-react';
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
import { useSettingsStore, FALLBACK_ZONES } from '@/lib/settings-store';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

const DEFAULT_TEACHER_NAME = 'Profesor';
const DEFAULT_TEACHER_INSTRUMENT = 'Música';

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

export default function SchedulePage() {
  const { user, allUsers, loading } = useAuth();
  const { settings } = useSettingsStore();
  const [isMounted, setIsMounted] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [todayStr, setTodayStr] = useState<string>('');
  const [todayTimestamp, setTodayTimestamp] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  
  // Collapsible states - Changed to start as closed (false)
  const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState(false);
  const [isDaySelectorOpen, setIsDaySelectorOpen] = useState(false);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingInstrument, setBookingInstrument] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedModality, setSelectedModality] = useState<'sede' | 'virtual' | 'domicilio'>('domicilio');
  
  // Group Class States
  const [groupStudents, setGroupStudents] = useState<string[]>([]);
  const [groupTeachers, setGroupTeachers] = useState<string[]>([]);
  const [groupStartTime, setGroupStartTime] = useState<string>('10:00');
  const [groupInstrument, setGroupInstrument] = useState<string>('Música');

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

  const activeZones = useMemo(() => settings.zones || FALLBACK_ZONES, [settings]);

  useEffect(() => {
    if (activeZones.length > 0 && !selectedZone) {
      const firstNonVirtual = activeZones.find(z => z !== 'Virtual') || activeZones[0];
      setSelectedZone(firstNonVirtual);
    }
  }, [activeZones, selectedZone]);

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const teachersList = useMemo(() => allUsers.filter(u => u.role === 'teacher'), [allUsers]);
  const studentsList = useMemo(() => allUsers.filter(u => u.role === 'student'), [allUsers]);
  const otherTeachersList = useMemo(() => allUsers.filter(u => u.role === 'teacher'), [allUsers]);

  useEffect(() => {
    if (!loading && user && !selectedTeacherId && teachersList.length > 0) {
      if (isTeacher) {
        setSelectedTeacherId(user.id);
      } else {
        setSelectedTeacherId(teachersList[0].id);
      }
    }
  }, [loading, user, isTeacher, teachersList, selectedTeacherId]);

  const currentTeacherProfile = useMemo(() => {
    return allUsers.find(u => u.id === selectedTeacherId);
  }, [allUsers, selectedTeacherId]);

  const teacherInstruments = useMemo(() => {
    return currentTeacherProfile?.instruments || [DEFAULT_TEACHER_INSTRUMENT];
  }, [currentTeacherProfile]);

  const dateStrKey = useMemo(() => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, [date]);

  const availability = useMemo(() => {
    return getDayAvailability(selectedTeacherId, date);
  }, [selectedTeacherId, date, getDayAvailability, availabilities]);
  
  const allDaySlots = availability.slots;

  const isPastSlot = (slotTime: string) => {
    const slotEndTimeStr = slotTime.split(' - ')[1];
    const [h, m] = slotEndTimeStr.split(':');
    const slotEndDate = new Date(date);
    slotEndDate.setHours(parseInt(h), parseInt(m), 0, 0);
    const comparisonTime = currentTime || new Date();
    return comparisonTime > slotEndDate;
  };

  const hasConflict = (slotTime: string) => {
    if (!user) return false;
    return availabilities.some(day => 
      day.date === dateStrKey && 
      day.slots.some(s => 
        s.isBooked && 
        (s.studentId === user.id || s.bookedBy === user.name || s.students?.some(st => st.id === user.id)) &&
        s.time === slotTime
      )
    );
  };

  const getSlotTravelMarginError = (slot: any) => {
    if (selectedModality === 'virtual' || slot.type === 'virtual') return null;

    const teacher = currentTeacherProfile;
    if (!teacher) return null;

    const slotIndex = allDaySlots.findIndex(s => s.id === slot.id);
    if (slotIndex === -1) return null;

    if (slotIndex > 0) {
      const prev = allDaySlots[slotIndex - 1];
      if (prev.isBooked && prev.zone && prev.zone !== selectedZone && prev.zone !== 'Virtual') {
        return `Margen de viaje: El profesor tiene una clase previa en ${prev.zone}. Necesita 1 hora de traslado a ${selectedZone}.`;
      }
    }

    if (slotIndex < allDaySlots.length - 1) {
      const next = allDaySlots[slotIndex + 1];
      if (next.isBooked && next.zone && next.zone !== selectedZone && next.zone !== 'Virtual') {
        return `Margen de viaje: El profesor tiene una clase posterior en ${next.zone}. Necesita 1 hora de traslado.`;
      }
    }

    const startTimeStr = slot.time.split(' - ')[0];
    const [h, m] = startTimeStr.split(':').map(Number);
    const slotStartTime = new Date(date);
    slotStartTime.setHours(h, m, 0, 0);

    const isNearFuture = currentTime && (slotStartTime.getTime() - currentTime.getTime() < 3600000);
    const isToday = date.toDateString() === (currentTime?.toDateString() || '');

    if (isToday && isNearFuture && teacher.currentZone && teacher.currentZone !== selectedZone && teacher.currentZone !== 'Virtual') {
      return `Margen de viaje: El profesor se encuentra actualmente en ${teacher.currentZone}. No llegará a tiempo a ${selectedZone}.`;
    }

    return null;
  };

  const mySlots = useMemo(() => {
    if (isTeacher) {
      return allDaySlots.filter(s => s.isBooked);
    }
    
    const studentClasses: any[] = [];
    availabilities.forEach(day => {
      if (day.date === dateStrKey) {
        day.slots.forEach(slot => {
          const isParticipant = slot.isBooked && (
            slot.studentId === user?.id || 
            slot.bookedBy === user?.name || 
            slot.students?.some(st => st.id === user?.id)
          );
          
          if (isParticipant) {
            const teacher = allUsers.find(u => u.id === day.teacherId);
            studentClasses.push({
              ...slot,
              teacherId: day.teacherId,
              teacherName: slot.teacherName || teacher?.name || 'Profesor'
            });
          }
        });
      }
    });
    return studentClasses.sort((a, b) => a.time.localeCompare(b.time));
  }, [availabilities, dateStrKey, user, isTeacher, allDaySlots, allUsers]);

  const otherAvailableSlots = useMemo(() => {
    if (!currentTime) return [];
    const isToday = date.toDateString() === currentTime.toDateString();

    return allDaySlots.filter(s => {
      if (!s.isAvailable || s.isBooked) return false;

      if (selectedModality === 'virtual' && s.type !== 'virtual') return false;
      if (selectedModality === 'domicilio' && s.type !== 'presencial') return false;
      if (selectedModality === 'sede') return false;

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
  }, [allDaySlots, date, currentTime, todayTimestamp, selectedModality]);

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

  const dayLabel = useMemo(() => {
    if (!todayTimestamp) return 'Resumen del día';
    const selectedStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diffTime = selectedStart - todayTimestamp;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Resumen del día';
    if (diffDays < 0) return `Resumen de hace ${Math.abs(diffDays)} ${Math.abs(diffDays) === -1 ? 'día' : 'días'}`;
    return `Resumen dentro de ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  }, [date, todayTimestamp]);

  const handleBook = () => {
    if (!selectedSlotId || !date || !user || !selectedTeacherId) return;
    
    const targetSlot = otherAvailableSlots.find(s => s.id === selectedSlotId);
    if (!targetSlot) return;

    if (hasConflict(targetSlot.time)) {
      toast({
        variant: "destructive",
        title: "Conflicto de Horario",
        description: "Ya tienes una clase reservada en este horario con otro profesor."
      });
      return;
    }

    const travelError = getSlotTravelMarginError(targetSlot);
    if (travelError) {
      toast({
        variant: "destructive",
        title: "Margen de Viaje",
        description: travelError
      });
      return;
    }

    const instrument = bookingInstrument || user.instruments?.[0] || DEFAULT_TEACHER_INSTRUMENT;
    const teacherName = currentTeacherProfile?.name || DEFAULT_TEACHER_NAME;
    const finalZone = selectedModality === 'virtual' ? 'Virtual' : (selectedZone || activeZones[0]);
    
    bookSlot(selectedTeacherId, date, selectedSlotId, user.name, user.id, instrument, teacherName, adminIds, finalZone);
    toast({ title: "¡Reserva Exitosa! 🎸", description: "Tu clase ha sido agendada con éxito." });
    setIsBookingOpen(false);
    setSelectedSlotId(null);
    setBookingInstrument('');
  };

  const handleCreateGroupClass = () => {
    if (groupStudents.length === 0 || !selectedTeacherId) return;

    const studentObjects = groupStudents.map(id => {
      const s = allUsers.find(u => u.id === id);
      return { id, name: s?.name || 'Alumno' };
    });

    const teacherObjects = groupTeachers.map(id => {
      const t = allUsers.find(u => u.id === id);
      return { id, name: t?.name || 'Profesor' };
    });

    const [h, m] = groupStartTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);
    const endDate = new Date(startDate.getTime() + 90 * 60000);
    const timeStr = `${groupStartTime} - ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    createGroupClass(
      selectedTeacherId, 
      date, 
      timeStr, 
      studentObjects, 
      groupInstrument, 
      'presencial', 
      teacherObjects
    );

    toast({ title: "Clase Grupal Creada 🎓", description: "Se ha programado la sesión especial." });
    setIsGroupDialogOpen(false);
    setGroupStudents([]);
    setGroupTeachers([]);
  };

  const handleCancel = (slotId: string, teacherId?: string) => {
    const tid = teacherId || selectedTeacherId;
    cancelBooking(tid, date, slotId);
    toast({ title: "Reserva Cancelada", description: "El espacio ha sido liberado." });
  };

  const handleToggleStatus = (slot: any, teacherId?: string) => {
    const tid = teacherId || selectedTeacherId;
    const newStatus = slot.status === 'completed' ? 'pending' : 'completed';
    setSlotStatus(tid, dateStrKey, slot.id, newStatus);
    toast({ 
      title: newStatus === 'completed' ? "Clase Validada ✅" : "Estado Actualizado",
      description: newStatus === 'completed' ? "Se han sumado puntos al alumno." : "La clase vuelve a estar pendiente."
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
    setDate(newDate);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    setDate(newDate);
  };

  const handleGoToToday = () => {
    const now = new Date();
    setDate(now);
    toast({
      description: "Has vuelto al día de hoy 🗓️",
    });
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

  const weekRangeStr = useMemo(() => {
    if (weekDays.length < 7) return '';
    const start = weekDays[0];
    const end = weekDays[6];
    
    const startDay = start.getDate();
    const startMonth = start.toLocaleDateString('es-ES', { month: 'long' });
    const endDay = end.getDate();
    const endMonth = end.toLocaleDateString('es-ES', { month: 'long' });

    if (start.getMonth() === end.getMonth()) {
      return `Del ${startDay} al ${endDay} de ${startMonth}`;
    } else {
      return `Del ${startDay} de ${start.toLocaleDateString('es-ES', { month: 'short' })} al ${endDay} de ${end.toLocaleDateString('es-ES', { month: 'short' })}`;
    }
  }, [weekDays]);

  const adminIds = useMemo(() => allUsers.filter(u => u.role === 'admin').map(u => u.id), [allUsers]);

  if (!isMounted || loading || !user) return null;

  const SlotCard = ({ slot, isMine, isStaffView, customTeacherId }: { slot: any, isMine: boolean, isStaffView?: boolean, customTeacherId?: string }) => {
    const period = getTimePeriod(slot.time);
    const displayTime = formatToAmPm(slot.time);
    const isCompleted = slot.status === 'completed';
    const isPast = isPastSlot(slot.time);
    const emoji = INSTRUMENT_EMOJIS[slot.instrument || 'Música'] || '🎵';

    const currentId = customTeacherId || (isStaffView || isTeacher ? selectedTeacherId : (slot.teacherId || selectedTeacherId));
    const teacherProfile = allUsers.find(u => u.id === currentId);
    const teacherInstrumentsList = (teacherProfile?.instruments || [DEFAULT_TEACHER_INSTRUMENT]);

    return (
      <Card className={cn(
        "rounded-[2rem] border-2 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md",
        isMine || isStaffView
          ? (isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50' : (isPast && isMine ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50' : 'bg-accent/5 dark:bg-accent/10 border-accent shadow-lg shadow-accent/10')) 
          : 'bg-card border-primary/10 hover:border-accent/20'
      )}>
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <div className={cn(
              "flex flex-col items-center justify-center min-w-[75px] sm:min-w-[95px] h-16 sm:h-20 rounded-2xl shrink-0 shadow-inner",
              isMine || isStaffView ? (isCompleted ? "bg-emerald-500 text-white" : (isPast && isMine ? "bg-orange-500 text-white" : "bg-accent text-white")) : "bg-primary/10 text-foreground"
            )}>
              <span className="text-sm sm:text-base font-black leading-none text-center">{displayTime}</span>
            </div>
            
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              {slot.isBooked ? (
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center text-xl rounded-xl border shadow-sm bg-primary/5 dark:bg-white/5">
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
                    <div className="text-lg font-black text-foreground flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      {slot.isGroup ? (
                        <span className="truncate">Participantes: {slot.students?.map((s: any) => s.name).join(', ')}</span>
                      ) : (
                        <span>Alumno: {slot.bookedBy}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                    <span className={cn(
                        "flex items-center gap-1 shrink-0",
                        slot.type === 'virtual' ? "text-blue-500 dark:text-blue-400" : "text-red-500 dark:text-red-400"
                    )}>
                      {slot.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {slot.type === 'virtual' ? 'Online' : (slot.zone || 'Presencial')}
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
                    (isMine || isStaffView) ? (isCompleted ? "text-emerald-700 dark:text-emerald-400" : (isPast && isMine ? "text-orange-700 dark:text-orange-400" : "text-accent")) : "text-foreground"
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
                    <span className="flex items-center gap-1 shrink-0 text-foreground">
                      <UserIcon className="w-3 h-3 text-accent" /> 
                      {teacherProfile?.name || DEFAULT_TEACHER_NAME}
                    </span>
                    <span className={cn(
                        "flex items-center gap-1 shrink-0",
                        slot.type === 'virtual' ? "text-blue-500 dark:text-blue-400" : "text-red-500 dark:text-red-400"
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
                    <span className={cn("text-[9px] font-black uppercase", isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400")}>
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
                  <Button variant="ghost" size="icon" onClick={() => handleCancel(slot.id, customTeacherId)} className="text-destructive hover:bg-destructive/10 rounded-full h-9 w-9 sm:h-10 sm:w-10">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-2xl transition-all", 
                  isCompleted ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : (isPast ? "bg-orange-100 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400" : "bg-accent/10 text-accent")
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
          
          <div className="flex flex-wrap gap-2">
            {(isTeacher || isAdmin) && (
              <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary text-secondary-foreground border-2 border-secondary-foreground/10 rounded-2xl gap-2 h-14 px-8 shadow-xl hover:scale-105 transition-all font-black">
                    <Users className="w-5 h-5" /> Nueva Clase Grupal
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] max-w-2xl border-none p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <DialogHeader className="bg-primary/10 dark:bg-accent/10 p-8 border-b space-y-2 shrink-0">
                    <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                      <GraduationCap className="w-8 h-8 text-accent" />
                      Clase Grupal Especial 🎓
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground font-medium">
                      Programar sesión de 90 minutos para múltiples alumnos y profesores.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-card">
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
                                  <label htmlFor={`teacher-invite-${t.id}`} className="text-sm font-bold cursor-pointer">
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
                  <div className="p-8 bg-muted/30 flex gap-3 border-t shrink-0 mt-auto">
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
                <DialogContent className="rounded-[2.5rem] max-md border-none p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <DialogHeader className="bg-primary/10 dark:bg-accent/10 p-8 border-b space-y-2 shrink-0">
                    <DialogTitle className="text-2xl font-black text-foreground">Agendar Sesión 🎵</DialogTitle>
                    <DialogDescription className="space-y-1">
                      <span className="block text-base text-foreground/70 font-medium">
                        {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                      <span className="block text-xs font-bold text-accent italic">
                        Configure su sesión personalizada.
                      </span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-card max-h-[60vh]">
                    <div className="space-y-3 pb-4 border-b border-accent/10">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                        <UserIcon className="w-3 h-3" /> 1. Elige tu Profesor
                      </Label>
                      <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                        <SelectTrigger className="h-12 rounded-2xl border-2 border-accent/30 bg-accent/5 font-black text-foreground focus:ring-accent">
                          <SelectValue placeholder="Seleccionar profesor" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2">
                          {teachersList.map(t => (
                            <SelectItem key={t.id} value={t.id} className="font-bold py-3">
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3 pb-4 border-b border-accent/10">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                        <MousePointerClick className="w-3 h-3" /> 2. Modalidad de la Clase
                      </Label>
                      <Select value={selectedModality} onValueChange={(val: any) => setSelectedModality(val)}>
                        <SelectTrigger className="h-12 rounded-2xl border-2 border-accent/30 bg-accent/5 font-black text-foreground focus:ring-accent">
                          <SelectValue placeholder="Seleccionar modalidad" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2">
                          <SelectItem value="domicilio" className="font-bold py-3">
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4 text-accent" />
                              <span>A domicilio</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="virtual" className="font-bold py-3">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-blue-500" />
                              <span>Virtual (Online)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="sede" disabled className="font-bold py-3 opacity-50">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span>En Sede (Próximamente)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedModality === 'domicilio' && (
                      <div className="space-y-3 pb-4 border-b border-accent/10 animate-in fade-in slide-in-from-top-1 duration-300">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                          <MapPinIcon className="w-3 h-3" /> 3. Zona de la Clase
                        </Label>
                        <Select value={selectedZone} onValueChange={setSelectedZone}>
                          <SelectTrigger className="h-12 rounded-2xl border-2 border-accent/30 bg-accent/5 font-black text-foreground focus:ring-accent">
                            <SelectValue placeholder="Seleccionar zona" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-2">
                            {activeZones.filter(z => z !== 'Virtual').map(z => (
                              <SelectItem key={z} value={z} className="font-bold py-3">
                                {z}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                      {selectedModality === 'domicilio' ? '4.' : '3.'} Selecciona un Horario Disponible
                    </Label>
                    
                    {otherAvailableSlots.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {otherAvailableSlots.map((slot) => {
                          const isSelected = selectedSlotId === slot.id;
                          const period = getTimePeriod(slot.time);
                          const conflict = hasConflict(slot.time);
                          const travelError = getSlotTravelMarginError(slot);

                          return (
                            <div 
                              key={slot.id} 
                              className={cn(
                                "p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4",
                                isSelected 
                                  ? "bg-accent/5 border-accent shadow-md ring-2 ring-accent/20" 
                                  : "bg-card border-primary/10 hover:border-accent/30",
                                (conflict || travelError) && "opacity-60 border-orange-200 bg-orange-50/30 cursor-not-allowed"
                              )}
                              onClick={() => {
                                if (conflict) {
                                  toast({ variant: "destructive", title: "Horario Ocupado", description: "Ya tienes una clase reservada en este horario." });
                                  return;
                                }
                                if (travelError) {
                                  toast({ variant: "destructive", title: "Margen de Viaje", description: travelError });
                                  return;
                                }
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
                                    isSelected ? "bg-accent text-white border-accent" : (conflict || travelError ? "bg-orange-100 border-orange-200 text-orange-600" : `${period.bg} ${period.border} ${period.color}`),
                                  )}>
                                    {conflict || travelError ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <period.icon className="w-5 h-5 shrink-0" />}
                                  </div>
                                  <div className="flex flex-col items-start min-w-0">
                                    <span className={cn("text-xl font-black leading-tight", isSelected ? "text-accent" : "text-foreground", (conflict || travelError) && "text-orange-700")}>
                                      {formatToAmPm(slot.time)}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-2">
                                      {conflict ? (
                                        <span className="text-[9px] font-black uppercase text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md border border-orange-200">
                                          Conflicto de horario
                                        </span>
                                      ) : travelError ? (
                                        <span className="text-[9px] font-black uppercase text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md border border-orange-200">
                                          Sin margen de viaje
                                        </span>
                                      ) : (
                                        <>
                                          <span className={cn(
                                            "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border flex items-center gap-1",
                                            isSelected ? "bg-white/20 border-white/30 text-white" : `${period.bg} ${period.border} ${period.color}`
                                          )}>
                                            <period.icon className="w-2.5 h-2.5" />
                                            {period.label}
                                          </span>
                                          <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-widest">
                                            {currentTeacherProfile?.name || DEFAULT_TEACHER_NAME}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {isSelected && <CheckCircle2 className="w-6 h-6 text-accent shrink-0 animate-in zoom-in" />}
                              </div>

                              {travelError && (
                                <p className="text-[8px] font-bold text-orange-600 leading-tight">
                                  {travelError}
                                </p>
                              )}

                              {isSelected && (
                                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-1 duration-200 border-t border-accent/10" onClick={(e) => e.stopPropagation()}>
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                                    <Music className="w-3 h-3" /> {selectedModality === 'domicilio' ? '5.' : '4.'} ¿Qué instrumento tocarás?
                                  </Label>
                                  <Select value={bookingInstrument} onValueChange={setBookingInstrument}>
                                    <SelectTrigger className="h-12 rounded-2xl border-2 border-accent/30 bg-card font-black text-foreground focus:ring-accent">
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
                      <div className="bg-muted/20 p-8 rounded-3xl text-center border-2 border-dashed border-primary/10 space-y-3">
                        <AlertIcon className="w-8 h-8 mx-auto text-muted-foreground/30" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-muted-foreground">¡Vaya! No hay horarios disponibles para esta modalidad hoy.</p>
                          <p className="text-[10px] font-bold text-muted-foreground/60 italic">Te sugerimos elegir otra modalidad o cambiar la fecha.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-8 bg-muted/30 flex gap-3 border-t shrink-0 mt-auto">
                    <Button variant="outline" onClick={() => setIsBookingOpen(false)} className="rounded-2xl flex-1 h-12 border-primary/10 font-black">Cancelar</Button>
                    <Button onClick={handleBook} disabled={!selectedSlotId} className="bg-accent text-white rounded-2xl flex-1 h-12 font-black shadow-lg shadow-accent/20">Confirmar Reserva</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6">
            <div className="px-2 space-y-1">
              <h2 className="text-2xl font-black text-foreground font-headline tracking-tight flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-accent" />
                Calendario Semanal 🗓️
              </h2>
              <p className="text-muted-foreground text-sm font-medium">Gestiona tu agenda paso a paso.</p>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-card">
              <Collapsible open={isWeekSelectorOpen} onOpenChange={isWeekSelectorOpen => setIsWeekSelectorOpen(isWeekSelectorOpen)}>
                <CardHeader className="bg-primary/5 p-6 border-b space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        Paso 1
                      </p>
                      <CardTitle className="text-base font-black text-foreground">Elige la semana</CardTitle>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isWeekSelectorOpen ? "rotate-180" : "")} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent className="space-y-4 pt-2 animate-in fade-in-0 zoom-in-95 duration-300">
                    <div className="flex items-center bg-card rounded-2xl border-2 border-primary/10 p-1 shadow-sm">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigateWeek('prev')} 
                        className="h-10 w-10 rounded-xl hover:bg-accent/10 text-foreground transition-all"
                        title="Semana anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <div className="h-6 w-px bg-primary/10 mx-1" />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigateWeek('next')} 
                        className="h-10 w-10 rounded-xl hover:bg-accent/10 text-foreground transition-all"
                        title="Siguiente semana"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-3 text-center">
                      <p className="text-sm font-black text-accent">{weekRangeStr}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold italic text-center">Navegación empezando desde la semana actual.</p>
                  </CollapsibleContent>
                  
                  {!isWeekSelectorOpen && (
                    <div className="bg-accent/5 rounded-xl p-2 text-center border border-dashed border-accent/20 cursor-pointer" onClick={() => setIsWeekSelectorOpen(true)}>
                       <p className="text-[10px] font-black text-accent uppercase tracking-widest">{weekRangeStr}</p>
                    </div>
                  )}
                </CardHeader>
              </Collapsible>

              <CardContent className="p-4">
                <Collapsible open={isDaySelectorOpen} onOpenChange={isDaySelectorOpen => setIsDaySelectorOpen(isDaySelectorOpen)} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-accent">Paso 2</p>
                      <p className="text-sm font-black text-foreground">Elige el día</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); handleGoToToday(); }}
                        className="h-7 px-3 rounded-lg text-[9px] font-black uppercase border-accent/20 text-accent hover:bg-accent hover:text-white transition-all shadow-sm"
                      >
                        Ir a Hoy
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isDaySelectorOpen ? "rotate-180" : "")} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  
                  <CollapsibleContent className="space-y-3 animate-in fade-in-0 zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 gap-2">
                      {weekDays.map((d, i) => {
                        const isSelected = d.toDateString() === date.toDateString();
                        const isToday = d.toDateString() === todayStr;
                        return (
                          <button 
                            key={i} 
                            onClick={() => setDate(d)} 
                            className={cn(
                              "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border-2 group", 
                              isSelected 
                                ? "bg-accent border-accent text-white shadow-lg scale-[1.02]" 
                                : "bg-muted/30 border-primary/10 hover:border-accent/20",
                              isToday && !isSelected && "border-accent/30"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors shadow-inner",
                                isSelected ? "bg-white/20 text-white" : "bg-primary/5 text-foreground group-hover:bg-accent/10"
                              )}>
                                <span className="text-[8px] font-black uppercase mb-0.5">{d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}</span>
                                <span className="text-xl font-black">{d.getDate()}</span>
                              </div>
                              <div className="flex flex-col items-start">
                                <span className={cn("text-sm font-black uppercase tracking-widest leading-none", isSelected ? "text-white" : "text-foreground")}>
                                  {d.toLocaleDateString('es-ES', { weekday: 'long' })}
                                </span>
                                <span className={cn("text-[10px] font-bold mt-1", isSelected ? "text-white/60" : "text-muted-foreground/60")}>
                                  {d.toLocaleDateString('es-ES', { month: 'short' })} • {d.getFullYear()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isToday && (
                                <Badge className={cn(
                                  "rounded-full px-3 py-1 text-[9px] font-black shadow-sm", 
                                  isSelected ? "bg-white text-accent" : "bg-accent text-white"
                                )}>
                                  HOY
                                </Badge>
                              )}
                              {isSelected && !isToday && (
                                <div className="bg-white/20 p-1.5 rounded-full">
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                  
                  {!isDaySelectorOpen && (
                    <div className="px-4 py-3 bg-accent/5 rounded-2xl border-2 border-dashed border-accent/20 flex items-center justify-between group cursor-pointer" onClick={() => setIsDaySelectorOpen(true)}>
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-4 h-4 text-accent" />
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">
                          {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="text-[8px] font-black text-accent uppercase tracking-widest group-hover:underline">Cambiar día</span>
                    </div>
                  )}
                </Collapsible>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 bg-card p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-accent/30 shadow-xl shadow-accent/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="bg-accent text-white p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] shadow-xl shadow-accent/20 shrink-0 w-fit">
                  <Clock className="w-6 h-6 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-accent uppercase tracking-[0.2em] mb-1">{dayLabel}</p>
                  <h3 className="text-3xl sm:text-5xl font-black text-foreground capitalize leading-tight tracking-tight flex items-center flex-wrap gap-3">
                    {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {date.toDateString() === todayStr && (
                      <Badge className="bg-accent text-white rounded-full px-4 py-1.5 text-xs sm:text-sm font-black shadow-lg shadow-accent/20 animate-in zoom-in duration-300">
                        HOY
                      </Badge>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Visualizando agenda para {date.getFullYear()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10 bg-white/60 dark:bg-black/40 p-2.5 rounded-[1.5rem] border-2 border-primary/20 backdrop-blur-md shadow-inner">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigateDay('prev')}
                  className="h-14 w-14 rounded-2xl hover:bg-accent/10 text-accent transition-all border-2 border-accent/40"
                  title="Día anterior"
                >
                  <ChevronLeft className="w-8 h-8" strokeWidth={3} />
                </Button>
                <div className="h-10 w-0.5 bg-primary/20 mx-1 rounded-full" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigateDay('next')}
                  className="h-14 w-14 rounded-2xl hover:bg-accent/10 text-accent transition-all border-2 border-accent/40"
                  title="Siguiente día"
                >
                  <ChevronRight className="w-8 h-8" strokeWidth={3} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-10">
              {isAdmin ? (
                <section className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-2 h-8 bg-accent rounded-full" />
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Todas las Reservas de la Academia 🌟</h2>
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
                      <div className="py-20 text-center bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-muted-foreground/20">
                        <CalendarIcon className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-bold italic">No hay clases reservadas para este día en toda la academia.</p>
                      </div>
                    )}
                  </div>
                </section>
              ) : isTeacher ? (
                <>
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-2 h-8 bg-accent rounded-full" />
                      <h2 className="text-2xl font-black text-foreground tracking-tight">Próximas Clases Pendientes ⏳</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {teacherPendingClasses.length > 0 ? (
                        teacherPendingClasses.map((slot) => <SlotCard key={slot.id} slot={slot} isMine={false} isStaffView={true} />)
                      ) : (
                        <div className="py-12 text-center bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-muted-foreground/20">
                          <p className="text-sm font-bold text-muted-foreground">No hay clases pendientes para el resto del día.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                      <h2 className="text-2xl font-black text-foreground tracking-tight">Clases para Validar/Pasadas 👩‍🎓</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {teacherPastClasses.length > 0 ? (
                        teacherPastClasses.map((slot) => <SlotCard key={slot.id} slot={slot} isMine={false} isStaffView={true} />)
                      ) : (
                        <div className="py-12 text-center bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-muted-foreground/20">
                          <p className="text-sm font-bold text-muted-foreground">No hay clases pasadas para validar hoy.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-2 h-8 bg-accent rounded-full" />
                      <h2 className="text-2xl font-black text-foreground tracking-tight">Mis Clases Confirmadas 🌟</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {mySlots.length > 0 ? (
                        mySlots.map((slot) => (
                          <SlotCard 
                            key={`${slot.teacherId}-${slot.id}`} 
                            slot={slot} 
                            isMine={true} 
                            customTeacherId={slot.teacherId} 
                          />
                        ))
                      ) : (
                        <div className="py-12 text-center bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-muted-foreground/20">
                          <p className="text-sm font-bold text-muted-foreground">No tienes clases reservadas para este día.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 px-2">
                        <div className="w-2 h-8 bg-primary rounded-full" />
                        <h2 className="text-2xl font-black text-foreground tracking-tight">Horarios Disponibles 🎸</h2>
                      </div>
                      
                      <Card className="rounded-2xl border-2 border-accent/20 p-1 pl-3 flex items-center gap-3 bg-card shadow-sm h-12 shrink-0">
                        <UserIcon className="w-4 h-4 text-accent shrink-0" />
                        <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                          <SelectTrigger className="w-40 h-full border-none font-black text-[10px] uppercase tracking-widest text-foreground focus:ring-0">
                            <SelectValue placeholder="Elegir Profesor" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {teachersList.map(t => (
                              <SelectItem key={t.id} value={t.id} className="font-bold text-xs">{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {otherAvailableSlots.length > 0 ? (
                        otherAvailableSlots.map((slot) => <SlotCard key={slot.id} slot={slot} isMine={false} />)
                      ) : (
                        <div className="py-12 text-center bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-muted-foreground/20 space-y-2">
                          <p className="text-sm font-bold text-muted-foreground">No hay más horarios disponibles para esta modalidad con {currentTeacherProfile?.name || 'el profesor'}.</p>
                          <p className="text-xs font-bold text-muted-foreground/60 italic">Te sugerimos cambiar de modalidad o elegir otro docente.</p>
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
