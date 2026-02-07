
"use client"

import { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Video, MapPin, Plus, Music, AlertCircle, Calendar as CalendarIcon, CheckCircle2, AlertCircle as AlertIcon, Trash2, ChevronLeft, ChevronRight, Sunrise, Sun, Moon, Drum, Keyboard, Mic, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useBookingStore, TimeSlot } from '@/lib/booking-store';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

// Simulación de datos de profesores para la vista de agenda
const TEACHER_INFO = {
  id: '2',
  name: 'Carlos',
  instrument: 'Guitarra'
};

const INSTRUMENT_ICONS: Record<string, any> = {
  'Guitarra': Music,
  'Piano': Keyboard,
  'Violín': Music,
  'Batería': Drum,
  'Canto': Mic,
  'Teoría': BookOpen,
  'Bajo': Music,
  'Flauta': Music,
};

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
      label: 'Turno Mañana', 
      icon: Sunrise, 
      color: 'text-amber-700', 
      bg: 'bg-amber-100', 
      border: 'border-amber-200' 
    };
  }
  if (hour >= 12 && hour < 19) {
    return { 
      label: 'Turno Tarde', 
      icon: Sun, 
      color: 'text-orange-700', 
      bg: 'bg-orange-100', 
      border: 'border-orange-200' 
    };
  }
  return { 
    label: 'Turno Noche', 
    icon: Moon, 
    color: 'text-indigo-700', 
    bg: 'bg-indigo-100', 
    border: 'border-indigo-200' 
  };
};

export default function SchedulePage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [todayStr, setTodayStr] = useState<string>('');
  const [todayTimestamp, setTodayTimestamp] = useState<number>(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const { toast } = useToast();
  const { getDayAvailability, bookSlot, cancelBooking, availabilities } = useBookingStore();

  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    setTodayStr(now.toDateString());
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setTodayTimestamp(startOfToday.getTime());
    setDate(now);
  }, []);

  const teacherId = TEACHER_INFO.id;
  const availability = useMemo(() => {
    return getDayAvailability(teacherId, date);
  }, [teacherId, date, getDayAvailability, availabilities]);
  
  const allDaySlots = availability.slots;

  // Filtrado de slots por categorías
  const mySlots = useMemo(() => 
    allDaySlots.filter(s => s.isBooked && s.bookedBy === user?.name),
  [allDaySlots, user]);

  const otherAvailableSlots = useMemo(() => 
    allDaySlots.filter(s => s.isAvailable && !s.isBooked),
  [allDaySlots]);

  const handleBook = () => {
    if (!selectedSlotId || !date || !user) return;

    // Para la reserva rápida, asumimos el instrumento principal o el del profesor
    const instrument = user.instruments?.[0] || TEACHER_INFO.instrument;
    bookSlot(teacherId, date, selectedSlotId, user.name, instrument);
    
    toast({
      title: "¡Reserva Exitosa! 🎸",
      description: "Tu clase ha sido agendada con éxito.",
    });
    
    setIsBookingOpen(false);
    setSelectedSlotId(null);
  };

  const handleCancel = (slotId: string) => {
    cancelBooking(teacherId, date, slotId);
    toast({
      title: "Clase Cancelada 🗑️",
      description: "Tu reserva ha sido eliminada.",
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
    setDate(newDate);
  };

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    // Ajustar para que la semana empiece en Lunes (1) en lugar de Domingo (0)
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [date]);

  if (!isMounted) {
    return null;
  }

  const SlotCard = ({ slot, isMine }: { slot: any, isMine: boolean }) => {
    const period = getTimePeriod(slot.time);
    const PeriodIcon = period.icon;
    const displayTime = formatToAmPm(slot.time);
    const InstrumentIcon = isMine ? (INSTRUMENT_ICONS[slot.instrument] || Music) : Music;

    return (
      <Card className={cn(
        "rounded-[2rem] border-2 transition-all duration-300 group overflow-hidden",
        isMine 
          ? 'bg-accent/5 border-accent shadow-lg shadow-accent/10' 
          : 'bg-white border-primary/5 hover:border-accent/20'
      )}>
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <div className={cn(
              "flex flex-col items-center justify-center min-w-[75px] sm:min-w-[95px] h-16 sm:h-20 rounded-2xl shrink-0",
              isMine ? "bg-accent text-white" : "bg-primary/10 text-secondary-foreground"
            )}>
              <span className="text-sm sm:text-base font-black leading-none text-center">{displayTime}</span>
            </div>
            
            <div className="min-w-0 space-y-0.5 sm:space-y-1">
              <h4 className={cn(
                "text-base sm:text-lg font-black tracking-tight truncate flex items-center gap-2",
                isMine ? "text-accent" : "text-secondary-foreground"
              )}>
                {isMine ? (
                  <>
                    <InstrumentIcon className="w-5 h-5" />
                    <span>Clase de {slot.instrument || 'Música'}</span>
                  </>
                ) : (
                  <>
                    <Music className="w-5 h-5" />
                    <span>Horario Disponible</span>
                  </>
                )}
              </h4>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1 shrink-0"><UserIcon className="w-3 h-3 text-accent" /> {TEACHER_INFO.name}</span>
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
                  <PeriodIcon className="w-2.5 h-2.5" />
                  {period.label}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1 sm:gap-2">
            {isMine ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleCancel(slot.id)}
                  className="text-destructive hover:bg-destructive/10 rounded-full h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
                <div className="bg-accent/10 p-2 rounded-full text-accent flex items-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </>
            ) : (
              <Button 
                size="sm"
                className="bg-accent text-white rounded-xl font-black px-3 sm:px-4 h-9 sm:h-10"
                onClick={() => {
                  setSelectedSlotId(slot.id);
                  setIsBookingOpen(true);
                }}
              >
                Reservar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const UserIcon = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground font-headline tracking-tight">Tu Agenda Musical 📅</h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">Gestiona tus clases y descubre nuevos horarios.</p>
          </div>
          
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-white rounded-2xl gap-2 h-14 px-8 shadow-xl shadow-accent/20 hover:scale-105 transition-all font-black">
                <Plus className="w-5 h-5" /> Nueva Reserva Rapida
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-md border-none p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <DialogHeader className="bg-primary/10 p-8 border-b space-y-2 shrink-0">
                <DialogTitle className="text-2xl font-black text-secondary-foreground">Agendar Sesión 🎵</DialogTitle>
                <DialogDescription className="text-base text-secondary-foreground/70 font-medium">
                  {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-white max-h-[60vh]">
                <div className="space-y-4">
                  <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" /> Horarios Libres
                  </Label>
                  
                  {otherAvailableSlots.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {otherAvailableSlots.map((slot) => {
                        const period = getTimePeriod(slot.time);
                        const PeriodIcon = period.icon;
                        const displayTime = formatToAmPm(slot.time);
                        
                        return (
                          <Button
                            key={slot.id}
                            variant={selectedSlotId === slot.id ? "default" : "outline"}
                            className={cn(
                              "justify-between rounded-2xl h-16 transition-all border-2 font-bold px-4 py-2",
                              selectedSlotId === slot.id 
                                ? 'bg-accent text-white border-accent shadow-md' 
                                : 'border-primary/5 hover:border-accent/30 hover:bg-accent/5'
                            )}
                            onClick={() => setSelectedSlotId(slot.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-1.5 rounded-lg border",
                                selectedSlotId === slot.id ? "bg-white/20 border-white/30" : `${period.bg} ${period.border} ${period.color}`
                              )}>
                                <PeriodIcon className="w-4 h-4 shrink-0" />
                              </div>
                              <div className="flex flex-col items-start min-w-0">
                                  <span className="text-base font-black leading-tight">{displayTime}</span>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground/80">
                                      {TEACHER_INFO.name} • {TEACHER_INFO.instrument}
                                    </span>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase flex items-center gap-1",
                                        slot.type === 'virtual' 
                                          ? (selectedSlotId === slot.id ? "text-white" : "text-blue-500") 
                                          : (selectedSlotId === slot.id ? "text-white" : "text-red-500")
                                    )}>
                                        {slot.type === 'virtual' ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                                        {slot.type === 'virtual' ? 'Online' : 'Presencial'}
                                    </span>
                                    <span className={cn(
                                      "text-[9px] font-black uppercase flex items-center gap-1",
                                      selectedSlotId === slot.id ? "text-white/80" : period.color
                                    )}>
                                      {period.label}
                                    </span>
                                  </div>
                              </div>
                            </div>
                            {selectedSlotId === slot.id && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-muted/20 p-8 rounded-3xl text-center border-2 border-dashed border-primary/10">
                      <AlertIcon className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm font-bold text-muted-foreground">Sin cupos libres</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-gray-50 flex gap-3 border-t shrink-0 mt-auto">
                <Button variant="outline" onClick={() => setIsBookingOpen(false)} className="rounded-2xl flex-1 h-12 border-primary/10 font-black">Cancelar</Button>
                <Button 
                  onClick={handleBook} 
                  disabled={!selectedSlotId}
                  className="bg-accent text-white rounded-2xl flex-1 h-12 font-black shadow-lg shadow-accent/20"
                >
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                  <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')} className="h-8 w-8 rounded-full">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')} className="h-8 w-8 rounded-full">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-2">
                  {weekDays.map((d, i) => {
                    const isSelected = d.toDateString() === date.toDateString();
                    const isToday = d.toDateString() === todayStr;
                    const dateAtStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                    const isPast = todayTimestamp > 0 && dateAtStart.getTime() < todayTimestamp;

                    return (
                      <button
                        key={i}
                        disabled={isPast}
                        onClick={() => !isPast && setDate(d)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-all border-2",
                          isSelected 
                            ? "bg-accent border-accent text-white shadow-lg" 
                            : "bg-white border-primary/5 hover:border-accent/30",
                          isToday && !isSelected && "border-accent/30",
                          isPast && "opacity-40 grayscale pointer-events-none cursor-not-allowed bg-gray-100 border-gray-200"
                        )}
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {d.toLocaleDateString('es-ES', { weekday: 'long' })}
                          </span>
                          <span className="text-xl font-black">{d.getDate()}</span>
                        </div>
                        {isToday && (
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={cn(
                              "rounded-full px-3 py-1 text-[9px] font-black",
                              isSelected ? "bg-white text-accent" : "bg-accent text-white"
                            )}>HOY</Badge>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl border border-primary/10">
              <div className="bg-accent/10 p-3 rounded-2xl">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-black text-secondary-foreground capitalize leading-tight">
                  {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Resumen del día</p>
              </div>
            </div>
            
            <div className="space-y-10">
              {/* Sección: Mis Clases */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-accent rounded-full" />
                  <h2 className="text-xl font-black text-secondary-foreground">Mis Clases Confirmadas 🌟</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {mySlots.length > 0 ? (
                    mySlots.map((slot) => (
                      <SlotCard key={slot.id} slot={slot} isMine={true} />
                    ))
                  ) : (
                    <div className="py-8 text-center bg-accent/5 rounded-[2rem] border-2 border-dashed border-accent/10">
                      <p className="text-sm font-bold text-muted-foreground">No tienes clases reservadas para este día.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Sección: Otros Horarios */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  <h2 className="text-xl font-black text-secondary-foreground">Horarios Disponibles para Reservar 🎸</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {otherAvailableSlots.length > 0 ? (
                    otherAvailableSlots.map((slot) => (
                      <SlotCard key={slot.id} slot={slot} isMine={false} />
                    ))
                  ) : (
                    <div className="py-8 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                      <p className="text-sm font-bold text-muted-foreground">No hay más horarios disponibles hoy.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
