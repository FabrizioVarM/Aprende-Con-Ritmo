
"use client"

import { useState } from 'react';
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
import { useToast } from "@/hooks/use-toast"
import { Calendar } from '@/components/ui/calendar';
import { useBookingStore, STANDARD_SLOTS, TimeSlot } from '@/lib/booking-store';
import { Clock, Calendar as CalendarIcon, User } from 'lucide-react';

export default function TeacherDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const { getDayAvailability, updateAvailability } = useBookingStore();

  const teacherId = '2'; // ID del Prof. Carlos
  const currentAvail = selectedDate ? getDayAvailability(teacherId, selectedDate) : null;
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>([]);

  // Sincronizar slots locales cuando se abre el diálogo o cambia la fecha
  const handleOpenDialog = () => {
    if (currentAvail) {
      setLocalSlots(currentAvail.slots);
    }
    setIsOpen(true);
  };

  const toggleSlot = (slotIndex: number) => {
    const newSlots = [...localSlots];
    newSlots[slotIndex].isAvailable = !newSlots[slotIndex].isAvailable;
    setLocalSlots(newSlots);
  };

  const handleSaveAvailability = () => {
    if (selectedDate) {
      updateAvailability(teacherId, selectedDate, localSlots);
      toast({
        title: "Disponibilidad Actualizada ✅",
        description: `Horarios guardados para el ${selectedDate.toLocaleDateString('es-ES')}.`,
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
            <Button onClick={handleOpenDialog} className="bg-accent text-white rounded-xl gap-2 h-12 shadow-lg shadow-accent/20">
              <Clock className="w-5 h-5" /> Configurar Disponibilidad
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Gestionar Horarios 🕒</DialogTitle>
              <DialogDescription>
                Define qué horas estarás disponible para el día seleccionado.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <Label className="font-bold">1. Selecciona el Día</Label>
                <div className="border rounded-2xl p-2 bg-muted/20">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        setLocalSlots(getDayAvailability(teacherId, date).slots);
                      }
                    }}
                    className="w-full flex justify-center"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="font-bold">2. Marca Horas Libres</Label>
                <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[300px] pr-2">
                  {localSlots.map((slot, i) => (
                    <div 
                      key={slot.time} 
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                        slot.isBooked ? 'bg-orange-50 border-orange-200' : 
                        slot.isAvailable ? 'bg-green-50 border-green-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{slot.time}</span>
                        {slot.isBooked && (
                          <span className="text-[10px] text-orange-600 font-medium">Ocupado por {slot.bookedBy}</span>
                        )}
                      </div>
                      <Checkbox 
                        id={`slot-${i}`} 
                        checked={slot.isAvailable || slot.isBooked} 
                        disabled={slot.isBooked}
                        onCheckedChange={() => toggleSlot(i)}
                        className="rounded-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl flex-1 border-primary">Cerrar</Button>
              <Button onClick={handleSaveAvailability} className="bg-accent text-white rounded-xl flex-1">Guardar Disponibilidad</Button>
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
            <CardTitle>Seguimiento de Progreso</CardTitle>
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
