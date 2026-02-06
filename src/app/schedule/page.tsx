
"use client"

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Video, MapPin, Plus, Music, AlertCircle, Calendar as CalendarIcon, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useBookingStore } from '@/lib/booking-store';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function SchedulePage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const { toast } = useToast();
  const { getDayAvailability, bookSlot } = useBookingStore();

  const teacherId = '2'; // Simulación con Prof. Carlos
  const availability = getDayAvailability(teacherId, date);
  const freeSlots = availability.slots.filter(s => s.isAvailable && !s.isBooked);
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

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground font-headline tracking-tight">Tu Agenda Musical 📅</h1>
            <p className="text-muted-foreground mt-1 text-lg">Gestiona tus clases y descubre nuevos horarios.</p>
          </div>
          
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-white rounded-2xl gap-2 h-14 px-8 shadow-xl shadow-accent/20 hover:scale-105 transition-all font-black">
                <Plus className="w-5 h-5" /> Nueva Reserva
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-md border-none p-0 shadow-2xl overflow-hidden">
              <div className="bg-primary/10 p-8 border-b">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-secondary-foreground">Agendar Sesión 🎵</DialogTitle>
                  <DialogDescription className="text-base text-secondary-foreground/70 font-medium">
                    {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" /> Horarios Libres
                  </Label>
                  
                  {freeSlots.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2">
                      {freeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedSlotId === slot.id ? "default" : "outline"}
                          className={cn(
                            "justify-between rounded-2xl h-12 transition-all border-2 font-bold px-4",
                            selectedSlotId === slot.id 
                              ? 'bg-accent text-white border-accent shadow-md' 
                              : 'border-primary/5 hover:border-accent/30 hover:bg-accent/5'
                          )}
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          <span className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            {slot.time}
                          </span>
                          {selectedSlotId === slot.id && <CheckCircle2 className="w-4 h-4" />}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/20 p-8 rounded-3xl text-center border-2 border-dashed border-primary/10">
                      <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm font-bold text-muted-foreground">Sin cupos libres</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-gray-50 flex gap-3 border-t">
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
          {/* Calendario Lateral - Siempre Visible */}
          <div className="lg:col-span-4 space-y-6 sticky top-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                className="w-full"
              />
            </Card>
            
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-primary/5 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Leyenda</h4>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-accent shadow-sm" />
                <span className="text-xs font-bold text-secondary-foreground">Tus Clases Confirmadas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm" />
                <span className="text-xs font-bold text-secondary-foreground">Espacios Disponibles</span>
              </div>
            </div>
          </div>

          {/* Lista de Horarios */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl border border-primary/10">
              <div className="bg-accent/10 p-3 rounded-2xl">
                <CalendarIcon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-black text-secondary-foreground capitalize leading-tight">
                  {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Resumen del día</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {allDaySlots.some(s => s.isBooked || s.isAvailable) ? (
                allDaySlots.map((slot, i) => {
                  if (!slot.isBooked && !slot.isAvailable) return null;
                  
                  const isMine = slot.bookedBy === user?.name;
                  
                  return (
                    <Card key={slot.id} className={cn(
                      "rounded-[2rem] border-2 transition-all duration-300 group",
                      isMine 
                        ? 'bg-accent/5 border-accent shadow-lg shadow-accent/5' 
                        : slot.isBooked 
                          ? 'bg-gray-50 border-transparent opacity-60' 
                          : 'bg-white border-green-100 hover:border-green-300'
                    )}>
                      <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-5">
                        {/* Tiempo - Más compacto */}
                        <div className={cn(
                          "flex flex-col items-center justify-center min-w-[90px] h-20 rounded-2xl",
                          isMine ? "bg-accent text-white" : "bg-primary/10 text-secondary-foreground"
                        )}>
                          <span className="text-xs font-black uppercase opacity-60">Hora</span>
                          <span className="text-lg font-black leading-none">{slot.time.split(' ')[0]}</span>
                        </div>
                        
                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            <h4 className={cn(
                              "text-xl font-black tracking-tight",
                              isMine ? "text-accent" : "text-secondary-foreground"
                            )}>
                              {isMine ? '🌟 Tu Clase Confirmada' : slot.isBooked ? 'Sesión Reservada' : 'Clase de Guitarra'}
                            </h4>
                            {isMine && <Badge className="bg-green-500 text-white font-black text-[10px] rounded-full">CONFIRMADA</Badge>}
                          </div>
                          
                          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Music className="w-3.5 h-3.5 text-accent" /> Prof. Carlos</span>
                            <span className="flex items-center gap-1.5">
                              {i % 2 === 0 ? <Video className="w-3.5 h-3.5 text-blue-500" /> : <MapPin className="w-3.5 h-3.5 text-red-500" />}
                              {i % 2 === 0 ? 'Online' : 'Estudio'}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isMine ? (
                            <div className="bg-accent/10 p-3 rounded-full text-accent">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                          ) : slot.isAvailable && !slot.isBooked ? (
                            <Button 
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white rounded-xl font-black px-6 h-10 shadow-lg shadow-green-100"
                              onClick={() => {
                                setSelectedSlotId(slot.id);
                                setIsBookingOpen(true);
                              }}
                            >
                              Reservar <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-dashed border-gray-300 bg-gray-100/50 px-4 py-1.5 rounded-xl font-bold">Ocupado</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-primary/5 space-y-4">
                  <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10 text-primary/20" />
                  </div>
                  <p className="text-xl font-black text-secondary-foreground">Día sin disponibilidad</p>
                  <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">El profesor no ha habilitado horarios todavía. ¡Prueba otra fecha!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
