
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  const { getDayAvailability, updateAvailability } = useBookingStore();

  const teacherId = '2'; // ID del Prof. Carlos
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const data = getDayAvailability(teacherId, selectedDate);
    setLocalSlots(JSON.parse(JSON.stringify(data.slots)));
  }, [selectedDate, isOpen]);

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
      description: `Horarios para el día ${selectedDate.toLocaleDateString('es-ES')} actualizados.`,
    });
  };

  const currentDayBookedSlots = useMemo(() => {
    return getDayAvailability(teacherId, selectedDate).slots.filter(s => s.isBooked);
  }, [selectedDate, isOpen, getDayAvailability]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline">Panel del Prof. Carlos 🎻</h1>
          <p className="text-muted-foreground mt-1 text-lg">Gestiona tu disponibilidad y sigue a tus alumnos.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-white rounded-2xl gap-2 h-14 px-8 shadow-lg shadow-accent/20 hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" /> Gestionar Horarios
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
            <div className="bg-primary/10 p-6 border-b">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-secondary-foreground flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-accent" />
                  Configuración de Agenda Diaria
                </DialogTitle>
                <DialogDescription className="text-base text-secondary-foreground/70">
                  Selecciona un día y personaliza tus horas de clase disponibles de forma independiente.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">1. Selecciona Fecha</Label>
                    <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20 px-3 py-1 font-bold">
                      {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Badge>
                  </div>
                  <div className="border border-primary/20 rounded-[2rem] p-6 bg-white shadow-inner flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="w-full max-w-sm"
                    />
                  </div>
                </div>
                
                <div className="flex-[1.5] space-y-6">
                  <div className="flex justify-between items-center">
                    <Label className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">2. Configura Rangos Horarios</Label>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={addSlot}
                      className="rounded-full border-accent text-accent hover:bg-accent hover:text-white gap-2 font-black px-4"
                    >
                      <Plus className="w-4 h-4" /> Agregar Horario
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {localSlots.length > 0 ? (
                      localSlots.map((slot, i) => (
                        <div 
                          key={slot.id} 
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group ${
                            slot.isBooked ? 'bg-orange-50 border-orange-200 shadow-sm' : 
                            slot.isAvailable ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-100 opacity-70'
                          }`}
                        >
                          <div className="flex-1 space-y-2">
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                value={slot.time}
                                onChange={(e) => updateSlotTime(i, e.target.value)}
                                disabled={slot.isBooked}
                                placeholder="Ej: 08:00 - 09:00"
                                className="h-12 pl-10 text-base rounded-xl font-bold bg-white border-primary/10"
                              />
                            </div>
                            {slot.isBooked && (
                              <div className="flex items-center gap-1 text-[11px] text-orange-600 font-black uppercase tracking-widest ml-1">
                                <CheckCircle2 className="w-3 h-3" /> Reservado por {slot.bookedBy}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-black text-muted-foreground uppercase">Disponible</span>
                              <Checkbox 
                                checked={slot.isAvailable || slot.isBooked} 
                                disabled={slot.isBooked}
                                onCheckedChange={() => toggleSlotAvailability(i)}
                                className="h-6 w-6 rounded-lg data-[state=checked]:bg-green-600"
                              />
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeSlot(i)}
                              disabled={slot.isBooked}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-muted/5 rounded-[2.5rem] border-4 border-dashed border-primary/10">
                        <Plus className="w-10 h-10 mx-auto text-primary/20 mb-3" />
                        <p className="text-muted-foreground font-bold">Sin horarios definidos para hoy.</p>
                        <p className="text-xs text-muted-foreground mt-1">Haz clic en "Agregar Horario" para empezar.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t flex gap-4">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-2xl flex-1 h-14 border-primary/20 font-black text-lg">
                Cerrar
              </Button>
              <Button onClick={handleSaveAvailability} className="bg-accent text-white rounded-2xl flex-1 h-14 font-black text-lg gap-2 shadow-xl shadow-accent/20 hover:scale-[1.02] transition-transform">
                <Save className="w-6 h-6" /> Guardar Cambios Diarios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-blue-600">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-blue-900">24</div>
            <p className="text-xs text-blue-500 font-bold mt-1">+2 este mes</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-none shadow-sm bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-green-600">Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-green-900">94%</div>
            <p className="text-xs text-green-500 font-bold mt-1">Buen ritmo</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-accent">Materiales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-accent-foreground">12</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-secondary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-secondary-foreground">Horas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-secondary-foreground">120</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 p-6 border-b">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-accent" />
              Seguimiento de Alumnos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
              { name: 'Ana García', level: 'Guitarra 2', progress: 85 },
              { name: 'Liam Smith', level: 'Piano 1', progress: 45 },
              { name: 'Emma Wilson', level: 'Violín 3', progress: 72 },
            ].map((student, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{student.name}</span>
                  <span className="text-sm font-bold text-muted-foreground">{student.level} • {student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-2 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-accent/5 p-6 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Sesiones Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentDayBookedSlots.length > 0 ? (
              currentDayBookedSlots.map((cls, i) => (
                <div key={i} className="flex items-center justify-between p-5 border-b last:border-0 hover:bg-accent/5">
                  <div>
                    <div className="font-black text-base">{cls.time}</div>
                    <div className="text-sm text-muted-foreground font-bold">{cls.bookedBy}</div>
                  </div>
                  <Button size="sm" className="bg-accent text-white rounded-xl">Iniciar</Button>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground italic">
                <p>No hay clases reservadas para hoy.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
