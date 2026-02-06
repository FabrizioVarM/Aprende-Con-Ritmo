
"use client"

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Video, MapPin, Plus, Users, Music, AlertCircle } from 'lucide-react';
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
import { useBookingStore, DayAvailability } from '@/lib/booking-store';
import { Badge } from '@/components/ui/badge';

export default function SchedulePage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const { toast } = useToast();
  const { getDayAvailability, bookSlot } = useBookingStore();

  const teacherId = '2'; // Simulamos que reserva con el Prof. Carlos
  const availability = date ? getDayAvailability(teacherId, date) : null;
  const freeSlots = availability?.slots.filter(s => s.isAvailable && !s.isBooked) || [];
  const bookedSlots = availability?.slots.filter(s => s.isBooked) || [];

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
            <p className="text-muted-foreground mt-1 text-lg">Busca espacios libres y agenda tus lecciones.</p>
          </div>
          
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-white rounded-xl gap-2 h-12 px-6 shadow-lg shadow-accent/20">
                <Plus className="w-5 h-5" /> Reservar Nueva Clase
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Reserva tu Clase 🎵</DialogTitle>
                <DialogDescription>
                  Viendo disponibilidad para el {date?.toLocaleDateString('es-ES', { dateStyle: 'long' })}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-6">
                <div className="space-y-3">
                  <Label className="font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" /> Horas Disponibles
                  </Label>
                  
                  {freeSlots.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {freeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedSlotId === slot.id ? "default" : "outline"}
                          className={`justify-start rounded-xl h-12 transition-all ${
                            selectedSlotId === slot.id ? 'bg-accent text-white border-accent' : 'border-primary/30 hover:bg-primary/10'
                          }`}
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          <Music className={`w-4 h-4 mr-3 ${selectedSlotId === slot.id ? 'text-white' : 'text-accent'}`} />
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-6 rounded-2xl text-center space-y-2 border border-dashed border-primary/20">
                      <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">No hay espacios disponibles para este día. ¡Intenta con otra fecha!</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsBookingOpen(false)} className="rounded-xl flex-1 border-primary">Cancelar</Button>
                <Button 
                  onClick={handleBook} 
                  disabled={!selectedSlotId}
                  className="bg-accent text-white rounded-xl flex-1 disabled:opacity-50"
                >
                  Confirmar Reserva
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="rounded-3xl border-none shadow-md overflow-hidden bg-white">
            <CardHeader className="bg-primary/20">
              <CardTitle className="text-lg">Explora el Calendario</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full flex justify-center"
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              Sesiones del {date?.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            
            <div className="space-y-4">
              {availability?.slots.some(s => s.isBooked || s.isAvailable) ? (
                availability.slots.map((slot, i) => {
                  if (!slot.isBooked && !slot.isAvailable) return null;
                  
                  return (
                    <Card key={i} className={`rounded-3xl border-none shadow-sm transition-all group ${slot.isBooked ? 'bg-white opacity-100 border-l-4 border-l-accent' : 'bg-white/50 border-l-4 border-l-green-400'}`}>
                      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                        <div className={`p-4 rounded-2xl text-center min-w-[100px] ${slot.isBooked ? 'bg-accent/10 text-accent' : 'bg-green-100 text-green-700'}`}>
                          <Clock className="w-6 h-6 mx-auto mb-1" />
                          <span className="font-bold text-lg">{slot.time.split(' ')[0]}</span>
                          <span className="text-[10px] block font-black uppercase">{slot.isBooked ? 'Ocupado' : 'Libre'}</span>
                        </div>
                        
                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <h4 className="text-xl font-black">{slot.isBooked ? `Clase con ${slot.bookedBy}` : 'Espacio Disponible'}</h4>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium"><Users className="w-4 h-4" /> Prof. Carlos</span>
                            <span className="flex items-center gap-1"><Music className="w-4 h-4" /> Guitarra Eléctrica</span>
                            <span className="flex items-center gap-1">
                              {i % 2 === 0 ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                              {i % 2 === 0 ? 'En línea' : 'Presencial'}
                            </span>
                          </div>
                        </div>

                        {slot.isBooked && slot.bookedBy === user?.name ? (
                          <Badge className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-xl">Tu Clase</Badge>
                        ) : slot.isAvailable && !slot.isBooked ? (
                          <Button 
                            className="bg-accent text-white rounded-xl shadow-sm"
                            onClick={() => {
                              setSelectedSlotId(slot.id);
                              setIsBookingOpen(true);
                            }}
                          >
                            Reservar
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-muted">No Disponible</Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-primary/20 space-y-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-8 h-8 text-primary/40" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">Día sin disponibilidad definida</p>
                    <p className="text-muted-foreground">El profesor aún no ha configurado sus horas para esta fecha.</p>
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

function Label({ className, children }: { className?: string, children: React.ReactNode }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>;
}
