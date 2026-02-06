"use client"

import { useState, useEffect } from 'react';
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
import { Clock, Calendar as CalendarIcon, User, Plus, Trash2, Save } from 'lucide-react';

export default function TeacherDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const { getDayAvailability, updateAvailability } = useBookingStore();

  const teacherId = '2'; // ID del Prof. Carlos
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>([]);

  // Sincronizar slots locales cuando se abre el diálogo o cambia la fecha
  useEffect(() => {
    if (selectedDate && isOpen) {
      setLocalSlots(getDayAvailability(teacherId, selectedDate).slots);
    }
  }, [selectedDate, isOpen]);

  const toggleSlot = (slotIndex: number) => {
    const newSlots = [...localSlots];
    newSlots[slotIndex].isAvailable = !newSlots[slotIndex].isAvailable;
    setLocalSlots(newSlots);
  };

  const updateSlotTime = (index: number, newTime: string) => {
    const newSlots = [...localSlots];
    newSlots[index].time = newTime;
    setLocalSlots(newSlots);
  };

  const addSlot = () => {
    const newSlot: TimeSlot = {
      id: Math.random().toString(36).substr(2, 9),
      time: "00:00 - 00:00",
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
    if (selectedDate) {
      updateAvailability(teacherId, selectedDate, localSlots);
      toast({
        title: "Disponibilidad Actualizada ✅",
        description: `Los horarios para el ${selectedDate.toLocaleDateString('es-ES')} han sido guardados correctamente.`,
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline">Panel del Prof. Carlos 🎻</h1>
          <p className="text-muted-foreground mt-1 text-lg">Gestiona tu disponibilidad y sigue a tus alumnos.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-white rounded-xl gap-2 h-12 shadow-lg shadow-accent/20">
              <Clock className="w-5 h-5" /> Gestionar Horarios
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Configuración de Horarios 🕒</DialogTitle>
              <DialogDescription>
                Añade, edita o elimina los rangos horarios disponibles para el día seleccionado.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                <div className="space-y-4">
                  <Label className="font-bold text-lg block">1. Selecciona el Día</Label>
                  <div className="border rounded-2xl p-4 bg-muted/20">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="w-full flex justify-center"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="font-bold text-lg">2. Define los Horarios</Label>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={addSlot}
                      className="rounded-full border-accent text-accent hover:bg-accent hover:text-white gap-1"
                    >
                      <Plus className="w-4 h-4" /> Nuevo Rango
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {localSlots.length > 0 ? (
                      localSlots.map((slot, i) => (
                        <div 
                          key={slot.id} 
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                            slot.isBooked ? 'bg-orange-50 border-orange-200 shadow-inner' : 
                            slot.isAvailable ? 'bg-green-50 border-green-200' : 'bg-white border-border'
                          }`}
                        >
                          <div className="flex-1 flex flex-col gap-1">
                            <Input
                              value={slot.time}
                              onChange={(e) => updateSlotTime(i, e.target.value)}
                              disabled={slot.isBooked}
                              placeholder="Ej: 08:00 - 09:00"
                              className="h-9 rounded-lg border-none bg-transparent font-bold focus-visible:ring-1 focus-visible:ring-accent/50"
                            />
                            {slot.isBooked && (
                              <span className="text-[10px] text-orange-600 font-bold px-1 flex items-center gap-1">
                                <User className="w-3 h-3" /> Ocupado por {slot.bookedBy}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] text-muted-foreground font-medium">Libre</span>
                              <Checkbox 
                                checked={slot.isAvailable || slot.isBooked} 
                                disabled={slot.isBooked}
                                onCheckedChange={() => toggleSlot(i)}
                                className="rounded-md h-5 w-5"
                              />
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeSlot(i)}
                              disabled={slot.isBooked}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                        <p className="text-muted-foreground text-sm italic">No hay horarios definidos para este día.</p>
                        <Button variant="link" onClick={addSlot} className="text-accent font-bold mt-2">
                          Crear el primer rango
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t mt-4 flex gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl flex-1 border-primary font-bold">
                Cancelar
              </Button>
              <Button onClick={handleSaveAvailability} className="bg-accent text-white rounded-xl flex-1 font-bold gap-2">
                <Save className="w-4 h-4" /> Guardar Todos los Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-600">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">24</div>
            <p className="text-xs text-blue-400">+2 este mes</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-none shadow-sm bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-green-600">Asistencia Prom.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">94%</div>
            <p className="text-xs text-green-400">Sobre el promedio</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-accent">Materiales Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">12</div>
            <p className="text-xs text-accent/70">Últimos 7 días</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-secondary-foreground">Horas Clase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">120</div>
            <p className="text-xs text-secondary-foreground/60">Este semestre</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Seguimiento de Alumnos</CardTitle>
            <Button variant="outline" size="sm" className="rounded-xl border-primary">Ver Todos</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: 'Ana García', level: 'Guitarra 2', progress: 85 },
              { name: 'Liam Smith', level: 'Piano 1', progress: 45 },
              { name: 'Emma Wilson', level: 'Violín 3', progress: 72 },
              { name: 'Sophia Chen', level: 'Guitarra 1', progress: 20 },
            ].map((student, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold">{student.name}</span>
                  <span className="text-muted-foreground">{student.level} - {student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="border-b bg-primary/10">
            <CardTitle className="text-lg">Próximas Sesiones Ocupadas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedDate && getDayAvailability(teacherId, selectedDate).slots.filter(s => s.isBooked).length > 0 ? (
              getDayAvailability(teacherId, selectedDate).slots.filter(s => s.isBooked).map((cls, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Clock className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{cls.time}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {cls.bookedBy}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-accent font-bold hover:bg-accent/10">
                    Iniciar
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground italic space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto opacity-20" />
                <p>No hay clases reservadas para este día.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
