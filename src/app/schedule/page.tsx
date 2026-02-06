
"use client"

import { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Video, MapPin, Plus, Music, AlertCircle, Calendar as CalendarIcon, CheckCircle2, AlertCircle as AlertIcon } from 'lucide-react';
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
import { useBookingStore } from '@/lib/booking-store';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function SchedulePage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [todayStr, setTodayStr] = useState<string>('');
  const [todayTimestamp, setTodayTimestamp] = useState<number>(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const { toast } = useToast();
  const { getDayAvailability, bookSlot, availabilities } = useBookingStore();

  useEffect(() => {
    const now = new Date();
    setTodayStr(now.toDateString());
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setTodayTimestamp(startOfToday.getTime());
  }, []);

  const teacherId = '2'; // Simulación con Prof. Carlos
  const availability = useMemo(() => {
    return getDayAvailability(teacherId, date);
  }, [teacherId, date, getDayAvailability, availabilities]);
  
  const freeSlots = useMemo(() => {
    return availability.slots.filter(s => s.isAvailable && !s.isBooked);
  }, [availability.slots]);

  const allDaySlots = availability.slots;

  const handleBook = () => {
    if (!selectedSlotId || !date || !user) return;

    bookSlot(teacherId, date, selectedSlotId, user.name);
    
    toast({
      title: "¡Reserva Exitosa! 🎸",
      description: "Tu clase ha sido agendada con éxito.",
    });
    
    setIsBookingOpen(false);
    setSelectedSlotId(null);
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
                <Plus className="w-5 h-5" /> Nueva Reserva
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
                  
                  {freeSlots.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {freeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedSlotId === slot.id ? "default" : "outline"}
                          className={cn(
                            "justify-between rounded-2xl h-14 transition-all border-2 font-bold px-4",
                            selectedSlotId === slot.id 
                              ? 'bg-accent text-white border-accent shadow-md' 
                              : 'border-primary/5 hover:border-accent/30 hover:bg-accent/5'
                          )}
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Music className="w-4 h-4" />
                            <div className="flex flex-col items-start">
                                <span className="text-sm">{slot.time}</span>
                                <span className={cn(
                                    "text-[10px] font-black uppercase flex items-center gap-1",
                                    slot.type === 'virtual' ? "text-blue-500" : "text-red-500"
                                )}>
                                    {slot.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                    {slot.type}
                                </span>
                            </div>
                          </div>
                          {selectedSlotId === slot.id && <CheckCircle2 className="w-4 h-4" />}
                        </Button>
                      ))}
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
                <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-2xl flex-1 h-12 border-primary/10 font-black">Cancelar</Button>
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
              <CardHeader className="bg-primary/5 p-6">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-accent" />
                  Semana Actual
                </CardTitle>
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

          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl border border-primary/10">
              <div className="bg-accent/10 p-3 rounded-2xl">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-black text-secondary-foreground capitalize leading-tight">
                  {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Horarios del día</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allDaySlots.some(s => s.isBooked || s.isAvailable) ? (
                allDaySlots.map((slot, i) => {
                  if (!slot.isBooked && !slot.isAvailable) return null;
                  const isMine = slot.bookedBy === user?.name;
                  
                  return (
                    <Card key={slot.id} className={cn(
                      "rounded-[2rem] border-2 transition-all duration-300 group",
                      isMine 
                        ? 'bg-accent/5 border-accent shadow-lg shadow-accent/10 scale-[1.02]' 
                        : slot.isBooked 
                          ? 'bg-gray-50 border-transparent opacity-60' 
                          : 'bg-white border-primary/5 hover:border-accent/20'
                    )}>
                      <CardContent className="p-5 flex items-center gap-5">
                        <div className={cn(
                          "flex flex-col items-center justify-center min-w-[80px] h-16 rounded-2xl",
                          isMine ? "bg-accent text-white" : "bg-primary/10 text-secondary-foreground"
                        )}>
                          <span className="text-lg font-black leading-none">{slot.time.split(' ')[0]}</span>
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <h4 className={cn(
                            "text-lg font-black tracking-tight",
                            isMine ? "text-accent" : "text-secondary-foreground"
                          )}>
                            {isMine ? '🌟 Tu Clase Confirmada' : slot.isBooked ? 'Ocupado' : 'Disponible'}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Music className="w-3 h-3 text-accent" /> Carlos</span>
                            <span className={cn(
                                "flex items-center gap-1",
                                slot.type === 'virtual' ? "text-blue-500" : "text-red-500"
                            )}>
                              {slot.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                              {slot.type === 'virtual' ? 'Online' : 'Presencial'}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isMine ? (
                            <div className="bg-accent/10 p-2 rounded-full text-accent">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          ) : slot.isAvailable && !slot.isBooked ? (
                            <Button 
                              size="sm"
                              className="bg-accent text-white rounded-xl font-black px-4 h-9"
                              onClick={() => {
                                setSelectedSlotId(slot.id);
                                setIsBookingOpen(true);
                              }}
                            >
                              Reservar
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-dashed border-gray-300 bg-gray-100/50 px-3 py-1 rounded-xl font-bold">Cerrado</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-primary/5 space-y-4">
                  <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-primary/20" />
                  </div>
                  <p className="text-lg font-black text-secondary-foreground">Sin disponibilidad configurada</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
