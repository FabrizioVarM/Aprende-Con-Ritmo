
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from '@/components/ui/calendar';
import { useBookingStore, TimeSlot } from '@/lib/booking-store';
import { Clock, Calendar as CalendarIcon, User, Plus, Trash2, Save, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function TeacherDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  const { availabilities, getDayAvailability, updateAvailability } = useBookingStore();

  const teacherId = '2'; // ID del Prof. Carlos
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const data = getDayAvailability(teacherId, selectedDate);
    setLocalSlots(JSON.parse(JSON.stringify(data.slots)));
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
      isBooked: false
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

  const handleSaveAvailability = () => {
    updateAvailability(teacherId, selectedDate, localSlots);
    toast({
      title: "Disponibilidad Guardada ✅",
      description: `Horarios para el día ${selectedDate.toLocaleDateString('es-ES')} actualizados con éxito.`,
    });
    setIsOpen(false);
  };

  const currentDayBookedSlots = useMemo(() => {
    const data = getDayAvailability(teacherId, selectedDate);
    return data.slots.filter(s => s.isBooked);
  }, [selectedDate, getDayAvailability, teacherId, availabilities]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground font-headline tracking-tight">Panel del Prof. Carlos 🎻</h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Gestiona tu agenda y el progreso de tus alumnos.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-white rounded-2xl gap-2 h-14 px-8 shadow-xl shadow-accent/20 hover:scale-105 transition-all">
              <Clock className="w-5 h-5" /> Gestionar Horarios
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
            <div className="bg-primary/10 p-8 border-b">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-secondary-foreground flex items-center gap-3">
                  <CalendarIcon className="w-8 h-8 text-accent" />
                  Configuración de Agenda Diaria
                </DialogTitle>
                <DialogDescription className="text-lg text-secondary-foreground/70 font-medium">
                  Selecciona una fecha y define tus bloques de clase personalizados.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">1. Elige Fecha</Label>
                    <Badge variant="secondary" className="bg-accent text-white px-4 py-1.5 rounded-full font-bold">
                      {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Badge>
                  </div>
                  <div className="border border-primary/10 rounded-[2.5rem] p-4 bg-primary/5 shadow-inner flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="flex-[1.5] space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">2. Configura los Bloques</Label>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={addSlot}
                      className="rounded-full border-accent text-accent hover:bg-accent hover:text-white gap-2 font-black px-6 h-10 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Nuevo Rango
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto pr-4 pb-4">
                    {localSlots.length > 0 ? (
                      localSlots.map((slot, i) => (
                        <div 
                          key={slot.id} 
                          className={`flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all ${
                            slot.isBooked ? 'bg-orange-50 border-orange-200' : 
                            slot.isAvailable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 opacity-60'
                          }`}
                        >
                          <div className="flex-1 space-y-2">
                            <div className="relative">
                              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                value={slot.time}
                                onChange={(e) => updateSlotTime(i, e.target.value)}
                                disabled={slot.isBooked}
                                placeholder="Ej: 08:00 - 09:00"
                                className="h-14 pl-12 text-lg rounded-2xl font-bold bg-white border-primary/10 focus:ring-accent"
                              />
                            </div>
                            {slot.isBooked && (
                              <div className="flex items-center gap-1.5 text-sm text-orange-600 font-black uppercase tracking-widest ml-1">
                                <CheckCircle2 className="w-4 h-4" /> Reservado por {slot.bookedBy}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">¿Habilitar?</span>
                              <Checkbox 
                                checked={slot.isAvailable || slot.isBooked} 
                                disabled={slot.isBooked}
                                onCheckedChange={() => toggleSlotAvailability(i)}
                                className="h-8 w-8 rounded-xl data-[state=checked]:bg-green-600 border-2"
                              />
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeSlot(i)}
                              disabled={slot.isBooked}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-12 w-12 rounded-2xl transition-colors"
                            >
                              <Trash2 className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-muted/5 rounded-[3rem] border-4 border-dashed border-primary/10">
                        <Plus className="w-12 h-12 mx-auto text-primary/20 mb-4" />
                        <p className="text-xl font-bold text-muted-foreground">Sin horarios para este día.</p>
                        <p className="text-sm text-muted-foreground mt-2">Usa el botón para crear tus primeros espacios de clase.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t flex gap-6">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-2xl flex-1 h-14 border-primary/20 font-black text-lg">
                Cancelar
              </Button>
              <Button onClick={handleSaveAvailability} className="bg-accent text-white rounded-2xl flex-1 h-14 font-black text-lg gap-2 shadow-xl shadow-accent/20 hover:scale-[1.02] transition-transform">
                <Save className="w-6 h-6" /> Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] border-none shadow-sm bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-blue-900">24</div>
            <p className="text-xs text-blue-500 font-bold mt-1">+2 este mes</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2rem] border-none shadow-sm bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-green-600">Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-green-900">94%</div>
            <p className="text-xs text-green-500 font-bold mt-1">Excelente ritmo</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-accent">Materiales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-accent-foreground">12</div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-secondary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-secondary-foreground">Horas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-secondary-foreground">120</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 p-6 border-b">
            <CardTitle className="flex items-center gap-2 font-black">
              <GraduationCap className="w-6 h-6 text-accent" />
              Seguimiento de Alumnos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {[
              { name: 'Ana García', level: 'Guitarra 2', progress: 85 },
              { name: 'Liam Smith', level: 'Piano 1', progress: 45 },
              { name: 'Emma Wilson', level: 'Violín 3', progress: 72 },
            ].map((student, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-black text-lg">{student.name}</span>
                  <span className="text-sm font-black text-muted-foreground">{student.level} • {student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-3 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-accent/5 p-6 border-b">
            <CardTitle className="text-lg flex items-center gap-2 font-black">
              <CheckCircle2 className="w-6 h-6 text-accent" />
              Sesiones de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentDayBookedSlots.length > 0 ? (
              currentDayBookedSlots.map((cls, i) => (
                <div key={i} className="flex items-center justify-between p-6 border-b last:border-0 hover:bg-accent/5 transition-colors">
                  <div>
                    <div className="font-black text-lg leading-tight">{cls.time}</div>
                    <div className="text-sm text-muted-foreground font-bold">{cls.bookedBy}</div>
                  </div>
                  <Button size="sm" className="bg-accent text-white rounded-xl font-black px-5">Iniciar</Button>
                </div>
              ))
            ) : (
              <div className="p-16 text-center text-muted-foreground italic font-medium">
                <p>No hay clases reservadas para la fecha seleccionada.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
