
"use client"

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Video, MapPin, Plus, Users } from 'lucide-react';
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

export default function SchedulePage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleBook = () => {
    toast({
      title: "Reserva Exitosa 📅",
      description: "Tu clase ha sido agendada correctamente para el día seleccionado.",
    });
    setIsOpen(false);
  };

  const CLASSES = [
    { time: '09:00 AM', title: 'Ritmos Avanzados', teacher: 'Carlos V.', type: 'En línea', duration: '60 min' },
    { time: '11:30 AM', title: 'Teoría Musical 101', teacher: 'Elena S.', type: 'Presencial', duration: '45 min' },
    { time: '02:00 PM', title: 'Taller de Guitarra', teacher: 'Carlos V.', type: 'Presencial', duration: '90 min' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground font-headline">Horario de Clases 📅</h1>
            <p className="text-muted-foreground mt-1 text-lg">Gestiona tus sesiones y disponibilidad.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-white rounded-xl gap-2 h-12 px-6">
                <Plus className="w-5 h-5" /> Reservar Clase
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Nueva Reserva 🎵</DialogTitle>
                <DialogDescription>
                  Estás reservando para el {date?.toLocaleDateString('es-ES', { dateStyle: 'long' })}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p className="text-sm">Selecciona el tipo de clase que deseas agendar:</p>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="justify-start rounded-xl h-14 border-primary/50 px-4">
                    <Users className="w-5 h-5 mr-3 text-accent" />
                    Lección Individual (60 min)
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl h-14 border-primary/50 px-4">
                    <Video className="w-5 h-5 mr-3 text-blue-500" />
                    Taller Grupal Online (90 min)
                  </Button>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl flex-1 border-primary">Cancelar</Button>
                <Button onClick={handleBook} className="bg-accent text-white rounded-xl flex-1">Agendar Ahora</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="rounded-3xl border-none shadow-md overflow-hidden bg-white">
            <CardHeader className="bg-primary/20">
              <CardTitle>Vista de Calendario</CardTitle>
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
            <h3 className="text-xl font-bold flex items-center gap-2">
              Clases para el {date?.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            
            {CLASSES.map((cls, i) => (
              <Card key={i} className="rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-secondary/50 p-4 rounded-2xl text-center min-w-[100px]">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-secondary-foreground" />
                    <span className="font-bold text-lg">{cls.time.split(' ')[0]}</span>
                    <span className="text-xs block opacity-70">{cls.time.split(' ')[1]}</span>
                  </div>
                  
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h4 className="text-xl font-black">{cls.title}</h4>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium"><Users className="w-4 h-4" /> {cls.teacher}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {cls.duration}</span>
                      <span className="flex items-center gap-1">
                        {cls.type === 'En línea' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        {cls.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-primary" onClick={() => toast({ title: "Función próximamente", description: "Esta opción estará disponible pronto." })}>Reprogramar</Button>
                    <Button className="bg-accent text-white rounded-xl">Ver Detalles</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
