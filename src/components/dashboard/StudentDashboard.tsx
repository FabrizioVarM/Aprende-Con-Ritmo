
"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, PlayCircle, Star, Clock, ChevronRight } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudentDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleBookLesson = () => {
    toast({
      title: "Clase Solicitada 🎵",
      description: "Tu solicitud ha sido enviada al profesor. Recibirás una confirmación pronto.",
    });
    setIsOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline">¡Hola, Ana! 👋</h1>
          <p className="text-muted-foreground mt-1 text-lg">¿Lista para tu próximo avance musical?</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-white rounded-full px-6 h-12">
              Agendar Nueva Lección
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Agendar Lección 🎸</DialogTitle>
              <DialogDescription>
                Selecciona el profesor y el horario que mejor te convenga.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Seleccionar Profesor</label>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Elige un profesor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="carlos">Prof. Carlos (Guitarra)</SelectItem>
                    <SelectItem value="elena">Prof. Elena (Teoría)</SelectItem>
                    <SelectItem value="marcos">Prof. Marcos (Piano)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Horarios Disponibles</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-xl border-primary hover:bg-primary/20">Mañana (10:00)</Button>
                  <Button variant="outline" className="rounded-xl border-primary hover:bg-primary/20">Tarde (16:00)</Button>
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl flex-1 border-primary">Cancelar</Button>
              <Button onClick={handleBookLesson} className="bg-accent text-white rounded-xl flex-1">Confirmar Reserva</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-accent fill-accent" />
              Progreso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85%</div>
            <p className="text-sm text-muted-foreground">Maestra de Guitarra Nivel 2</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-none shadow-sm bg-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Próxima Clase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Hoy</div>
            <p className="text-sm text-muted-foreground">3:00 PM con Prof. Carlos</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Horas de Práctica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.5</div>
            <p className="text-sm text-muted-foreground">¡Sigue con el gran trabajo!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-none shadow-md overflow-hidden">
          <CardHeader className="border-b bg-white/50">
            <CardTitle>Próximas Clases</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { date: 'Hoy, 3 PM', topic: 'Ritmos Acústicos', type: 'Guitarra' },
              { date: 'Viernes, 11 AM', topic: 'Básicos de Teoría', type: 'General' },
              { date: 'Lunes, 2 PM', topic: 'Práctica de Escalas', type: 'Guitarra' },
            ].map((lesson, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
                <div className="flex gap-4 items-center">
                  <div className="bg-primary/50 p-2 rounded-xl">
                    <Calendar className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <div className="font-bold">{lesson.topic}</div>
                    <div className="text-xs text-muted-foreground">{lesson.date}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="rounded-full">{lesson.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-md overflow-hidden">
          <CardHeader className="border-b bg-white/50">
            <CardTitle>Recursos de Aprendizaje</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { title: 'Intro a Acordes', length: '15 min', type: 'Video' },
              { title: 'Hoja de Práctica #4', length: '2 págs', type: 'PDF' },
              { title: 'Pentatónica Menor', length: '12 min', type: 'Video' },
            ].map((resource, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
                <div className="flex gap-4 items-center">
                  <div className="bg-accent/20 p-2 rounded-xl">
                    <PlayCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-bold">{resource.title}</div>
                    <div className="text-xs text-muted-foreground">{resource.length}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
