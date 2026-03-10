
"use client"

import { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from '@/lib/auth-store';
import { useBookingStore, TimeSlot, INITIAL_SLOTS } from '@/lib/booking-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useResourceStore } from '@/lib/resource-store';
import { INITIAL_RESOURCES } from '@/lib/resources';
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
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
  User as UserIcon,
  Database,
  Video,
  MapPin,
  Building2,
  Copy,
  ClipboardPaste,
  Sparkles,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const { allUsers, getTeachers } = useAuth();
  const { availabilities, getDayAvailability, updateAvailability } = useBookingStore();
  const { completions } = useCompletionStore();
  const { resources, addResource } = useResourceStore();
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();

  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayTimestamp, setTodayTimestamp] = useState<number>(0);
  const [stagedSlots, setStagedSlots] = useState<Record<string, TimeSlot[]>>({});
  const [copyBuffer, setCopyBuffer] = useState<TimeSlot[] | null>(null);

  // Múltiples Plantillas
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [teacherTemplates, setTeacherTemplates] = useState<{name: string, slots: TimeSlot[]}[]>([]);
  const [saveSlotIndex, setSaveSlotIndex] = useState<number>(0);
  const [saveSlotName, setSaveSlotName] = useState<string>('');

  const selectedDateKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  useEffect(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setTodayTimestamp(startOfToday.getTime());
  }, []);

  useEffect(() => {
    if (!isScheduleDialogOpen) {
      setStagedSlots({});
      setCopyBuffer(null);
    }
  }, [isScheduleDialogOpen]);

  const fetchTemplates = useCallback(async (tid: string) => {
    if (!tid) return;
    const ref = doc(db, 'settings', `templates_${tid}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data().templates || [];
      const padded = [...data];
      while (padded.length < 3) {
        padded.push({ name: `Plantilla ${padded.length + 1}`, slots: [] });
      }
      setTeacherTemplates(padded);
    } else {
      setTeacherTemplates([
        { name: "Turno Mañana", slots: [] },
        { name: "Turno Tarde", slots: [] },
        { name: "Horario Especial", slots: [] }
      ]);
    }
  }, [db]);

  useEffect(() => {
    if (isScheduleDialogOpen && editingTeacherId) {
      if (stagedSlots[selectedDateKey]) {
        setLocalSlots(JSON.parse(JSON.stringify(stagedSlots[selectedDateKey])));
      } else {
        const data = getDayAvailability(editingTeacherId, selectedDate);
        setLocalSlots(JSON.parse(JSON.stringify(data.slots)));
      }
      fetchTemplates(editingTeacherId);
    }
  }, [selectedDate, isScheduleDialogOpen, getDayAvailability, editingTeacherId, stagedSlots, fetchTemplates]);

  const teachers = useMemo(() => getTeachers(), [getTeachers]);
  const studentsCount = useMemo(() => allUsers.filter(u => u.role === 'student').length, [allUsers]);

  const handleSeedResources = () => {
    if (resources.length > 0) return;
    INITIAL_RESOURCES.forEach(res => addResource(res));
    toast({ title: "Biblioteca Inicializada 📚" });
  };

  const calculateDuration = (timeStr: string): number => {
    try {
      const [start, end] = timeStr.split(' - ');
      const [h1, m1] = start.split(':').map(Number);
      const [h2, m2] = end.split(':').map(Number);
      const startMinutes = h1 * 60 + m1;
      const endMinutes = h2 * 60 + m2;
      return (endMinutes - startMinutes) / 60;
    } catch (e) {
      return 1;
    }
  };

  const calculateTeacherStats = (teacherId: string) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
    const weekStrings = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });

    let weeklyEnabledHours = 0;
    let weeklyEnabledSlots = 0;
    let weeklyCompletedHours = 0;
    let globalCompletedHours = 0;

    availabilities.forEach(dayAvail => {
      if (dayAvail.teacherId === teacherId) {
        const isThisWeek = weekStrings.includes(dayAvail.date);
        dayAvail.slots.forEach(slot => {
          const duration = calculateDuration(slot.time);
          if (isThisWeek && (slot.isAvailable || slot.isBooked)) {
            weeklyEnabledHours += duration;
            weeklyEnabledSlots++;
            if (slot.isBooked && slot.status === 'completed') weeklyCompletedHours += duration;
          }
          if (slot.isBooked && slot.status === 'completed') globalCompletedHours += duration;
        });
      }
    });
    return { hours: weeklyEnabledHours, slots: weeklyEnabledSlots, completedHours: weeklyCompletedHours, globalCompletedHours };
  };

  const teachersWithStats = useMemo(() => {
    return teachers.map(t => ({ ...t, stats: calculateTeacherStats(t.id) })).sort((a, b) => b.stats.globalCompletedHours - a.stats.globalCompletedHours);
  }, [teachers, availabilities]);

  const globalStats = useMemo(() => {
    let totalHours = 0; let totalCount = 0;
    availabilities.forEach(dayAvail => {
      dayAvail.slots.forEach(slot => {
        if (slot.isBooked && slot.status === 'completed') {
          totalHours += calculateDuration(slot.time);
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
          const ts = new Date(`${day.date}T${slot.time.split(' ')[0]}:00`).getTime();
          list.push({ id: `cl-${slot.id}`, type: 'class', user: slot.bookedBy || 'Alumno', action: `Clase de ${slot.instrument} completada`, timestamp: ts, timeLabel: new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' });
        }
      });
    });
    completions.filter(c => c.isCompleted).forEach(c => {
      const res = resources.find(r => r.id === c.resourceId);
      const student = allUsers.find(u => u.id === c.studentId);
      const ts = new Date(c.date).getTime();
      list.push({ id: `res-${c.resourceId}-${c.studentId}`, type: 'resource', user: student?.name || 'Alumno', action: `Material "${res?.title}" completado`, timestamp: ts, timeLabel: new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), icon: BookOpen, color: 'text-accent', bg: 'bg-accent/5' });
    });
    return list.sort((a, b) => a.timestamp - a.timestamp).slice(0, 10);
  }, [availabilities, completions, resources, allUsers]);

  const handleManageTeacherSchedule = (teacherId: string) => {
    setEditingTeacherId(teacherId);
    setIsScheduleDialogOpen(true);
  };

  const handleCopyDay = () => {
    setCopyBuffer(JSON.parse(JSON.stringify(localSlots)));
    toast({ title: "Configuración Copiada 📋" });
  };

  const handlePasteDay = () => {
    if (!copyBuffer) return;
    const pasted = copyBuffer.map(s => ({ ...s, id: Math.random().toString(36).substring(2, 9), isBooked: false, bookedBy: null, studentId: null, status: 'pending' as const }));
    setLocalSlots(pasted);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: pasted }));
    toast({ title: "Horario Pegado ✨" });
  };

  const handleSaveTemplateByIndex = async (index: number, name: string) => {
    if (!editingTeacherId) return;
    const cleanSlots = localSlots.map(s => ({ 
      ...s, 
      id: Math.random().toString(36).substring(2, 9), 
      isBooked: false, 
      bookedBy: null, 
      studentId: null, 
      status: 'pending' as const 
    }));
    
    const newTemplates = [...teacherTemplates];
    newTemplates[index] = { name: name || `Plantilla ${index + 1}`, slots: cleanSlots };
    
    const ref = doc(db, 'settings', `templates_${editingTeacherId}`);
    await setDoc(ref, { templates: newTemplates });
    setTeacherTemplates(newTemplates);
    toast({ title: "Plantilla Guardada ✨", description: `Se guardó "${newTemplates[index].name}".` });
    setIsSaveTemplateDialogOpen(false);
  };

  const handleResetTemplate = async (index: number) => {
    if (!editingTeacherId) return;
    const newTemplates = [...teacherTemplates];
    newTemplates[index] = { name: `Slot ${index + 1} (Vacío)`, slots: [] };
    const ref = doc(db, 'settings', `templates_${editingTeacherId}`);
    await setDoc(ref, { templates: newTemplates });
    setTeacherTemplates(newTemplates);
    toast({ title: "Plantilla Reiniciada 🧹" });
  };

  const handleLoadTemplateByIndex = (index: number) => {
    const template = teacherTemplates[index];
    if (!template || !template.slots || template.slots.length === 0) {
      toast({ variant: "destructive", title: "Plantilla Vacía", description: "Primero guarda un horario en esta posición." });
      return;
    }
    const refreshed = template.slots.map(s => ({ ...s, id: Math.random().toString(36).substring(2, 9) }));
    setLocalSlots(refreshed);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: refreshed }));
    toast({ title: "Plantilla Cargada 🚀", description: `Se aplicó "${template.name}".` });
  };

  const handleLoadAcademyBase = () => {
    const base = INITIAL_SLOTS.map(s => ({ id: Math.random().toString(36).substring(2, 9), time: s, isAvailable: true, isBooked: false, type: 'presencial' as const, status: 'pending' as const }));
    setLocalSlots(base);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: base }));
    toast({ title: "Horarios Base Aplicados 🏢" });
  };

  const toggleSlotAvailability = (index: number) => {
    const newSlots = [...localSlots];
    if (!newSlots[index].isBooked) {
      newSlots[index].isAvailable = !newSlots[index].isAvailable;
      setLocalSlots(newSlots);
      setStagedSlots(prev => ({ ...prev, [selectedDateKey]: newSlots }));
    }
  };

  const toggleSlotType = (index: number) => {
    const newSlots = [...localSlots];
    if (!newSlots[index].isBooked) {
      newSlots[index].type = newSlots[index].type === 'virtual' ? 'presencial' : 'virtual';
      setLocalSlots(newSlots);
      setStagedSlots(prev => ({ ...prev, [selectedDateKey]: newSlots }));
    }
  };

  const updateSlotTime = (index: number, newTime: string) => {
    const newSlots = [...localSlots];
    newSlots[index].time = newTime;
    setLocalSlots(newSlots);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: newSlots }));
  };

  const addSlot = () => {
    const updated = [...localSlots, { id: Math.random().toString(36).substring(2, 9), time: "08:00 - 09:00", isAvailable: true, isBooked: false, type: 'presencial', status: 'pending' } as TimeSlot];
    setLocalSlots(updated);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: updated }));
  };

  const removeSlot = (index: number) => {
    if (localSlots[index].isBooked) return;
    const newSlots = localSlots.filter((_, i) => i !== index);
    setLocalSlots(newSlots);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: newSlots }));
  };

  const clearAllSlots = () => {
    const bookedSlots = localSlots.filter(s => s.isBooked);
    setLocalSlots(bookedSlots);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: bookedSlots }));
  };

  const handleSaveAvailability = () => {
    if (editingTeacherId) {
      const finalToSave = { ...stagedSlots, [selectedDateKey]: localSlots };
      Object.entries(finalToSave).forEach(([dateStr, slots]) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        updateAvailability(editingTeacherId, dateObj, slots);
      });
      toast({ title: "Cambios Guardados ✅" });
      setIsScheduleDialogOpen(false);
      setStagedSlots({});
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

  const bookedHoursCountMap = useMemo(() => {
    if (!editingTeacherId) return {};
    const counts: Record<string, number> = {};
    weekDays.forEach(d => {
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const slots = stagedSlots[dStr] || availabilities.find(a => a.teacherId === editingTeacherId && a.date === dStr)?.slots || [];
      const booked = slots.filter(s => s.isBooked).length;
      if (booked > 0) counts[dStr] = booked;
    });
    return counts;
  }, [weekDays, availabilities, editingTeacherId, stagedSlots]);

  const availableSlotsCountMap = useMemo(() => {
    if (!editingTeacherId) return {};
    const counts: Record<string, number> = {};
    weekDays.forEach(d => {
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const slots = stagedSlots[dStr] || availabilities.find(a => a.teacherId === editingTeacherId && a.date === dStr)?.slots || [];
      const count = slots.filter(s => s.isAvailable && !s.isBooked).length;
      if (count > 0) counts[dStr] = count;
    });
    return counts;
  }, [weekDays, availabilities, editingTeacherId, stagedSlots]);

  const isSelectedDatePast = useMemo(() => {
    const dateAtStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    return todayTimestamp > 0 && dateAtStart.getTime() < todayTimestamp;
  }, [selectedDate, todayTimestamp]);

  const editingTeacherName = useMemo(() => teachers.find(t => t.id === editingTeacherId)?.name || 'Profesor', [editingTeacherId, teachers]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline tracking-tight">Centro de Administración 🏢</h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Resumen de las operaciones y crecimiento de la escuela.</p>
        </div>
        <div className="flex gap-2">
          {resources.length === 0 && <Button variant="outline" className="rounded-2xl gap-2 h-12 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-black" onClick={handleSeedResources}><Database className="w-4 h-4" /> Inicializar Biblioteca</Button>}
          <Button variant="outline" className="rounded-2xl gap-2 h-12 border-2 font-black text-foreground" onClick={() => router.push('/settings')}><Settings className="w-4 h-4" /> Ajustes</Button>
          <Button className="bg-accent text-white rounded-2xl gap-2 h-12 shadow-lg shadow-accent/20 font-black px-6 hover:scale-105 transition-all" onClick={() => router.push('/users?add=true')}><UserPlus className="w-4 h-4" /> Agregar Usuario</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] border-2 border-blue-200 shadow-sm bg-card"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-2xl"><Users className="w-6 h-6 text-blue-600" /></div><div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alumnos Totales</p><h3 className="text-2xl font-black text-foreground">{studentsCount.toLocaleString()}</h3></div></div></CardContent></Card>
        <Card className="rounded-[2rem] border-2 border-orange-200 shadow-sm bg-card"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-orange-100 rounded-2xl"><Music className="w-6 h-6 text-orange-600" /></div><div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profesores Activos</p><h3 className="text-2xl font-black text-foreground">{teachers.length}</h3></div></div></CardContent></Card>
        <Card className="rounded-[2rem] border-2 border-green-200 shadow-sm bg-card"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-green-100 rounded-2xl"><CheckCircle2 className="w-6 h-6 text-green-600" /></div><div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Clases Completadas</p><h3 className="text-2xl font-black text-foreground">{globalStats.totalCount.toLocaleString()}</h3></div></div></CardContent></Card>
        <Card className="rounded-[2rem] border-2 border-accent/20 shadow-sm bg-card"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-accent/20 rounded-2xl"><History className="w-6 h-6 text-accent" /></div><div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horas Ejercidas (Tot)</p><h3 className="text-2xl font-black text-foreground">{globalStats.totalHours.toFixed(1)} h</h3></div></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-2 border-primary/20 shadow-md overflow-hidden bg-card">
          <CardHeader className="bg-primary/5 p-8 border-b flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black flex items-center gap-3 text-foreground">
                <CalendarDays className="w-6 h-6 text-accent" />
                Desempeño Docente
              </CardTitle>
            </div>
            <Badge className="bg-accent text-white rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">Semana Actual</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {teachersWithStats.length > 0 ? teachersWithStats.map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-muted/30 transition-colors group gap-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 border-2 border-primary/20 shadow-sm transition-transform group-hover:scale-105">
                      {t.photoUrl ? <AvatarImage src={t.photoUrl} className="object-cover" /> : <AvatarImage src={`https://picsum.photos/seed/${t.id}/150`} />}
                      <AvatarFallback className="bg-primary text-secondary-foreground font-black">{t.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="font-black text-lg text-foreground">{t.name}</div>
                      <div className="flex flex-wrap gap-2">{t.instruments?.map(inst => <span key={inst} className="text-[9px] font-black uppercase tracking-widest bg-secondary/30 text-secondary-foreground px-2 py-0.5 rounded-full border border-secondary/10">{inst}</span>)}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 sm:gap-10 w-full sm:auto">
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Esta Semana</p>
                      <div className="flex items-center justify-end gap-2"><Clock className="w-4 h-4 text-accent" /><span className="text-xl font-black text-accent">{t.stats.hours.toFixed(1)}h</span></div>
                    </div>
                    <div className="text-right border-l border-primary/10 pl-6 sm:pl-10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Completado</p>
                      <div className="flex items-center justify-end gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="text-xl font-black text-emerald-600">{t.stats.completedHours.toFixed(1)}h</span></div>
                    </div>
                    <div className="text-right border-l border-primary/10 pl-6 sm:pl-10 bg-accent/5 p-2 rounded-2xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-accent mb-1">Histórico</p>
                      <div className="flex items-center justify-end gap-2"><Trophy className="w-4 h-4 text-accent" /><span className="text-xl font-black text-foreground">{t.stats.globalCompletedHours.toFixed(1)}h</span></div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white font-black px-4 transition-all" onClick={() => handleManageTeacherSchedule(t.id)}><CalendarDays className="w-4 h-4 mr-2" /> Gestionar Agenda</Button>
                  </div>
                </div>
              )) : <div className="p-20 text-center text-muted-foreground italic">No hay profesores registrados.</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-md overflow-hidden bg-card">
          <CardHeader className="border-b bg-muted/50 p-6"><CardTitle className="text-lg font-black flex items-center gap-2 text-foreground"><TrendingUp className="w-5 h-5 text-accent" /> Actividad Reciente</CardTitle></CardHeader>
          <CardContent className="p-0">
            {recentActivity.length > 0 ? recentActivity.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-center gap-4 p-5 border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <div className={cn("p-2 rounded-xl shrink-0", act.bg)}><Icon className={cn("w-4 h-4", act.color)} /></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-black text-foreground truncate">{act.action}</div><div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">{act.user}</div></div>
                  <div className="text-[10px] text-muted-foreground italic font-medium shrink-0">{act.timeLabel}</div>
                </div>
              );
            }) : <div className="p-12 text-center text-xs text-muted-foreground italic">Sin actividad reciente.</div>}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="rounded-[2rem] max-w-5xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary/10 p-6 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3"><CalendarDays className="w-6 h-6 text-accent" /> Gestionar Agenda: {editingTeacherName}</DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-6 bg-card overflow-y-auto flex-1 max-h-[60vh]">
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1. Día</Label>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { const prev = new Date(selectedDate); prev.setDate(prev.getDate() - 7); setSelectedDate(prev); }} className="rounded-full h-8 w-8 text-foreground"><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { const next = new Date(selectedDate); next.setDate(next.getDate() + 7); setSelectedDate(next); }} className="rounded-full h-8 w-8 text-foreground"><ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((d, i) => {
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const bookedCount = bookedHoursCountMap[dStr];
                    const availCount = availableSlotsCountMap[dStr];
                    const isPast = todayTimestamp > 0 && new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() < todayTimestamp;
                    return (
                      <button key={i} disabled={isPast} onClick={() => !isPast && setSelectedDate(d)} className={cn("flex flex-col items-center py-2 md:py-3 rounded-xl transition-all border-2 relative group", isSelected ? "bg-accent border-accent text-white shadow-md scale-105" : "bg-muted/30 border-primary/10 hover:border-accent/20", isPast && "opacity-40 grayscale pointer-events-none cursor-not-allowed bg-muted border-border")}>
                        <span className={cn("text-[8px] font-black uppercase tracking-wider", isSelected ? "text-white" : "text-muted-foreground")}>{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                        <span className={cn("text-base font-black", isSelected ? "text-white" : "text-foreground")}>{d.getDate()}</span>
                        <div className="flex gap-1 mt-1">
                          {availCount > 0 && <div className={cn("h-4 min-w-[1rem] px-1 rounded-full text-white text-[8px] flex items-center justify-center font-black shadow-sm bg-emerald-500", isSelected && "ring-1 ring-emerald-200")}>{availCount}</div>}
                          {bookedCount > 0 && <div className={cn("h-4 min-w-[1rem] px-1 rounded-full text-[8px] flex items-center justify-center font-black shadow-sm", isSelected ? "bg-white text-accent" : "bg-accent text-white")}>{bookedCount}</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-primary/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-base font-black text-foreground capitalize">{selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {/* ACCIONES DE LOTE */}
                    <div className="bg-primary/5 p-1 rounded-xl flex gap-1 border border-primary/10 shadow-inner">
                      <Button size="sm" variant="ghost" onClick={handleCopyDay} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-foreground hover:bg-white dark:hover:bg-slate-800 shadow-sm"><Copy className="w-3 h-3 mr-1" /> Copiar</Button>
                      <Button size="sm" variant="ghost" onClick={handlePasteDay} disabled={!copyBuffer} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-foreground hover:bg-white dark:hover:bg-slate-800 shadow-sm disabled:opacity-30"><ClipboardPaste className="w-3 h-3 mr-1" /> Pegar</Button>
                    </div>

                    <div className="flex items-center gap-2 bg-accent/5 p-1 rounded-xl border border-accent/10 shadow-inner">
                      <Select 
                        key={selectedDateKey}
                        onValueChange={(val) => {
                          if (val === 'custom') return;
                          handleLoadTemplateByIndex(parseInt(val));
                        }}
                      >
                        <SelectTrigger className="h-8 w-44 text-[9px] font-black uppercase bg-transparent border-none shadow-none focus:ring-0">
                          <SelectValue placeholder="Elegir una plantilla" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2 shadow-xl">
                          {teacherTemplates.map((t, i) => (
                            <SelectItem key={i} value={i.toString()} className="text-[10px] font-black py-2 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center text-[8px]">{i+1}</span>
                                {t.name}
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="custom" className="text-[10px] font-black border-t py-2 cursor-pointer text-muted-foreground">
                            ✨ Horario Personalizado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-accent hover:bg-white dark:hover:bg-slate-800 rounded-lg shadow-sm"
                        onClick={() => setIsTemplateDialogOpen(true)}
                        title="Gestionar Plantillas"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-10 rounded-xl border-2 border-accent/30 text-[9px] font-black uppercase text-accent hover:bg-accent hover:text-white transition-all shadow-sm" 
                      onClick={() => setIsSaveTemplateDialogOpen(true)}
                    >
                      <Save className="w-3.5 h-3.5 mr-1" /> Guardar como Plantilla
                    </Button>

                    <Button size="sm" variant="outline" onClick={handleLoadAcademyBase} className="h-10 rounded-xl border-2 text-[9px] font-black uppercase text-foreground"><Building2 className="w-3.5 h-3.5 mr-1" /> Horarios Base</Button>
                    {!isSelectedDatePast && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={clearAllSlots} className="rounded-full border-destructive/50 text-destructive h-8 px-3 text-[10px] font-black"><Eraser className="w-3 h-3 mr-1" /> Limpiar</Button>
                        <Button size="sm" variant="outline" onClick={addSlot} className="rounded-full border-accent text-accent h-8 px-3 text-[10px] font-black"><Plus className="w-3 h-3 mr-1" /> Añadir</Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {localSlots.map((slot, i) => (
                    <div key={slot.id} className={cn("flex items-center gap-3 p-3 rounded-xl border-2 transition-all", slot.isBooked ? "bg-orange-50 border-orange-200" : slot.isAvailable ? "bg-emerald-50 border-emerald-200" : "bg-muted/20 border-border opacity-60", isSelectedDatePast && "opacity-50 grayscale pointer-events-none")}>
                      <div className="flex-1 relative">
                        <Input value={slot.time} onChange={(e) => updateSlotTime(i, e.target.value)} disabled={slot.isBooked || isSelectedDatePast} className="h-9 pl-3 text-xs rounded-lg font-bold bg-card border-2" />
                        {slot.isBooked && <div className="flex items-center gap-1 mt-0.5 ml-1"><UserIcon className="w-2 h-2 text-orange-600" /><span className="text-[8px] font-black text-orange-600 uppercase">{slot.bookedBy}</span></div>}
                      </div>
                      <Button variant="ghost" size="sm" disabled={slot.isBooked || isSelectedDatePast} onClick={() => toggleSlotType(i)} className={cn("h-7 px-2 text-[8px] font-black uppercase rounded-md border", slot.type === 'virtual' ? "text-blue-600 border-blue-200 bg-blue-50" : "text-red-600 border-red-200 bg-red-50")}>{slot.type === 'virtual' ? <Video className="w-3 h-3 mr-1" /> : <MapPin className="w-3 h-3 mr-1" />} {slot.type}</Button>
                      <Switch checked={slot.isAvailable || slot.isBooked} disabled={slot.isBooked || isSelectedDatePast} onCheckedChange={() => toggleSlotAvailability(i)} />
                      <Button variant="ghost" size="icon" onClick={() => removeSlot(i)} disabled={slot.isBooked || isSelectedDatePast} className="h-7 w-7 text-foreground"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/30 border-t flex gap-3"><Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)} className="rounded-xl flex-1 h-14 font-black">Cancelar</Button><Button onClick={handleSaveAvailability} disabled={isSelectedDatePast} className="bg-accent text-white rounded-xl flex-1 h-14 font-black gap-2">Guardar Cambios</Button></div>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE GUARDAR PLANTILLA */}
      <Dialog open={isSaveTemplateDialogOpen} onOpenChange={isSaveTemplateDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-sm border-none shadow-2xl p-0 overflow-hidden bg-card">
          <DialogHeader className="bg-accent/10 p-6 border-b">
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <Save className="w-5 h-5 text-accent" />
              Guardar como Plantilla
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">Elige un slot para guardar este horario.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3",
                    saveSlotIndex === i ? "bg-accent/5 border-accent shadow-md" : "border-primary/10 hover:border-accent/30"
                  )}
                  onClick={() => {
                    setSaveSlotIndex(i);
                    setSaveSlotName(teacherTemplates[i]?.name || '');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black",
                      saveSlotIndex === i ? "bg-accent text-white" : "bg-primary/10 text-muted-foreground"
                    )}>{i + 1}</div>
                    <span className="font-black text-sm text-foreground">Slot {i + 1}</span>
                  </div>
                  {saveSlotIndex === i && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Nombre de la Plantilla</Label>
                      <Input 
                        value={saveSlotName} 
                        onChange={(e) => setSaveSlotName(e.target.value)}
                        placeholder={`Ej: ${teacherTemplates[i]?.name || 'Mi Horario'}`}
                        className="h-10 rounded-xl border-2 font-bold"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted/30 border-t flex gap-3">
            <Button variant="ghost" onClick={() => setIsSaveTemplateDialogOpen(false)} className="rounded-xl flex-1 font-black">Cancelar</Button>
            <Button className="bg-accent text-white rounded-xl flex-1 font-black shadow-lg shadow-accent/20" onClick={() => handleSaveTemplateByIndex(saveSlotIndex, saveSlotName)}>
              Confirmar Guardado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE GESTIÓN DE PLANTILLAS */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-md border-none shadow-2xl p-0 overflow-hidden bg-card">
          <DialogHeader className="bg-accent/10 p-6 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-accent" />
                Mis 3 Plantillas Maestras
              </DialogTitle>
              <Settings className="w-5 h-5 text-accent/40 animate-spin-slow" />
            </div>
            <DialogDescription className="font-bold text-muted-foreground">Administra, renombra o reinicia tus slots de carga.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-6">
            {teacherTemplates.map((temp, i) => (
              <div key={i} className="p-4 rounded-2xl border-2 border-primary/10 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-6 h-6 rounded-full bg-accent text-white text-[10px] font-black flex items-center justify-center shadow-sm">{i + 1}</div>
                    <Input 
                      value={temp.name} 
                      onChange={(e) => {
                        const newT = [...teacherTemplates];
                        newT[i].name = e.target.value;
                        setTeacherTemplates(newT);
                      }}
                      placeholder="Nombre de la plantilla..."
                      className="h-9 font-black text-xs border-none bg-transparent focus-visible:ring-0 p-0"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-accent"
                      onClick={() => handleSaveTemplateByIndex(i, temp.name)}
                      title="Guardar nombre"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleResetTemplate(i)}
                      title="Reiniciar a 0"
                    >
                      <Eraser className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 rounded-xl h-9 text-[10px] font-black uppercase bg-accent text-white shadow-md hover:scale-[1.02] transition-transform"
                    onClick={() => {
                      handleLoadTemplateByIndex(i);
                      setIsTemplateDialogOpen(false);
                    }}
                    disabled={!temp.slots || temp.slots.length === 0}
                  >
                    <Sparkles className="w-3 h-3 mr-1" /> Cargar en Agenda
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-muted/30 border-t flex justify-end">
            <Button variant="ghost" onClick={() => setIsTemplateDialogOpen(false)} className="rounded-xl font-black text-xs">Cerrar Administrador</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
