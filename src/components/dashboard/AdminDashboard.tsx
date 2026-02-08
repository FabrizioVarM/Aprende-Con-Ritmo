
"use client"

import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from '@/lib/auth-store';
import { useBookingStore, TimeSlot } from '@/lib/booking-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useResourceStore } from '@/lib/resource-store';
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  Music, 
  TrendingUp, 
  UserPlus, 
  Settings,
  Clock,
  CalendarDays,
  CheckCircle2,
  Trophy,
  History,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eraser,
  Plus,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { allUsers, getTeachers } = useAuth();
  const { availabilities, getDayAvailability, updateAvailability } = useBookingStore();
  const { completions } = useCompletionStore();
  const { resources } = useResourceStore();
  const { toast } = useToast();

  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayTimestamp, setTodayTimestamp] = useState<number>(0);

  useEffect(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setTodayTimestamp(startOfToday.getTime());
  }, []);

  useEffect(() => {
    if (isScheduleDialogOpen && editingTeacherId) {
      const data = getDayAvailability(editingTeacherId, selectedDate);
      setLocalSlots(JSON.parse(JSON.stringify(data.slots)));
    }
  }, [selectedDate, isScheduleDialogOpen, getDayAvailability, editingTeacherId]);

  const teachers = useMemo(() => getTeachers(), [getTeachers]);
  const studentsCount = useMemo(() => allUsers.filter(u => u.role === 'student').length, [allUsers]);

  const calculateTeacherStats = (teacherId: string) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
    
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    });

    let weeklyEnabledHours = 0;
    let weeklyEnabledSlots = 0;
    let weeklyCompletedHours = 0;
    let globalCompletedHours = 0;

    availabilities.forEach(dayAvail => {
      if (dayAvail.teacherId === teacherId) {
        const isThisWeek = weekDates.includes(dayAvail.date);
        
        dayAvail.slots.forEach(slot => {
          let duration = 0;
          try {
            const [start, end] = slot.time.split(' - ');
            const [h1, m1] = start.split(':').map(Number);
            const [h2, m2] = end.split(':').map(Number);
            duration = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
          } catch (e) {
            duration = 1;
          }

          if (isThisWeek && (slot.isAvailable || slot.isBooked)) {
            weeklyEnabledHours += duration;
            weeklyEnabledSlots++;
            if (slot.isBooked && slot.status === 'completed') {
              weeklyCompletedHours += duration;
            }
          }

          if (slot.isBooked && slot.status === 'completed') {
            globalCompletedHours += duration;
          }
        });
      }
    });

    return { 
      hours: weeklyEnabledHours, 
      slots: weeklyEnabledSlots, 
      completedHours: weeklyCompletedHours,
      globalCompletedHours 
    };
  };

  const teachersWithStats = useMemo(() => {
    return teachers.map(t => ({
      ...t,
      stats: calculateTeacherStats(t.id)
    })).sort((a, b) => b.stats.globalCompletedHours - a.stats.globalCompletedHours);
  }, [teachers, availabilities]);

  const globalStats = useMemo(() => {
    let totalHours = 0;
    let totalCount = 0;
    
    availabilities.forEach(dayAvail => {
      dayAvail.slots.forEach(slot => {
        if (slot.isBooked && slot.status === 'completed') {
          let duration = 0;
          try {
            const [start, end] = slot.time.split(' - ');
            const [h1, m1] = start.split(':').map(Number);
            const [h2, m2] = end.split(':').map(Number);
            duration = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
          } catch (e) {
            duration = 1;
          }
          totalHours += duration;
          totalCount++;
        }
      });
    });
    
    return { totalHours, totalCount };
  }, [availabilities]);

  const recentActivity = useMemo(() => {
    const list: any[] = [];
    availabilities.forEach(day => {
      day.slots.forEach(slot => {
        if (slot.isBooked && slot.status === 'completed') {
          const startTime = slot.time.split(' - ')[0];
          const timestamp = new Date(`${day.date}T${startTime}:00`).getTime();
          list.push({
            id: `class-${slot.id}-${day.date}`,
            type: 'class',
            user: slot.bookedBy || 'Alumno',
            action: `Clase de ${slot.instrument || 'Música'} completada`,
            timestamp,
            timeLabel: new Date(timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
          });
        }
      });
    });
    completions.filter(c => c.isCompleted).forEach(c => {
      const resource = resources.find(r => r.id === c.resourceId);
      const student = allUsers.find(u => u.id === c.studentId);
      const timestamp = new Date(c.date).getTime();
      list.push({
        id: `res-${c.resourceId}-${c.studentId}`,
        type: 'resource',
        user: student?.name || 'Alumno',
        action: `Material "${resource?.title || 'Material'}" completado`,
        timestamp,
        timeLabel: new Date(timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        icon: BookOpen,
        color: 'text-accent',
        bg: 'bg-accent/5'
      });
    });
    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }, [availabilities, completions, resources, allUsers]);

  const handleManageTeacherSchedule = (teacherId: string) => {
    setEditingTeacherId(teacherId);
    setIsScheduleDialogOpen(true);
  };

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
      isBooked: false,
      type: 'presencial',
      status: 'pending'
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

  const clearAllSlots = () => {
    const bookedSlots = localSlots.filter(s => s.isBooked);
    setLocalSlots(bookedSlots);
    toast({ title: "Día Limpiado 🧹", description: "Se han eliminado los horarios no reservados." });
  };

  const handleSaveAvailability = () => {
    if (editingTeacherId) {
      updateAvailability(editingTeacherId, selectedDate, localSlots);
      toast({ title: "Disponibilidad Guardada ✅", description: "Horarios actualizados para el docente." });
      setIsScheduleDialogOpen(false);
    }
  };

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

  const isSelectedDatePast = useMemo(() => {
    const dateCopy = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    return dateCopy.getTime() < todayTimestamp;
  }, [selectedDate, todayTimestamp]);

  const editingTeacherName = useMemo(() => {
    return teachers.find(t => t.id === editingTeacherId)?.name || 'Profesor';
  }, [editingTeacherId, teachers]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline tracking-tight">Centro de Administración 🏢</h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Resumen de las operaciones y crecimiento de la escuela.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-2xl gap-2 h-12 border-2 font-black">
            <Settings className="w-4 h-4" /> Ajustes
          </Button>
          <Button className="bg-accent text-white rounded-2xl gap-2 h-12 shadow-lg shadow-accent/20 font-black px-6">
            <UserPlus className="w-4 h-4" /> Agregar Usuario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alumnos Totales</p>
                <h3 className="text-2xl font-black text-secondary-foreground">{studentsCount.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Music className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profesores Activos</p>
                <h3 className="text-2xl font-black text-secondary-foreground">{teachers.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Clases Completadas</p>
                <h3 className="text-2xl font-black text-secondary-foreground">{globalStats.totalCount.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-2xl">
                <History className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horas Ejercidas (Tot)</p>
                <h3 className="text-2xl font-black text-secondary-foreground">{globalStats.totalHours.toFixed(1)} h</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 p-8 border-b flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-accent" />
                Desempeño Docente
              </CardTitle>
              <p className="text-xs font-bold text-muted-foreground italic uppercase tracking-wider">Seguimiento de horas habilitadas y ejercidas</p>
            </div>
            <Badge className="bg-accent text-white rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">Semana Actual & Histórico</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {teachersWithStats.length > 0 ? teachersWithStats.map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-muted/30 transition-colors group gap-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 border-2 border-primary/20 shadow-sm transition-transform group-hover:scale-105">
                      {t.photoUrl ? (
                        <AvatarImage src={t.photoUrl} className="object-cover" />
                      ) : (
                        <AvatarImage src={`https://picsum.photos/seed/${t.id}/150`} />
                      )}
                      <AvatarFallback className="bg-primary text-secondary-foreground font-black">{t.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="font-black text-lg text-secondary-foreground">{t.name}</div>
                      <div className="flex flex-wrap gap-2">
                        {t.instruments?.map(inst => (
                          <span key={inst} className="text-[9px] font-black uppercase tracking-widest bg-secondary/30 text-secondary-foreground px-2 py-0.5 rounded-full border border-secondary/10">
                            {inst}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 sm:gap-10 w-full sm:w-auto">
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Esta Semana</p>
                      <div className="flex items-center justify-end gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-xl font-black text-accent">{t.stats.hours.toFixed(1)}h</span>
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground">
                        {t.stats.slots} turnos habilitados
                      </p>
                    </div>

                    <div className="text-right border-l border-primary/10 pl-6 sm:pl-10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Completado (Sem)</p>
                      <div className="flex items-center justify-end gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xl font-black text-emerald-600">{t.stats.completedHours.toFixed(1)}h</span>
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground">
                        {t.stats.hours > 0 
                          ? ((t.stats.completedHours / t.stats.hours) * 100).toFixed(0) 
                          : 0}% eficiencia
                      </p>
                    </div>

                    <div className="text-right border-l border-primary/10 pl-6 sm:pl-10 bg-accent/5 p-2 rounded-2xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-accent mb-1">Histórico Global</p>
                      <div className="flex items-center justify-end gap-2">
                        <Trophy className="w-4 h-4 text-accent" />
                        <span className="text-xl font-black text-secondary-foreground">{t.stats.globalCompletedHours.toFixed(1)}h</span>
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Horas Ejercidas</p>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white font-black px-4 transition-all"
                      onClick={() => handleManageTeacherSchedule(t.id)}
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Gestionar Agenda
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center space-y-4">
                  <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                  <p className="text-muted-foreground font-bold italic">No hay profesores registrados en el sistema.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="border-b bg-white/50 p-6">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length > 0 ? recentActivity.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-center gap-4 p-5 border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <div className={cn("p-2 rounded-xl shrink-0", act.bg)}>
                    <Icon className={cn("w-4 h-4", act.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-secondary-foreground truncate">{act.action}</div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">{act.user}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground italic font-medium shrink-0">{act.timeLabel}</div>
                </div>
              );
            }) : (
              <div className="p-12 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground italic">Sin actividad reciente registrada.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="rounded-[2rem] max-w-5xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary/10 p-6 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black text-secondary-foreground flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-accent" />
              Gestionar Agenda: {editingTeacherName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-6 bg-white overflow-y-auto flex-1 max-h-[60vh]">
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1. Día</Label>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => {
                      const prev = new Date(selectedDate);
                      prev.setDate(prev.getDate() - 7);
                      setSelectedDate(prev);
                    }} className="rounded-full h-8 w-8">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      const next = new Date(selectedDate);
                      next.setDate(next.getDate() + 7);
                      setSelectedDate(next);
                    }} className="rounded-full h-8 w-8">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((d, i) => {
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    const dateAtStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                    const isPast = todayTimestamp > 0 && dateAtStart.getTime() < todayTimestamp;

                    return (
                      <button
                        key={i}
                        disabled={isPast}
                        onClick={() => !isPast && setSelectedDate(d)}
                        className={cn(
                          "flex flex-col items-center py-2 md:py-3 rounded-xl transition-all border-2 relative group",
                          isSelected 
                            ? "bg-accent border-accent text-white shadow-md scale-105" 
                            : "bg-primary/5 border-transparent hover:border-accent/20",
                          isPast && "opacity-40 grayscale pointer-events-none cursor-not-allowed bg-gray-100 border-gray-200"
                        )}
                      >
                        <span className="text-[8px] font-black uppercase tracking-wider">
                          {d.toLocaleDateString('es-ES', { weekday: 'short' })}
                        </span>
                        <span className="text-base font-black">{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-base font-black text-secondary-foreground capitalize">
                    {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                  </p>
                  {!isSelectedDatePast && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={clearAllSlots} className="rounded-full border-destructive/50 text-destructive h-8 px-3 text-[10px] font-black">
                        <Eraser className="w-3 h-3 mr-1" /> Limpiar
                      </Button>
                      <Button size="sm" variant="outline" onClick={addSlot} className="rounded-full border-accent text-accent h-8 px-3 text-[10px] font-black">
                        <Plus className="w-3 h-3 mr-1" /> Añadir
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {localSlots.map((slot, i) => (
                    <div key={slot.id} className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                      slot.isBooked ? "bg-orange-50 border-orange-200" : slot.isAvailable ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-100 opacity-60",
                      isSelectedDatePast && "opacity-50 grayscale pointer-events-none"
                    )}>
                      <div className="flex-1 relative">
                        <Input
                          value={slot.time}
                          onChange={(e) => updateSlotTime(i, e.target.value)}
                          disabled={slot.isBooked || isSelectedDatePast}
                          className="h-9 pl-3 text-xs rounded-lg font-bold bg-white border-2"
                        />
                        {slot.isBooked && (
                          <div className="flex items-center gap-1 mt-0.5 ml-1">
                            <UserIcon className="w-2 h-2 text-orange-600" />
                            <span className="text-[8px] font-black text-orange-600 uppercase">{slot.bookedBy}</span>
                          </div>
                        )}
                      </div>
                      <Switch 
                        checked={slot.isAvailable || slot.isBooked} 
                        disabled={slot.isBooked || isSelectedDatePast}
                        onCheckedChange={() => toggleSlotAvailability(i)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeSlot(i)} disabled={slot.isBooked || isSelectedDatePast} className="h-7 w-7">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t flex gap-3">
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)} className="rounded-xl flex-1 h-12 font-black">Cancelar</Button>
            <Button onClick={handleSaveAvailability} disabled={isSelectedDatePast} className="bg-accent text-white rounded-xl flex-1 h-12 font-black gap-2">Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
