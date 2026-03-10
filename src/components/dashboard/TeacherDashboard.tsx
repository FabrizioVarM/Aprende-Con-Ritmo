
"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useBookingStore, TimeSlot, INITIAL_SLOTS } from '@/lib/booking-store';
import { useAuth } from '@/lib/auth-store';
import { useSkillsStore } from '@/lib/skills-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useSettingsStore, FALLBACK_ZONES } from '@/lib/settings-store';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Clock, Calendar as CalendarIcon, User, Plus, Trash2, Save, GraduationCap, CheckCircle2, ChevronLeft, ChevronRight, Eraser, Video, MapPin, Music, Drum, Keyboard, Mic, BookOpen, Timer, MapPin as MapPinIcon, Copy, Paste, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const INSTRUMENT_EMOJIS: Record<string, string> = {
  'Guitarra': '🎸',
  'Piano': '🎹',
  'Violín': '🎻',
  'Batería': '🥁',
  'Canto': '🎤',
  'Teoría': '📖',
  'Bajo': '🎸',
  'Música': '🎵',
  'Tormenta de Oro': '⚡'
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

const formatTimeAgo = (timestamp: number) => {
  if (timestamp === 0) return 'Nunca';
  const now = new Date().getTime();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'ahora mismo';
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${days} días`;
};

export default function TeacherDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayStr, setTodayStr] = useState<string>('');
  const [todayTimestamp, setTodayTimestamp] = useState<number>(0);
  const { toast } = useToast();
  const { availabilities, getDayAvailability, updateAvailability } = useBookingStore();
  const { user, allUsers, updateUser } = useAuth();
  const { completions } = useCompletionStore();
  const { settings } = useSettingsStore();
  const db = useFirestore();

  const teacherId = user?.id || ''; 
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>([]);
  const [stagedSlots, setStagedSlots] = useState<Record<string, TimeSlot[]>>({});
  const [copyBuffer, setCopyBuffer] = useState<TimeSlot[] | null>(null);

  const selectedDateKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    setTodayStr(now.toDateString());
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setTodayTimestamp(startOfToday.getTime());
    setSelectedDate(now);
  }, []);

  const activeZones = useMemo(() => settings.zones || FALLBACK_ZONES, [settings]);

  useEffect(() => {
    if (!isOpen) {
      setStagedSlots({});
      setCopyBuffer(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && teacherId) {
      if (stagedSlots[selectedDateKey]) {
        setLocalSlots(JSON.parse(JSON.stringify(stagedSlots[selectedDateKey])));
      } else {
        const data = getDayAvailability(teacherId, selectedDate);
        setLocalSlots(JSON.parse(JSON.stringify(data.slots)));
      }
    }
  }, [selectedDate, isOpen, getDayAvailability, teacherId, stagedSlots]);

  const handleUpdateZone = (zone: string) => {
    updateUser({ currentZone: zone });
    toast({ title: "Ubicación Actualizada 📍", description: `Zona actual: ${zone}.` });
  };

  // Lógica de Plantillas y Copiado
  const handleCopyDay = () => {
    setCopyBuffer(JSON.parse(JSON.stringify(localSlots)));
    toast({ title: "Día Copiado 📋", description: "Puedes pegar este horario en otra fecha." });
  };

  const handlePasteDay = () => {
    if (!copyBuffer) return;
    // Ajustar IDs para que sean únicos pero mantener la estructura
    const pasted = copyBuffer.map(s => ({
      ...s,
      id: Math.random().toString(36).substring(2, 9),
      isBooked: false, // Nunca pegar clases reservadas
      bookedBy: null,
      studentId: null,
      status: 'pending' as const
    }));
    setLocalSlots(pasted);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: pasted }));
    toast({ title: "Horario Pegado ✨", description: "Se ha replicado la configuración." });
  };

  const handleSaveAsTemplate = async () => {
    if (!teacherId) return;
    const templateRef = doc(db, 'settings', `template_${teacherId}`);
    const cleanSlots = localSlots.map(s => ({
      ...s,
      id: Math.random().toString(36).substring(2, 9),
      isBooked: false,
      bookedBy: null,
      studentId: null,
      status: 'pending' as const
    }));
    
    await setDoc(templateRef, { slots: cleanSlots });
    toast({ title: "Plantilla Guardada 💾", description: "Esta configuración es ahora tu predeterminada." });
  };

  const handleLoadTemplate = async () => {
    if (!teacherId) return;
    const templateRef = doc(db, 'settings', `template_${teacherId}`);
    const snap = await getDoc(templateRef);
    
    if (snap.exists()) {
      const templateSlots = snap.data().slots as TimeSlot[];
      const refreshed = templateSlots.map(s => ({ ...s, id: Math.random().toString(36).substring(2, 9) }));
      setLocalSlots(refreshed);
      setStagedSlots(prev => ({ ...prev, [selectedDateKey]: refreshed }));
      toast({ title: "Plantilla Cargada 🚀", description: "Se han aplicado tus horarios favoritos." });
    } else {
      toast({ variant: "destructive", title: "Sin Plantilla", description: "Primero guarda un día como plantilla." });
    }
  };

  const handleLoadAcademyBase = () => {
    const base = INITIAL_SLOTS.map(s => ({
      id: Math.random().toString(36).substring(2, 9),
      time: s,
      isAvailable: true,
      isBooked: false,
      type: 'presencial' as const,
      status: 'pending' as const
    }));
    setLocalSlots(base);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: base }));
    toast({ title: "Horarios Base Cargados 🏢", description: "Configuración de 8 AM a 6 PM aplicada." });
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
    const newSlot: TimeSlot = {
      id: Math.random().toString(36).substring(2, 9),
      time: "08:00 - 09:00",
      isAvailable: true,
      isBooked: false,
      type: 'presencial',
      status: 'pending'
    };
    const updated = [...localSlots, newSlot];
    setLocalSlots(updated);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: updated }));
  };

  const removeSlot = (index: number) => {
    if (localSlots[index].isBooked) {
      toast({ variant: "destructive", title: "Error", description: "No puedes borrar una clase ya reservada." });
      return;
    }
    const newSlots = localSlots.filter((_, i) => i !== index);
    setLocalSlots(newSlots);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: newSlots }));
  };

  const clearAllSlots = () => {
    const bookedSlots = localSlots.filter(s => s.isBooked);
    setLocalSlots(bookedSlots);
    setStagedSlots(prev => ({ ...prev, [selectedDateKey]: bookedSlots }));
    toast({ title: "Día Limpiado 🧹" });
  };

  const handleSaveAvailability = () => {
    if (teacherId) {
      const finalToSave = { ...stagedSlots, [selectedDateKey]: localSlots };
      Object.entries(finalToSave).forEach(([dateStr, slots]) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        updateAvailability(teacherId, dateObj, slots);
      });
      toast({ title: "Disponibilidad Guardada ✅" });
      setIsOpen(false);
      setStagedSlots({});
    }
  };

  const currentDayBookedSlots = useMemo(() => {
    if (!teacherId) return [];
    const data = getDayAvailability(teacherId, selectedDate);
    const now = new Date();
    return data.slots.filter(s => {
      if (!s.isBooked) return false;
      const timeParts = s.time.split(' - ');
      const endTimeStr = timeParts[1]?.trim() || timeParts[0].trim();
      const [h, m] = endTimeStr.split(':').map(Number);
      const slotEndDate = new Date(selectedDate);
      slotEndDate.setHours(h, m, 0, 0);
      return s.status !== 'completed' && now < slotEndDate;
    });
  }, [selectedDate, getDayAvailability, teacherId, availabilities]);

  const trackedStudents = useMemo(() => {
    if (!teacherId) return [];
    const studentsMap = new Map<string, any>();
    availabilities.forEach(day => {
      if (day.teacherId === teacherId) {
        day.slots.forEach(slot => {
          if (slot.isBooked && (slot.studentId || slot.bookedBy)) {
            const rawId = slot.studentId || slot.bookedBy!;
            const studentProfile = allUsers.find(u => u.id === rawId || u.name === slot.bookedBy);
            const actualId = studentProfile?.id || rawId;
            const duration = calculateDuration(slot.time);
            
            let studentData = studentsMap.get(actualId);
            if (!studentData) {
              const resCount = completions.filter(c => String(c.studentId) === String(actualId) && c.isCompleted).length;
              studentData = { id: actualId, name: studentProfile?.name || slot.bookedBy || 'Alumno', instruments: studentProfile?.instruments || [], hoursByInstrument: new Map(), completedResourcesCount: resCount, lastClassTimestamp: 0 };
              studentsMap.set(actualId, studentData);
            }
            if (slot.status === 'completed') {
              let instrument = slot.instrument || studentProfile?.instruments?.[0] || 'Música';
              studentData.hoursByInstrument.set(instrument, (studentData.hoursByInstrument.get(instrument) || 0) + duration);
              try {
                const ts = new Date(`${day.date}T${slot.time.split(' ')[0]}:00`).getTime();
                if (ts > studentData.lastClassTimestamp) studentData.lastClassTimestamp = ts;
              } catch (e) {}
            }
          }
        });
      }
    });
    return Array.from(studentsMap.values());
  }, [availabilities, teacherId, allUsers, completions]);

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
    if (!teacherId) return {};
    const counts: Record<string, number> = {};
    weekDays.forEach(d => {
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const slots = stagedSlots[dStr] || availabilities.find(a => a.teacherId === teacherId && a.date === dStr)?.slots || [];
      const booked = slots.filter(s => s.isBooked).length;
      if (booked > 0) counts[dStr] = booked;
    });
    return counts;
  }, [weekDays, availabilities, teacherId, stagedSlots]);

  const availableSlotsCountMap = useMemo(() => {
    if (!teacherId) return {};
    const counts: Record<string, number> = {};
    weekDays.forEach(d => {
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const slots = stagedSlots[dStr] || availabilities.find(a => a.teacherId === teacherId && a.date === dStr)?.slots || [];
      const count = slots.filter(s => s.isAvailable && !s.isBooked).length;
      if (count > 0) counts[dStr] = count;
    });
    return counts;
  }, [weekDays, availabilities, teacherId, stagedSlots]);

  const totalWeeklyEnabledHours = useMemo(() => {
    if (!teacherId) return 0;
    let total = 0;
    const weekStrings = weekDays.map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    availabilities.forEach(day => {
      if (day.teacherId === teacherId && weekStrings.includes(day.date)) {
        day.slots.forEach(slot => { if (slot.isAvailable || slot.isBooked) total += calculateDuration(slot.time); });
      }
    });
    return total;
  }, [availabilities, teacherId, weekDays]);

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground font-headline tracking-tight">Inicio del Profesor {user?.name?.replace('Prof. ', '')} 🎻</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Gestiona tu agenda y el progreso de tus alumnos.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-card border-2 border-primary/20 rounded-xl px-3 h-12 w-full sm:w-64">
            <MapPinIcon className="w-4 h-4 text-accent shrink-0" />
            <Select value={user?.currentZone || activeZones[0]} onValueChange={handleUpdateZone}>
              <SelectTrigger className="border-none bg-transparent focus:ring-0 font-bold h-full p-0">
                <SelectValue placeholder="Zona actual" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {activeZones.map(zone => (
                  <SelectItem key={zone} value={zone} className="font-bold">{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="bg-accent text-white rounded-xl flex items-center justify-center gap-2 h-12 px-6 shadow-lg shadow-accent/20 hover:scale-105 transition-all font-black w-full sm:w-auto">
                <Clock className="w-5 h-5" /> Gestionar Horarios
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] max-w-5xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
              <DialogHeader className="bg-primary/10 p-6 border-b space-y-2 shrink-0">
                <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                  <CalendarIcon className="w-6 h-6 text-accent" />
                  Gestión de Agenda
                </DialogTitle>
              </DialogHeader>
              
              <div className="p-6 space-y-6 bg-card overflow-y-auto flex-1 max-h-[60vh]">
                <div className="flex flex-col gap-6">
                  {/* Calendario de Selección de Día */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1. Elige el día a configurar</Label>
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
                          <button
                            key={i}
                            disabled={isPast}
                            onClick={() => !isPast && setSelectedDate(d)}
                            className={cn(
                              "flex flex-col items-center py-2 md:py-3 rounded-xl transition-all border-2 relative group",
                              isSelected ? "bg-accent border-accent text-white shadow-md scale-105" : "bg-muted/30 border-primary/10 hover:border-accent/20",
                              isPast && "opacity-40 grayscale pointer-events-none cursor-not-allowed bg-muted border-border"
                            )}
                          >
                            <span className={cn("text-[8px] font-black uppercase", isSelected ? "text-white" : "text-muted-foreground")}>{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
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
                  
                  {/* Panel de Horarios del Día Seleccionado */}
                  <div className="space-y-4 pt-4 border-t border-primary/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="text-base font-black text-foreground capitalize">
                        {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {/* ACCIONES DE LOTE */}
                        <div className="bg-primary/5 p-1 rounded-xl flex gap-1 mr-2 border border-primary/10">
                          <Button size="sm" variant="ghost" onClick={handleCopyDay} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-foreground hover:bg-white dark:hover:bg-slate-800 shadow-sm"><Copy className="w-3 h-3 mr-1" /> Copiar</Button>
                          <Button size="sm" variant="ghost" onClick={handlePasteDay} disabled={!copyBuffer} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-foreground hover:bg-white dark:hover:bg-slate-800 shadow-sm disabled:opacity-30"><Paste className="w-3 h-3 mr-1" /> Pegar</Button>
                        </div>

                        <div className="bg-accent/5 p-1 rounded-xl flex gap-1 border border-accent/10">
                          <Button size="sm" variant="ghost" onClick={handleSaveAsTemplate} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-accent hover:bg-white dark:hover:bg-slate-800 shadow-sm"><Save className="w-3 h-3 mr-1" /> Guardar Plantilla</Button>
                          <Button size="sm" variant="ghost" onClick={handleLoadTemplate} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-accent hover:bg-white dark:hover:bg-slate-800 shadow-sm"><Sparkles className="w-3 h-3 mr-1" /> Cargar Mi Plantilla</Button>
                        </div>

                        <Button size="sm" variant="outline" onClick={handleLoadAcademyBase} className="h-10 rounded-xl border-2 text-[9px] font-black uppercase text-foreground"><Building2 className="w-3.5 h-3.5 mr-1" /> Horarios Base</Button>
                        <Button size="sm" variant="outline" onClick={clearAllSlots} className="h-10 rounded-xl border-destructive/50 text-destructive font-black text-[9px] uppercase"><Eraser className="w-3.5 h-3.5 mr-1" /> Limpiar</Button>
                        <Button size="sm" onClick={addSlot} className="h-10 rounded-xl bg-accent text-white shadow-md font-black text-[9px] uppercase"><Plus className="w-3.5 h-3.5 mr-1" /> Nuevo Turno</Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {localSlots.map((slot, i) => (
                        <div key={slot.id} className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                          slot.isBooked ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200" : slot.isAvailable ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200" : "bg-muted/20 border-border opacity-60"
                        )}>
                          <div className="flex-1 relative">
                            <Input value={slot.time} onChange={(e) => updateSlotTime(i, e.target.value)} disabled={slot.isBooked} className="h-9 pl-3 text-xs rounded-lg font-bold bg-card border-2" />
                            {slot.isBooked && (
                              <div className="flex items-center gap-1 mt-0.5 ml-1">
                                <User className="w-2 h-2 text-orange-600" />
                                <span className="text-[8px] font-black text-orange-600 uppercase">{slot.bookedBy}</span>
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" disabled={slot.isBooked} onClick={() => toggleSlotType(i)} className={cn("h-7 px-2 text-[8px] font-black uppercase rounded-md border", slot.type === 'virtual' ? "text-blue-600 border-blue-200 bg-blue-50" : "text-red-600 border-red-200 bg-red-50")}>
                            {slot.type === 'virtual' ? <Video className="w-3 h-3 mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
                            {slot.type}
                          </Button>
                          <Switch checked={slot.isAvailable || slot.isBooked} disabled={slot.isBooked} onCheckedChange={() => toggleSlotAvailability(i)} />
                          <Button variant="ghost" size="icon" onClick={() => removeSlot(i)} disabled={slot.isBooked} className="h-7 w-7 text-foreground"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/30 border-t flex gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl flex-1 h-12 font-black">Cancelar</Button>
                <Button onClick={handleSaveAvailability} className="bg-accent text-white rounded-xl flex-1 h-12 font-black gap-2">Confirmar y Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-2 border-blue-600 dark:border-blue-400 shadow-sm bg-blue-50/50 dark:bg-blue-900/30 p-3 sm:p-4">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">Mis Alumnos Activos</p>
          <div className="text-2xl sm:text-3xl font-black text-blue-900 dark:text-blue-100 mt-1">{trackedStudents.length}</div>
        </Card>
        <Card className="rounded-2xl border-2 border-emerald-600 dark:border-emerald-400 shadow-sm bg-emerald-50/50 dark:bg-blue-900/30 p-3 sm:p-4">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-blue-300 leading-tight">Horas Semanales Habilitadas</p>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-100 mt-1">{totalWeeklyEnabledHours.toFixed(1)} h</div>
        </Card>
        <Card className="rounded-2xl border-2 border-accent/80 shadow-sm bg-accent/5 dark:bg-accent/10 p-3 sm:p-4">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-accent-foreground">Materiales disponibles</p>
          <div className="text-2xl sm:text-3xl font-black text-accent mt-1">12</div>
        </Card>
        <Card className="rounded-2xl border-2 border-primary-foreground/40 dark:border-primary/40 shadow-sm bg-secondary/30 p-3 sm:p-4">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-foreground/80 leading-tight">Total de horas ejercidas</p>
          <div className="text-2xl sm:text-3xl font-black text-foreground mt-1">
            {Math.round(trackedStudents.reduce((acc, s) => {
              let h = 0;
              s.hoursByInstrument.forEach(val => h += val);
              return acc + h;
            }, 0))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] border-2 border-primary/20 shadow-md overflow-hidden bg-card">
          <CardHeader className="bg-accent/5 p-4 border-b">
            <CardTitle className="text-base flex items-center gap-2 font-black text-foreground">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Sesiones Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentDayBookedSlots.length > 0 ? (
              currentDayBookedSlots.map((cls, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 border-border hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="font-black text-xs text-foreground">{cls.time.split(' ')[0]}</div>
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate text-foreground">{cls.bookedBy}</div>
                      <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                        <Music className="w-2.5 h-2.5" /> {cls.instrument || 'Música'}
                      </div>
                    </div>
                  </div>
                  <Badge className={cn(
                    "rounded-full px-2 py-0 text-[8px] font-black uppercase",
                    cls.type === 'virtual' ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                  )}>
                    {cls.type === 'virtual' ? 'Online' : (cls.zone || 'Sede')}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground italic text-xs font-medium">
                <p>Sin sesiones pendientes.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-[2rem] border-2 border-primary/20 shadow-md overflow-hidden bg-card">
          <CardHeader className="bg-primary/5 p-6 border-b">
            <CardTitle className="flex items-center gap-2 font-black text-xl text-foreground">
              <GraduationCap className="w-6 h-6 text-accent" />
              Seguimiento de Alumnos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {trackedStudents.length > 0 ? trackedStudents.map((student) => (
              <div key={student.id} className="flex flex-col gap-4 p-4 rounded-3xl border border-primary/10 bg-card hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-accent shrink-0 shadow-sm">
                      <AvatarImage src={`https://picsum.photos/seed/${student.id}/100`} />
                      <AvatarFallback className="bg-primary text-secondary-foreground font-black">{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-black text-lg text-foreground truncate leading-tight">{student.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">Resumen Académico</p>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1">
                        Última clase: <span className="text-accent">{formatTimeAgo(student.lastClassTimestamp)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 bg-accent/5 px-3 py-1.5 rounded-xl border border-accent/10">
                      <span className="text-[9px] font-black uppercase tracking-widest text-accent">Recursos Completados:</span>
                      <span className="text-xs font-black text-foreground">{student.completedResourcesCount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {student.instruments.map(inst => {
                    const hours = student.hoursByInstrument.get(inst) || 0;
                    const emoji = INSTRUMENT_EMOJIS[inst] || '🎵';
                    return (
                      <div key={inst} className="bg-primary/5 rounded-2xl p-2 px-3 flex items-center justify-between border border-primary/5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm">{emoji}</span>
                          <span className="text-xs font-bold text-foreground truncate">{inst}</span>
                        </div>
                        <Badge variant="secondary" className="bg-accent text-white rounded-lg px-2 py-0.5 text-[10px] font-black shadow-sm shrink-0 ml-1">
                          {hours.toFixed(1)} h
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )) : (
              <div className="py-20 text-center">
                <GraduationCap className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold italic">No hay alumnos con clases registradas todavía.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
