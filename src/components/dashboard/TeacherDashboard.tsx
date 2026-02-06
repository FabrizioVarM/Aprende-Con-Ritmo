
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
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from '@/components/ui/calendar';
import { useBookingStore, TimeSlot } from '@/lib/booking-store';
import { Clock, Calendar as CalendarIcon, User, Plus, Trash2, Save, GraduationCap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TeacherDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayStr, setTodayStr] = useState<string>('');
  const { toast } = useToast();
  const { availabilities, getDayAvailability, updateAvailability } = useBookingStore();

  const teacherId = '2'; 
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    setTodayStr(new Date().toDateString());
  }, []);

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
      description: `Horarios para el día ${selectedDate.toLocaleDateString('es-ES')} actualizados.`,
    });
    setIsOpen(false);
  };

  const currentDayBookedSlots = useMemo(() => {
    const data = getDayAvailability(teacherId, selectedDate);
    return data.slots.filter(s => s.isBooked);
  }, [selectedDate, getDayAvailability, teacherId, availabilities]);

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [selectedDate]);

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
          <DialogContent className="rounded-[2.5rem] max-w-5xl border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-primary/10 p-8 border-b">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-secondary-foreground flex items-center gap-3">
                  <CalendarIcon className="w-8 h-8 text-accent" />
                  Configurar Agenda
                </DialogTitle>
                <DialogDescription className="text-lg text-secondary-foreground/70 font-medium">
                  Elige el día y define tus bloques horarios.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-8 space-y-8 bg-white">
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">1. Día de la Semana Actual</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((d, i) => {
                      const isSelected = d.toDateString() === selectedDate.toDateString();
                      const isToday = d.toDateString() === todayStr;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(d)}
                          className={cn(
                            "flex flex-col items-center py-4 rounded-xl transition-all border-2 relative",
                            isSelected 
                              ? "bg-accent border-accent text-white shadow-lg" 
                              : "bg-primary/5 border-transparent hover:border-accent/20",
                            isToday && !isSelected && "border-accent/30"
                          )}
                        >
                          <span className="text-[10px] font-black uppercase">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                          <span className="text-xl font-black">{d.getDate()}</span>
                          {isToday && (
                            <span className={cn(
                              "text-[8px] font-black uppercase",
                              isSelected ? "text-white/80" : "text-accent"
                            )}>
                              HOY
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs font-bold text-muted-foreground italic text-center">También puedes usar el calendario completo si prefieres otras fechas.</p>
                    <div className="flex justify-center mt-2">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        className="scale-90"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex-[1.5] space-y-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">2. Bloques del Día</Label>
                    <Button size="sm" variant="outline" onClick={addSlot} className="rounded-full border-accent text-accent font-black gap-2">
                      <Plus className="w-4 h-4" /> Nuevo Rango
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {localSlots.length > 0 ? (
                      localSlots.map((slot, i) => (
                        <div key={slot.id} className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                          slot.isBooked ? "bg-orange-50 border-orange-200" : 
                          slot.isAvailable ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100 opacity-60"
                        )}>
                          <div className="flex-1 relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={slot.time}
                              onChange={(e) => updateSlotTime(i, e.target.value)}
                              disabled={slot.isBooked}
                              className="h-12 pl-10 text-base rounded-xl font-bold bg-white"
                            />
                            {slot.isBooked && <span className="text-[10px] font-black text-orange-600 uppercase ml-2 mt-1 block">Reservado por {slot.bookedBy}</span>}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Checkbox 
                              checked={slot.isAvailable || slot.isBooked} 
                              disabled={slot.isBooked}
                              onCheckedChange={() => toggleSlotAvailability(i)}
                              className="h-6 w-6 rounded-lg"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeSlot(i)} disabled={slot.isBooked} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-muted/5 rounded-[2rem] border-2 border-dashed">
                        <p className="font-bold text-muted-foreground">Día sin horarios definidos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t flex gap-6">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-2xl flex-1 h-14 font-black">
                Cancelar
              </Button>
              <Button onClick={handleSaveAvailability} className="bg-accent text-white rounded-2xl flex-1 h-14 font-black gap-2 shadow-xl">
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
