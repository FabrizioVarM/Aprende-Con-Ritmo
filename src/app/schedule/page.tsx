
"use client"

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Video, MapPin, Plus, Users, Music, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export default function SchedulePage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const { toast } = useToast();
  const { getDayAvailability, bookSlot } = useBookingStore();

  const teacherId = '2'; // Simulamos que reserva con el Prof. Carlos
  const availability = getDayAvailability(teacherId, date);
  const freeSlots = availability.slots.filter(s => s.isAvailable && !s.isBooked);
  const allDaySlots = availability.slots;

  const handleBook = () => {
    if (!selectedSlotId || !date || !user) return;

    bookSlot(teacherId, date, selectedSlotId, user.name);
    
    toast({
      title: "¡Reserva Exitosa! 🎸",
      description: "Tu clase ha sido agendada. ¡Prepárate para rockear!",
    });
    
    setIsBookingOpen(false);
    setSelectedSlotId(null);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground font-headline">Horario Musical 📅</h1>
            <p className="text-muted-foreground mt-1 text-lg">Explora la disponibilidad y asegura tu próxima lección.</p>
          </div>
          
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-white rounded-2xl gap-2 h-14 px-8 shadow-xl shadow-accent/20 hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" /> Reservar Clase
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md border-none p-0 shadow-2xl overflow-hidden">
              <div className="bg-primary/20 p-6 border-b">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-secondary-foreground">Agenda tu Sesión 🎵</DialogTitle>
                  <DialogDescription className="text-base text-secondary-foreground/70">
                    Viendo espacios para el <span className="font-black underline">{date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>.
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" /> Horarios Libres con Prof. Carlos
                  </Label>
                  
                  {freeSlots.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
                      {freeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedSlotId === slot.id ? "default" : "outline"}
                          className={`justify-start rounded-2xl h-14 transition-all border-2 text-lg font-bold ${
                            selectedSlotId === slot.id 
                              ? 'bg-accent text-white border-accent shadow-md scale-[1.02]' 
                              : 'border-primary/10 hover:border-accent/50 hover:bg-accent/5'
                          }`}
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          <Music className={`w-5 h-5 mr-3 ${selectedSlotId === slot.id ? 'text-white' : 'text-accent'}`} />
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-10 rounded-3xl text-center space-y-3 border-2 border-dashed border-primary/10">
                      <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground opacity-30" />
                      <div>
                        <p className="text-base font-bold text-muted-foreground">Sin disponibilidad</p>
                        <p className="text-xs text-muted-foreground">Intenta seleccionando otra fecha en el calendario.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex gap-3">
                <Button variant="outline" onClick={() => setIsBookingOpen(false)} className="rounded-2xl flex-1 h-12 border-primary font-black">Cancelar</Button>
                <Button 
                  onClick={handleBook} 
                  disabled={!selectedSlotId}
                  className="bg-accent text-white rounded-2xl flex-1 h-12 font-black shadow-lg shadow-accent/20 disabled:opacity-30"
                >
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Calendario Interactivo</h3>
            <Card className="rounded-3xl border-none shadow-lg overflow-hidden bg-white p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                className="w-full flex justify-center"
              />
            </Card>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-sm font-bold">Horarios Ocupados</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-sm font-bold">Horarios Disponibles</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-accent w-2 h-10 rounded-full shadow-sm shadow-accent/50" />
              <div>
                <h3 className="text-2xl font-black text-secondary-foreground capitalize">
                  {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Resumen de la Agenda</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {allDaySlots.some(s => s.isBooked || s.isAvailable) ? (
                allDaySlots.map((slot, i) => {
                  if (!slot.isBooked && !slot.isAvailable) return null;
                  
                  return (
                    <Card key={slot.id} className={`rounded-3xl border-none shadow-sm transition-all duration-300 group hover:shadow-md ${
                      slot.isBooked 
                        ? 'bg-white border-l-[6px] border-l-accent' 
                        : 'bg-white border-l-[6px] border-l-green-400'
                    }`}>
                      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                        <div className={`p-4 rounded-2xl text-center min-w-[110px] shadow-inner transition-colors ${
                          slot.isBooked ? 'bg-accent/5 text-accent' : 'bg-green-50 text-green-700'
                        }`}>
                          <Clock className="w-6 h-6 mx-auto mb-1 opacity-70" />
                          <span className="font-black text-xl block leading-none">{slot.time.split(' ')[0]}</span>
                          <span className="text-[10px] block font-black uppercase mt-1 tracking-tighter">
                            {slot.isBooked ? 'No Disponible' : '¡Reserva Ya!'}
                          </span>
                        </div>
                        
                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <h4 className="text-2xl font-black text-secondary-foreground tracking-tight">
                            {slot.isBooked ? (slot.bookedBy === user?.name ? 'Tu Clase Programada' : 'Sesión Reservada') : 'Espacio Abierto'}
                          </h4>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-5 text-sm font-bold text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-accent" /> Prof. Carlos</span>
                            <span className="flex items-center gap-1.5"><Music className="w-4 h-4 text-accent" /> Guitarra Eléctrica</span>
                            <span className="flex items-center gap-1.5">
                              {i % 2 === 0 ? <Video className="w-4 h-4 text-blue-400" /> : <MapPin className="w-4 h-4 text-red-400" />}
                              {i % 2 === 0 ? 'En línea' : 'Presencial'}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {slot.isBooked && slot.bookedBy === user?.name ? (
                            <Badge className="bg-green-500 text-white px-6 py-2.5 rounded-2xl text-sm font-black shadow-md shadow-green-200">Confirmado</Badge>
                          ) : slot.isAvailable && !slot.isBooked ? (
                            <Button 
                              className="bg-accent text-white rounded-2xl h-12 px-8 font-black shadow-lg shadow-accent/10 hover:scale-105 transition-transform"
                              onClick={() => {
                                setSelectedSlotId(slot.id);
                                setIsBookingOpen(true);
                              }}
                            >
                              Reservar
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-gray-200 bg-gray-50 px-5 py-2 rounded-2xl font-bold opacity-60">Ocupado</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="p-20 text-center bg-white rounded-[40px] border-4 border-dashed border-primary/5 space-y-6">
                  <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CalendarIcon className="w-12 h-12 text-primary/20" />
                  </div>
                  <div className="max-w-xs mx-auto">
                    <p className="text-2xl font-black text-secondary-foreground">Sin disponibilidad</p>
                    <p className="text-muted-foreground font-medium mt-2">El profesor aún no ha habilitado horarios para esta fecha. ¡Consulta otros días!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
