
"use client"

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useBookingStore } from '@/lib/booking-store';
import { useSkillsStore } from '@/lib/skills-store';
import { useResourceStore } from '@/lib/resource-store';
import { useMilestonesStore, UserMilestone } from '@/lib/milestones-store';
import { DEFAULT_SKILLS_CONFIG } from '@/lib/skills-config';
import { 
  Star, TrendingUp, Music, CheckCircle2, Trophy, Target, Clock, 
  ShieldCheck, Star as StarIcon, Info, Plus, Edit2, Trash2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const normalizeStr = (s: string) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

const getLevelInfo = (inst: string, points: number) => {
  const getBaseName = (p: number, i: string) => {
    if (i === 'Teoría') {
      if (p >= 9000) return 'Sabio de la Composición';
      if (p >= 6200) return 'Virtuoso de la Estructura';
      if (p >= 4000) return 'Maestro del Solfeo';
      if (p >= 2300) return 'Arquitecto de Sonidos';
      if (p >= 1000) return 'Explorador del Pentagrama';
      return 'Aprendiz de Armonía';
    }
    const suffix = i === 'Batería' ? 'ista' : i === 'Piano' ? 'ista' : i === 'Guitarra' ? 'ista' : i === 'Violín' ? 'ista' : i === 'Canto' ? 'ante' : 'ista';
    const artist = i.replace(/a$|o$/, '') + suffix;

    if (p >= 9000) return 'Maestro joven';
    if (p >= 6200) return `Virtuoso con la ${i}`;
    if (p >= 4000) return `${artist} Preparado`;
    if (p >= 2300) return `${artist} en formación`;
    if (p >= 1000) return `Entusiasta de ${i}`;
    return `Aprendiz de ${i}`;
  };

  const levelNum = points >= 9000 ? 6 : points >= 6200 ? 5 : points >= 4000 ? 4 : points >= 2300 ? 3 : points >= 1000 ? 2 : 1;
  return { name: getBaseName(points, inst), level: levelNum };
};

function ProgressContent() {
  const { user, allUsers } = useAuth();
  const { completions } = useCompletionStore();
  const { availabilities } = useBookingStore();
  const { updateSkill, getSkillLevel } = useSkillsStore();
  const { resources } = useResourceStore();
  const { 
    addMilestone, 
    updateMilestone, 
    deleteMilestone, 
    toggleMilestoneAchieved, 
    getStudentMilestones, 
    getAchievedCount 
  } = useMilestonesStore();
  
  const searchParams = useSearchParams();
  const queryStudentId = searchParams.get('studentId');
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // Milestone Dialog State
  const [isMDialogOpen, setIsMDialogOpen] = useState(false);
  const [editingM, setEditingM] = useState<UserMilestone | null>(null);
  const [mTitle, setMTitle] = useState('');
  const [mDate, setMDate] = useState('');
  const [mAchieved, setMAchieved] = useState(false);

  const isStaff = user?.role === 'teacher' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';
  
  const students = useMemo(() => allUsers.filter(u => u.role === 'student'), [allUsers]);

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      if (isStaff) {
        if (queryStudentId) {
          setSelectedStudentId(queryStudentId);
        } else if (!selectedStudentId && students.length > 0) {
          setSelectedStudentId(students[0].id);
        }
      } else {
        setSelectedStudentId(user.id);
      }
    }
  }, [user, isStaff, students, selectedStudentId, queryStudentId]);

  const currentStudent = useMemo(() => {
    if (isStaff) return students.find(s => s.id === selectedStudentId);
    return user ? { id: user.id, name: user.name, instruments: user.instruments || [] } : null;
  }, [selectedStudentId, isStaff, user, students]);

  useEffect(() => {
    if (currentStudent) {
      if (currentStudent.instruments && currentStudent.instruments.length > 0) {
        if (!selectedInstrument || !currentStudent.instruments.includes(selectedInstrument)) {
          setSelectedInstrument(currentStudent.instruments[0]);
        }
      } else {
        setSelectedInstrument('Teoría');
      }
    }
  }, [currentStudent, selectedInstrument]);

  const instrumentStats = useMemo(() => {
    if (!currentStudent) return {};
    const stats: Record<string, { points: number; completedHours: number; levelName: string; levelNum: number }> = {};
    
    const studentInstruments = [...(currentStudent.instruments || []), 'Teoría'];
    const uniqueInstruments = Array.from(new Set(studentInstruments));

    uniqueInstruments.forEach(cat => {
      let points = 0;
      let completedHours = 0;

      completions.forEach(comp => {
        if (comp.isCompleted && String(comp.studentId) === String(currentStudent.id)) {
          const resource = resources.find(r => r.id === comp.resourceId);
          if (resource) {
            const isTarget = normalizeStr(resource.category) === normalizeStr(cat);
            if (isTarget) {
              points += 150;
            }
          }
        }
      });

      if (Array.isArray(availabilities)) {
        availabilities.forEach(avail => {
          if (avail.slots && Array.isArray(avail.slots)) {
            avail.slots.forEach(slot => {
              if (slot.isBooked && slot.status === 'completed') {
                const isSameId = slot.studentId && String(slot.studentId) === String(currentStudent.id);
                const isSameName = slot.bookedBy && normalizeStr(slot.bookedBy) === normalizeStr(currentStudent.name || '');
                
                if (isSameId || isSameName) {
                  const slotInst = slot.instrument || 'Música';
                  const normSlotInst = normalizeStr(slotInst);
                  const normCat = normalizeStr(cat);
                  
                  let matchesInstrument = normSlotInst === normCat;
                  
                  if (!matchesInstrument && (normSlotInst === 'musica' || normSlotInst === 'música')) {
                    const primaryInst = currentStudent.instruments?.[0] || 'Teoría';
                    if (normalizeStr(primaryInst) === normCat) {
                      matchesInstrument = true;
                    }
                  }

                  if (matchesInstrument) {
                    const duration = calculateDuration(slot.time);
                    points += Math.round(duration * 20);
                    completedHours += duration;
                  }
                }
              }
            });
          }
        });
      }

      const skillConfigs = DEFAULT_SKILLS_CONFIG[cat] || [];
      skillConfigs.forEach(sc => {
        const level = getSkillLevel(currentStudent.id, cat, sc.name, sc.defaultLevel);
        points += (level * 10);
      });

      const levelInfo = getLevelInfo(cat, points);
      stats[cat] = { points, completedHours, levelName: levelInfo.name, levelNum: levelInfo.level };
    });

    return stats;
  }, [completions, availabilities, currentStudent, getSkillLevel, resources]);

  const totalAchievementPoints = useMemo(() => {
    const basePoints = Object.values(instrumentStats).reduce((sum, s) => sum + (s?.points || 0), 0);
    const milestonePoints = currentStudent ? getAchievedCount(currentStudent.id) * 200 : 0;
    return basePoints + milestonePoints;
  }, [instrumentStats, currentStudent, getAchievedCount]);

  const currentSkills = useMemo(() => {
    if (!currentStudent || !selectedInstrument) return [];
    const configs = DEFAULT_SKILLS_CONFIG[selectedInstrument] || DEFAULT_SKILLS_CONFIG['Teoría'];
    return configs.map(sc => ({
      ...sc,
      level: getSkillLevel(currentStudent.id, selectedInstrument, sc.name, sc.defaultLevel)
    }));
  }, [currentStudent, selectedInstrument, getSkillLevel]);

  const studentMilestones = useMemo(() => {
    return currentStudent ? getStudentMilestones(currentStudent.id) : [];
  }, [currentStudent, getStudentMilestones]);

  const achievedMilestonesCount = useMemo(() => {
    return currentStudent ? getAchievedCount(currentStudent.id) : 0;
  }, [currentStudent, getAchievedCount]);

  const openAddM = () => {
    setEditingM(null);
    setMTitle('');
    setMDate('');
    setMAchieved(false);
    setIsMDialogOpen(true);
  };

  const openEditM = (m: UserMilestone) => {
    setEditingM(m);
    setMTitle(m.milestoneTitle);
    setMDate(m.date || '');
    setMAchieved(m.achieved);
    setIsMDialogOpen(true);
  };

  const handleSaveM = () => {
    if (!currentStudent) return;
    if (editingM) {
      updateMilestone(editingM.id, { milestoneTitle: mTitle, date: mDate, achieved: mAchieved });
    } else {
      addMilestone(currentStudent.id, mTitle, mDate, mAchieved);
    }
    setIsMDialogOpen(false);
  };

  if (!isMounted || !user) return null;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground font-headline tracking-tight">
              {isStaff ? 'Seguimiento del Alumno 👩‍🏫' : 'Mi Viaje de Aprendizaje 🚀'}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">Visualizando el crecimiento musical y logros.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {isStaff && (
              <Card className="rounded-[2rem] border-2 border-accent/20 p-2 pl-4 flex items-center gap-4 bg-card shadow-sm">
                <ShieldCheck className="w-8 h-8 text-accent shrink-0" />
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="w-64 h-12 rounded-xl border-none font-black text-xl text-foreground focus:ring-0">
                    <SelectValue placeholder="Seleccionar Alumno" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id} className="font-bold text-lg">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>
            )}
            
            <Card className="rounded-[2rem] border-none shadow-xl bg-accent text-white px-8 py-4 flex items-center gap-4 shrink-0">
              <Trophy className="w-8 h-8" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Puntos Globales</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-white/70 cursor-help hover:text-white transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="rounded-[1.5rem] p-4 max-w-xs bg-card text-foreground border-2 border-accent/20 shadow-xl">
                        <p className="font-black text-xs mb-2 uppercase tracking-widest text-accent">Tu Puntuación Total</p>
                        <ul className="text-[11px] font-bold space-y-2 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1" />
                            <span><b>Puntos de Instrumentos:</b> La suma de tus logros en todas tus clases.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1" />
                            <span><b>Hitos desbloqueados:</b> +200 pts por cada Hito de Carrera que un docente te asigne.</span>
                          </li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <h2 className="text-2xl font-black">{totalAchievementPoints.toLocaleString()} pts</h2>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-accent rounded-full" />
                <h2 className="text-2xl font-black text-foreground">Habilidades y Nivel</h2>
              </div>
              
              <div className="w-full md:w-64">
                <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                  <SelectTrigger className="h-12 rounded-2xl border-2 font-black text-foreground bg-card shadow-sm">
                    <SelectValue placeholder="Instrumento" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {Array.from(new Set([...(currentStudent?.instruments || []), 'Teoría'])).map(inst => (
                      <SelectItem key={inst} value={inst} className="font-bold py-3">{inst}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-secondary/20 dark:bg-secondary/10 p-8 flex flex-col items-center text-center space-y-4">
                <Target className="w-10 h-10 text-foreground" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rango en {selectedInstrument}</p>
                  <h4 className="font-black text-xl text-foreground mt-1">
                    {instrumentStats[selectedInstrument]?.levelName || 'Aprendiz'} (Nv. {instrumentStats[selectedInstrument]?.levelNum || 1})
                  </h4>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-sm bg-accent/5 dark:bg-accent/10 p-8 flex flex-col items-center text-center space-y-4">
                <div className="flex flex-col items-center w-full">
                  <Music className="w-10 h-10 text-accent mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent/70">Puntos de {selectedInstrument}</p>
                  <h4 className="font-black text-2xl text-accent mt-1">{(instrumentStats[selectedInstrument]?.points || 0).toLocaleString()} pts</h4>
                  
                  <div className="mt-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-7 h-7 text-accent/50 cursor-help hover:text-accent transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="rounded-[1.5rem] p-4 max-w-xs bg-card border-2 border-accent/20 shadow-xl">
                          <p className="font-black text-xs text-foreground mb-2 uppercase tracking-widest">¿Cómo sumas puntos?</p>
                          <ul className="text-[11px] font-bold space-y-2 text-muted-foreground text-left">
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1" />
                              <span><b>Recursos:</b> +150 pts por material completado en la biblioteca.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1" />
                              <span><b>Clases:</b> +20 pts por cada hora de clase asistida y validada.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1" />
                              <span><b>Habilidades:</b> +10 pts por cada punto porcentual de evolución técnica.</span>
                            </li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-sm bg-blue-50 dark:bg-blue-950/20 p-8 flex flex-col items-center text-center space-y-4">
                <Clock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-700/70 dark:text-blue-400/70">Horas de Clase con {selectedInstrument}</p>
                  <h4 className="font-black text-2xl text-blue-800 dark:text-blue-300 mt-1">{(instrumentStats[selectedInstrument]?.completedHours || 0).toFixed(1)} h</h4>
                </div>
              </Card>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-card">
              <CardHeader className="bg-primary/5 p-8 border-b">
                <CardTitle className="flex items-center gap-3 font-black text-xl text-foreground">
                  <TrendingUp className="w-6 h-6 text-accent" />
                  Evolución Técnica: {selectedInstrument}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                {currentSkills.map((skill, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex justify-between items-center font-black">
                      <span className="text-lg text-foreground">{skill.name}</span>
                      <span className="text-accent bg-accent/10 px-4 py-1 rounded-full text-sm font-black">{skill.level}%</span>
                    </div>
                    
                    {isStaff ? (
                      <div className="flex items-center gap-6">
                        <Slider 
                          value={[skill.level]} 
                          max={100} 
                          step={1} 
                          className="flex-1"
                          onValueChange={(vals) => updateSkill(currentStudent!.id, selectedInstrument, skill.name, vals[0])}
                        />
                        <span className="text-[10px] font-black text-accent w-10 uppercase tracking-widest">Editar</span>
                      </div>
                    ) : (
                      <Progress value={skill.level} className="h-4 rounded-full bg-primary/10" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-accent rounded-full" />
              <h2 className="text-2xl font-black text-foreground">Trayectoria</h2>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-md bg-card">
              <CardHeader className="p-8 border-b bg-muted/30 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3 font-black text-xl text-foreground">
                  <StarIcon className="w-8 h-8 text-accent fill-accent" />
                  Hitos de Carrera
                </CardTitle>
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <Button 
                      size="icon" 
                      className="rounded-full bg-accent text-white h-10 w-10 shadow-md hover:scale-110 transition-transform"
                      onClick={openAddM}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  )}
                  <Badge className="bg-accent text-white rounded-full font-black px-6 py-3 text-xl shadow-lg shadow-accent/20">
                    {achievedMilestonesCount}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {studentMilestones.length > 0 ? studentMilestones.map((m, i) => (
                  <div key={m.id} className="flex gap-5 items-start group">
                    <div className={cn(
                      "mt-1 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all",
                      m.achieved 
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                        : "bg-muted/30 border-dashed border-muted-foreground/20 text-muted-foreground/40"
                    )}>
                      {m.achieved ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "font-black text-lg leading-tight",
                          m.achieved ? "text-foreground" : "text-muted-foreground/60"
                        )}>
                          {m.milestoneTitle}
                        </div>
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-accent" onClick={() => openEditM(m)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive" onClick={() => deleteMilestone(m.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {isStaff && currentStudent && (
                            <Switch 
                              checked={m.achieved}
                              onCheckedChange={() => toggleMilestoneAchieved(m.id)}
                              className="scale-75 data-[state=checked]:bg-emerald-500"
                            />
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-muted-foreground">{m.achieved ? (m.date || 'Sin fecha') : 'Pendiente de asignación'}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10">
                    <StarIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground font-bold italic">No hay hitos asignados todavía.</p>
                    {isAdmin && (
                      <Button variant="link" className="text-accent font-black mt-2 underline" onClick={openAddM}>
                        Asignar primer hito
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isMDialogOpen} onOpenChange={setIsMDialogOpen}>
        <DialogContent className="rounded-[2rem] max-w-md border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-primary/10 p-8 border-b">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Trophy className="w-6 h-6 text-accent" />
              {editingM ? 'Editar Hito' : 'Nuevo Hito'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">Define un logro para la carrera musical del alumno.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6 bg-card">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Título del Hito</Label>
              <Input 
                value={mTitle} 
                onChange={(e) => setMTitle(e.target.value)}
                placeholder="Ej: Nivel 1 Completado"
                className="h-12 rounded-xl border-2 font-bold focus:border-accent text-foreground bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fecha (opcional)</Label>
              <Input 
                value={mDate} 
                onChange={(e) => setMDate(e.target.value)}
                placeholder="Ej: Oct 2023"
                className="h-12 rounded-xl border-2 font-bold focus:border-accent text-foreground bg-card"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border-2 border-primary/10">
              <div className="space-y-0.5">
                <Label className="text-sm font-black text-foreground">Estado del Hito</Label>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">¿Ya ha sido alcanzado?</p>
              </div>
              <Switch 
                checked={mAchieved} 
                onCheckedChange={setMAchieved}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/30 border-t flex gap-3">
            <Button variant="outline" className="rounded-xl flex-1 h-12 font-black text-foreground" onClick={() => setIsMDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-accent text-white rounded-xl flex-1 h-12 font-black shadow-lg shadow-accent/20" onClick={handleSaveM}>Guardar Hito</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={null}>
      <ProgressContent />
    </Suspense>
  );
}
