
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

  // Sincronizar slots locales cuando cambia la fecha seleccionada o se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      const data = getDayAvailability(teacherId, selectedDate);
      setLocalSlots(JSON.parse(JSON.stringify(data.slots))); // Copia profunda para edición local
    }
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
      id: Math.random().toString(36).substr(2, 9),
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
    // Opcionalmente no cerrar para permitir configurar varios días seguidos
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
          <DialogContent className="rounded-3xl max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
            <div className="bg-primary/10 p-6 border-b">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-secondary-foreground flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-accent" />
                  Configuración de Agenda Diaria
                </DialogTitle>
                <DialogDescription className="text-base">
                  Selecciona un día en el calendario y personaliza tus horas de clase disponibles.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-4">
                  <Label className="font-black text-sm uppercase tracking-widest text-muted-foreground">1. Selecciona el Día</Label>
                  <Card className="rounded-2xl border-primary/20 shadow-sm overflow-hidden bg-white">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="w-full"
                    />
                  </Card>
                  <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10">
                    <p className="text-sm font-bold text-accent">Día seleccionado:</p>
                    <p className="text-lg font-black capitalize">{selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="font-black text-sm uppercase tracking-widest text-muted-foreground">2. Define tus Horas</Label>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={addSlot}
                      className="rounded-full border-accent text-accent hover:bg-accent hover:text-white gap-1 font-bold"
                    >
                      <Plus className="w-4 h-4" /> Nuevo Rango
                    </Button>
                  </div>
                  
                  <div className="space-y-3 pr-2">
                    {localSlots.length > 0 ? (
                      localSlots.map((slot, i) => (
                        <div 
                          key={slot.id} 
                          className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                            slot.isBooked ? 'bg-orange-50 border-orange-200' : 
                            slot.isAvailable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 opacity-60'
                          }`}
                        >
                          <div className="flex-1 space-y-1">
                            <Input
                              value={slot.time}
                              onChange={(e) => updateSlotTime(i, e.target.value)}
                              disabled={slot.isBooked}
                              placeholder="Ej: 08:00 - 09:00"
                              className="h-10 text-base rounded-xl border-none bg-white/50 focus:bg-white font-bold shadow-sm"
                            />
                            {slot.isBooked && (
                              <div className="flex items-center gap-1.5 px-1">
                                <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-xs text-orange-700 font-black uppercase tracking-tighter">
                                  Reservado por {slot.bookedBy}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black uppercase mb-1 text-muted-foreground">Visible</span>
                              <Checkbox 
                                checked={slot.isAvailable || slot.isBooked} 
                                disabled={slot.isBooked}
                                onCheckedChange={() => toggleSlotAvailability(i)}
                                className="h-6 w-6 rounded-lg border-2"
                              />
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeSlot(i)}
                              disabled={slot.isBooked}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 bg-muted/5 rounded-3xl border-2 border-dashed border-muted/30">
                        <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-20" />
                        <p className="text-muted-foreground font-bold italic">No has configurado horarios para este día.</p>
                        <Button variant="link" onClick={addSlot} className="text-accent font-black mt-2 underline decoration-2">
                          Crear el primer rango ahora
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-2xl flex-1 h-12 border-primary font-black text-secondary-foreground">
                Cerrar Editor
              </Button>
              <Button onClick={handleSaveAvailability} className="bg-accent text-white rounded-2xl flex-1 h-12 font-black gap-2 shadow-lg shadow-accent/20">
                <Save className="w-5 h-5" /> Guardar Cambios del Día
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-blue-50/50 border border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-blue-900">24</div>
            <p className="text-xs text-blue-500 font-bold mt-1">+2 este mes</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-none shadow-sm bg-green-50/50 border border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-green-600">Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-green-900">94%</div>
            <p className="text-xs text-green-500 font-bold mt-1">Excelente ritmo</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-accent/5 border border-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-accent">Materiales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-accent-foreground">12</div>
            <p className="text-xs text-accent font-bold mt-1">Última semana</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-secondary/20 border border-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-secondary-foreground">Horas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-secondary-foreground">120</div>
            <p className="text-xs text-secondary-foreground/60 font-bold mt-1">Este semestre</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between bg-primary/5 p-6 border-b">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-accent" />
              Seguimiento de Alumnos
            </CardTitle>
            <Button variant="ghost" size="sm" className="rounded-xl text-accent font-black">Ver todos</Button>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
              { name: 'Ana García', level: 'Guitarra 2', progress: 85 },
              { name: 'Liam Smith', level: 'Piano 1', progress: 45 },
              { name: 'Emma Wilson', level: 'Violín 3', progress: 72 },
              { name: 'Sophia Chen', level: 'Guitarra 1', progress: 20 },
            ].map((student, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-secondary-foreground">{student.name}</span>
                  <span className="text-sm font-bold text-muted-foreground">{student.level} • {student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-3 rounded-full bg-secondary/30" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-accent/5 p-6 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Sesiones Hoy
            </CardTitle>
            <Badge variant="outline" className="rounded-full border-accent text-accent font-black">
              {currentDayBookedSlots.length}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {currentDayBookedSlots.length > 0 ? (
              currentDayBookedSlots.map((cls, i) => (
                <div key={i} className="flex items-center justify-between p-5 border-b last:border-0 hover:bg-accent/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm border group-hover:border-accent/50 transition-all">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-black text-base text-secondary-foreground">{cls.time}</div>
                      <div className="text-sm text-muted-foreground font-bold flex items-center gap-1">
                        <User className="w-3 h-3" /> {cls.bookedBy}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-accent text-white rounded-xl font-bold hover:scale-105 transition-transform">
                    Iniciar
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground italic space-y-3">
                <CalendarIcon className="w-10 h-10 mx-auto opacity-10" />
                <p className="font-medium">No hay clases reservadas para hoy.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: any, className?: string }) {
  return <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</div>;
}
