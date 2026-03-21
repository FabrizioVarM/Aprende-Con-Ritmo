
"use client"

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useBookingStore } from '@/lib/booking-store';
import { useSkillsStore } from '@/lib/skills-store';
import { useResourceStore } from '@/lib/resource-store';
import { useMilestonesStore, UserMilestone } from '@/lib/milestones-store';
import { useSettingsStore, DEFAULT_RANKS, RankConfig } from '@/lib/settings-store';
import { DEFAULT_SKILLS_CONFIG } from '@/lib/skills-config';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  TrendingUp, 
  Music, 
  CheckCircle2, 
  Trophy, 
  Clock, 
  ShieldCheck, 
  Star as StarIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  Zap, 
  Flame, 
  Crown, 
  GraduationCap, 
  ChevronRight, 
  LayoutGrid, 
  Info, 
  Search, 
  Activity, 
  Cpu,
  Sparkles,
  HelpCircle,
  Shapes,
  Settings,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getDirectImageUrl } from '@/lib/utils/images';
import Image from 'next/image';

const INSTRUMENT_TITLES: Record<string, string> = {
  'Guitarra': 'Guitarrista',
  'Piano': 'Tecladista',
  'Bajo': 'Bajista',
  'Violín': 'Violinista',
  'Batería': 'Baterista',
  'Canto': 'Cantante',
  'Teoría': 'Teórico',
};

const calculateDuration = (timeStr: string): number => {
  try {
    const [start, end] = timeStr.split(' - ');
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const startMinutes = h1 * 60 + m1;
    const endMinutes = h2 * 60 + m2;
    return (endMinutes - startMinutes) / 60;
  } catch (e) { return 1; }
};

const normalizeStr = (s: string) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

const AnimatedNumber = ({ value }: { value: number }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame: number;
    const startTime = performance.now();
    const duration = 1500;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const nextValue = Math.floor(easedProgress * value);
      setCurrent(nextValue);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const displayValue = current === 100 ? "100" : current.toString().padStart(2, '0');
  return <>{displayValue}%</>;
};

function ProgressContent() {
  const { user, allUsers } = useAuth();
  const { completions } = useCompletionStore();
  const { availabilities } = useBookingStore();
  const { updateSkill, getSkillLevel } = useSkillsStore();
  const { resources } = useResourceStore();
  const { settings, updateSettings } = useSettingsStore();
  const { toast } = useToast();
  const { 
    addMilestone, 
    updateMilestone, 
    deleteMilestone, 
    getStudentMilestones, 
    getAchievedCount 
  } = useMilestonesStore();
  
  const searchParams = useSearchParams();
  const queryStudentId = searchParams.get('studentId');
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  const [isRanksDialogOpen, setIsRanksDialogOpen] = useState(false);
  const [tempRanks, setTempRanks] = useState<RankConfig[]>([]);

  const [isMDialogOpen, setIsMDialogOpen] = useState(false);
  const [editingM, setEditingM] = useState<UserMilestone | null>(null);
  const [mTitle, setMTitle] = useState('');
  const [mDate, setMDate] = useState('');
  const [mAchieved, setMAchieved] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const isStaff = user?.role === 'teacher' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';
  
  const students = useMemo(() => allUsers.filter(u => u.role === 'student'), [allUsers]);

  const currentRanks = useMemo(() => {
    if (selectedInstrument && settings.instrumentRanks?.[selectedInstrument]) {
      return settings.instrumentRanks[selectedInstrument];
    }
    return settings.ranks || DEFAULT_RANKS;
  }, [settings.ranks, settings.instrumentRanks, selectedInstrument]);

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

  useEffect(() => {
    if (isRanksDialogOpen) {
      setTempRanks(JSON.parse(JSON.stringify(currentRanks)));
    }
  }, [isRanksDialogOpen, currentRanks]);

  const currentStudent = useMemo(() => {
    if (isStaff) return students.find(s => s.id === selectedStudentId);
    return user ? { ...user } : null;
  }, [selectedStudentId, isStaff, user, students]);

  useEffect(() => {
    if (currentStudent) {
      const studentInstruments = Array.from(new Set([...(currentStudent.instruments || []), 'Teoría']));
      if (!selectedInstrument || !studentInstruments.includes(selectedInstrument)) {
        setSelectedInstrument(studentInstruments[0]);
      }
    }
  }, [currentStudent, selectedInstrument]);

  const instrumentStats = useMemo(() => {
    if (!currentStudent) return {};
    const stats: Record<string, { points: number; completedHours: number; rank: RankConfig, nextRank: RankConfig | null }> = {};
    
    const studentInstruments = Array.from(new Set([...(currentStudent.instruments || []), 'Teoría']));

    studentInstruments.forEach(cat => {
      let points = 0;
      let completedHours = 0;

      completions.forEach(comp => {
        if (comp.isCompleted && String(comp.studentId) === String(currentStudent.id)) {
          const resource = resources.find(r => r.id === comp.resourceId);
          if (resource && normalizeStr(resource.category) === normalizeStr(cat)) points += 150;
        }
      });

      availabilities.forEach(avail => {
        avail.slots.forEach(slot => {
          if (slot.isBooked && slot.status === 'completed' && (String(slot.studentId) === String(currentStudent.id) || normalizeStr(slot.bookedBy || '') === normalizeStr(currentStudent.name || ''))) {
            const slotInst = slot.instrument || 'Música';
            let matches = normalizeStr(slotInst) === normalizeStr(cat);
            if (!matches && (normalizeStr(slotInst) === 'musica' || normalizeStr(slotInst) === 'música')) {
              if (normalizeStr(currentStudent.instruments?.[0] || 'Teoría') === normalizeStr(cat)) matches = true;
            }
            if (matches) {
              const duration = calculateDuration(slot.time);
              points += Math.round(duration * 20);
              completedHours += duration;
            }
          }
        });
      });

      const skillConfigs = DEFAULT_SKILLS_CONFIG[cat] || DEFAULT_SKILLS_CONFIG['Teoría'] || [];
      skillConfigs.forEach(sc => {
        points += (getSkillLevel(currentStudent.id, cat, sc.name, sc.defaultLevel) * 10);
      });

      // Obtener los rangos correctos para el cálculo de este instrumento específico
      const ranksForInst = (settings.instrumentRanks && settings.instrumentRanks[cat]) ? settings.instrumentRanks[cat] : (settings.ranks || DEFAULT_RANKS);

      let currentRank = ranksForInst[0];
      let nextRank = null;
      for (let i = ranksForInst.length - 1; i >= 0; i--) {
        if (points >= ranksForInst[i].min) {
          currentRank = ranksForInst[i];
          nextRank = ranksForInst[i + 1] || null;
          break;
        }
      }
      stats[cat] = { points, completedHours, rank: currentRank, nextRank };
    });
    return stats;
  }, [completions, availabilities, currentStudent, getSkillLevel, resources, settings.ranks, settings.instrumentRanks]);

  const currentInstData = useMemo(() => {
    return instrumentStats[selectedInstrument] || { points: 0, completedHours: 0, rank: currentRanks[0], nextRank: currentRanks[1] };
  }, [instrumentStats, selectedInstrument, currentRanks]);

  const pathProgress = useMemo(() => {
    const points = currentInstData.points;
    const totalNodes = currentRanks.length;
    
    let segmentIndex = 0;
    for (let i = 0; i < totalNodes - 1; i++) {
      if (points >= currentRanks[i].min && points < currentRanks[i+1].min) {
        segmentIndex = i;
        break;
      }
      if (i === totalNodes - 2 && points >= currentRanks[totalNodes - 1].min) {
        segmentIndex = totalNodes - 1;
      }
    }

    if (segmentIndex >= totalNodes - 1) {
      return 100;
    }

    const segmentStart = currentRanks[segmentIndex].min;
    const segmentEnd = currentRanks[segmentIndex + 1].min;
    const segmentRange = segmentEnd - segmentStart;
    const segmentProgress = (points - segmentStart) / segmentRange;
    
    const totalProgress = (segmentIndex + segmentProgress) / (totalNodes - 1);
    return totalProgress * 100;
  }, [currentInstData.points, currentRanks]);

  useEffect(() => {
    if (isMounted && scrollRef.current && pathProgress !== undefined) {
      const timer = setTimeout(() => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const contentWidth = container.scrollWidth;
        const viewportWidth = container.clientWidth;
        const padding = viewportWidth * 0.25; 
        const pathWidth = contentWidth - (padding * 2);
        const markerX = padding + (pathWidth * (pathProgress / 100));
        const targetScroll = markerX - (viewportWidth / 2);
        
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isMounted, selectedInstrument, selectedStudentId, pathProgress]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => { setIsDragging(false); };
  const handleMouseUp = () => { setIsDragging(false); };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const totalGlobalPoints = useMemo(() => {
    const basePoints = Object.values(instrumentStats).reduce((sum, s) => sum + (s?.points || 0), 0);
    const milestonePoints = currentStudent ? getAchievedCount(currentStudent.id) * 200 : 0;
    return basePoints + milestonePoints;
  }, [instrumentStats, currentStudent, getAchievedCount]);

  const currentSkills = useMemo(() => {
    if (!currentStudent || !selectedInstrument) return [];
    const configs = DEFAULT_SKILLS_CONFIG[selectedInstrument] || DEFAULT_SKILLS_CONFIG['Teoría'] || [];
    return configs.map(sc => ({
      ...sc,
      level: getSkillLevel(currentStudent.id, selectedInstrument, sc.name, sc.defaultLevel)
    }));
  }, [currentStudent, selectedInstrument, getSkillLevel]);

  const studentMilestones = useMemo(() => {
    return currentStudent ? getStudentMilestones(currentStudent.id) : [];
  }, [currentStudent, getStudentMilestones]);

  const handleSaveM = () => {
    if (!currentStudent) return;
    if (editingM) {
      updateMilestone(editingM.id, { milestoneTitle: mTitle, date: mDate, achieved: mAchieved });
    } else {
      addMilestone(currentStudent.id, mTitle, mDate, mAchieved);
    }
    setIsMDialogOpen(false);
  };

  const handleSaveRanks = () => {
    // Guardar rangos independientes para el instrumento seleccionado
    const updatedInstrumentRanks = { ...(settings.instrumentRanks || {}) };
    updatedInstrumentRanks[selectedInstrument] = tempRanks;
    
    updateSettings({ instrumentRanks: updatedInstrumentRanks });
    setIsRanksDialogOpen(false);
    toast({ title: "Sectores Actualizados ✨", description: `Configuración guardada para ${selectedInstrument}.` });
  };

  const getRankDisplayName = (baseName: string, instrument: string) => {
    const title = INSTRUMENT_TITLES[instrument] || 'Músico';
    return `${title} ${baseName}`;
  };

  if (!isMounted || !user) return null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#020617] -m-4 md:-m-8 lg:-m-12 p-4 md:p-12 relative overflow-hidden text-slate-100 selection:bg-accent selection:text-white">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[150px] animate-pulse [animation-delay:2s]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="lg:col-span-7 flex flex-col md:flex-row items-center gap-10">
              <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-accent rounded-[3.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                <div className="rounded-[3.5rem] bg-slate-900/40 border border-white/10 backdrop-blur-3xl px-10 py-8 flex items-center gap-6 shadow-2xl relative overflow-hidden">
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="absolute top-6 left-6 text-slate-500 hover:text-accent transition-colors outline-none">
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 rounded-[2.5rem] bg-slate-900 border-white/10 text-slate-200 p-8 shadow-2xl z-50">
                      <div className="space-y-6">
                        <h4 className="font-black text-sm uppercase tracking-widest text-accent flex items-center gap-3">
                          <Sparkles className="w-4 h-4" /> Protocolo de EXP
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest border-b border-white/5 pb-1 flex items-center gap-2">
                              <Music className="w-2.5 h-2.5" /> Puntos por Especialidad
                            </p>
                            <p className="text-[8px] font-black text-slate-500 uppercase italic">Estos puntos suman al instrumento Y al global.</p>
                            <div className="space-y-2.5">
                              <div className="flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shadow-[0_0_5px_#3b82f6]" />
                                <p className="text-10px font-bold leading-snug"><span className="text-white">Materiales (+150):</span> Al completar recursos de biblioteca.</p>
                              </div>
                              <div className="flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shadow-[0_0_5px_#3b82f6]" />
                                <p className="text-10px font-bold leading-snug"><span className="text-white">Clases (+20/h):</span> Por cada hora de lección asistida.</p>
                              </div>
                              <div className="flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shadow-[0_0_5px_#3b82f6]" />
                                <p className="text-10px font-bold leading-snug"><span className="text-white">Habilidades (+10):</span> Por cada % de avance técnico.</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <p className="text-[9px] font-black uppercase text-accent tracking-widest border-b border-white/5 pb-1 flex items-center gap-2">
                              <Trophy className="w-2.5 h-2.5" /> Puntos Globales Únicos
                            </p>
                            <div className="flex gap-3 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1 shadow-[0_0_5px_#FF8B7A]" />
                              <p className="text-10px font-bold leading-snug"><span className="text-white">Hitos (+200):</span> Logros históricos de trayectoria.</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-[8px] font-black uppercase text-slate-500 text-center pt-2 border-t border-white/5">Sincronización en tiempo real.</p>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <div className="relative">
                    <Trophy className="w-14 h-14 text-accent drop-shadow-[0_0_15px_rgba(255,139,122,0.6)]" />
                    <div className="absolute -top-2 -right-2 bg-white text-accent rounded-full p-1 shadow-lg border-2 border-accent">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">Global Experience</p>
                    <h2 className="text-6xl font-black tabular-nums tracking-tighter leading-none text-white">{totalGlobalPoints.toLocaleString()}</h2>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="flex flex-wrap gap-2 items-center">
                  {isStaff && (
                    <div className="bg-white/5 border border-white/10 p-1 rounded-2xl flex items-center backdrop-blur-md shadow-inner">
                      <Search className="w-3.5 h-3.5 text-accent ml-3" />
                      <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                        <SelectTrigger className="w-44 h-9 rounded-xl border-none bg-transparent font-black text-slate-300 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[10px] uppercase tracking-[0.2em] shadow-none outline-none">
                          <SelectValue placeholder="Alumno" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl bg-slate-900 border-white/10 text-white">
                          {students.map(s => (
                            <SelectItem key={s.id} value={s.id} className="font-bold text-xs">{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="bg-white/5 border border-white/10 p-1 rounded-2xl flex items-center backdrop-blur-md shadow-inner">
                    <LayoutGrid className="w-3.5 h-3.5 text-blue-400 ml-3" />
                    <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                      <SelectTrigger className="w-44 h-9 rounded-xl border-none bg-transparent font-black text-slate-300 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[10px] uppercase tracking-[0.2em] shadow-none outline-none [&>span]:w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl bg-slate-900 border-white/10 text-white min-w-[240px] p-1">
                        {Array.from(new Set([...(currentStudent?.instruments || []), 'Teoría'])).map(inst => {
                          const pts = instrumentStats[inst]?.points || 0;
                          return (
                            <SelectItem key={inst} value={inst} className="font-bold text-[10px] py-3 uppercase tracking-widest rounded-xl cursor-pointer [&>span]:w-full">
                              <div className="flex items-center justify-between w-full pr-2">
                                <span className="flex-1 truncate text-left">{inst}</span>
                                <Badge variant="secondary" className="bg-accent/20 text-accent border-none text-[8px] px-2 h-5 font-black shrink-0 ml-4 tabular-nums">
                                  {pts.toLocaleString()} XP
                                </Badge>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl border-accent/20 text-accent hover:bg-accent/10 font-black h-9 text-[10px] uppercase"
                      onClick={() => setIsRanksDialogOpen(true)}
                    >
                      <Settings className="w-3.5 h-3.5 mr-2" /> Sectores
                    </Button>
                  )}
                </div>
                
                <div className="px-1">
                  <h1 className="text-4xl font-black text-white font-headline tracking-tight leading-none">Mi Viaje Musical 🚀</h1>
                  <div className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_12px_#FF8B7A]" />
                    Status Operativo: <span className="text-accent">{getRankDisplayName(currentInstData.rank.name, selectedInstrument)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-end">
              <div className="w-full max-sm space-y-6 bg-slate-900/30 border border-white/5 backdrop-blur-3xl rounded-[3rem] p-8 shadow-2xl relative group hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-xl">
                      <Cpu className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">Biometría de Datos</span>
                  </div>
                  
                  <div className="flex items-center gap-4 animate-in fade-in duration-1000">
                    <div className="hidden sm:flex gap-1 h-4 items-center">
                      {[1, 2, 3, 4].map((i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "w-0.5 rounded-full bg-slate-800 animate-pulse",
                            i === 1 && "delay-75 h-2",
                            i === 2 && "delay-150 h-4",
                            i === 3 && "delay-300 h-3",
                            i === 4 && "delay-500 h-2"
                          )} 
                        />
                      ))}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[6px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">Stream Online</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-5">
                  {currentSkills.length > 0 ? currentSkills.map((skill, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{skill.name}</span>
                        <span className="text-accent text-[10px] font-mono font-bold tracking-tighter">
                          <AnimatedNumber value={skill.level} />
                        </span>
                      </div>
                      {isStaff ? (
                        <div className="flex items-center gap-3 group/slider">
                          <Slider 
                            value={[skill.level]} 
                            max={100} 
                            step={1} 
                            className="h-1 flex-1"
                            onValueChange={(vals) => updateSkill(currentStudent!.id, selectedInstrument, skill.name, vals[0])}
                          />
                          <div className="w-2 h-2 rounded-full bg-slate-800 group-hover/slider:bg-accent transition-colors" />
                        </div>
                      ) : (
                        <div className="h-1 w-full bg-slate-800/40 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={cn("h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,139,122,0.1)]", skill.color || "bg-accent")} 
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center italic text-slate-700 text-[9px] py-4 uppercase font-black tracking-[0.3em]">No Data Stream</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <section className="relative select-none animate-in fade-in zoom-in duration-1000 [animation-delay:400ms]">
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="overflow-x-auto overflow-y-hidden immersive-scrollbar flex items-center relative pt-48 pb-32 cursor-grab active:cursor-grabbing h-[500px]"
            >
              <div className="relative flex items-center min-w-[300%] px-[25vw] h-12">
                <div className="absolute top-1/2 left-[25vw] right-[25vw] h-2 bg-slate-900/50 -translate-y-1/2 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-accent via-blue-500 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_30px_rgba(255,139,122,0.5)]"
                    style={{ width: `${pathProgress}%` }}
                  />
                </div>

                <div className="absolute left-[25vw] right-[25vw] top-1/2 -translate-y-1/2 flex justify-between items-center">
                  {currentRanks.map((rank, i) => {
                    const isReached = currentInstData.points >= rank.min;
                    const isCurrent = currentInstData.rank.name === rank.name;
                    const isIconUrl = rank.icon.startsWith('http') || rank.icon.startsWith('data:') || rank.icon.startsWith('/');
                    
                    return (
                      <div key={i} className="relative flex items-center justify-center w-0 h-0 group">
                        {isCurrent && (
                          <>
                            <div className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] bg-accent blur-3xl opacity-40 animate-pulse" />
                            <div className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-[3.5rem] border-2 border-accent/20 animate-ping [animation-duration:5s]" />
                          </>
                        )}
                        
                        <div className={cn(
                          "w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-700 border-4 relative z-10 shadow-2xl shrink-0",
                          isReached 
                            ? `bg-gradient-to-br ${rank.color} border-white/40 text-white scale-110 ${rank.glow}` 
                            : "bg-slate-900/80 border-slate-800 text-slate-700 grayscale opacity-30 hover:opacity-60 hover:scale-105"
                        )}>
                          {isIconUrl ? (
                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-1 drop-shadow-lg group-hover:scale-110 transition-transform">
                              <Image 
                                src={getDirectImageUrl(rank.icon)} 
                                alt={rank.name} 
                                fill 
                                className="object-contain" 
                              />
                            </div>
                          ) : (
                            <span className="text-4xl sm:text-6xl mb-1 drop-shadow-lg group-hover:scale-110 transition-transform">
                              {rank.icon}
                            </span>
                          )}
                          <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-tighter opacity-70">SECTOR {i + 1}</div>
                        </div>

                        <div className={cn(
                          "absolute top-[88px] sm:top-[104px] w-64 text-center transition-all duration-700 flex flex-col items-center left-1/2 -translate-x-1/2 px-4",
                          isReached ? "opacity-100 translate-y-0" : "opacity-30 translate-y-4"
                        )}>
                          <p className={cn(
                            "font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-2 drop-shadow-md leading-tight",
                            isCurrent ? "text-accent" : "text-slate-400"
                          )}>{getRankDisplayName(rank.name, selectedInstrument)}</p>
                          
                          {rank.min > 0 && (
                            <div className={cn(
                              "inline-block px-5 py-2 rounded-xl border-2 text-[9px] sm:text-[10px] font-black tracking-widest transition-all shadow-sm",
                              isReached 
                                ? "border-accent/40 bg-accent/10 text-white shadow-[0_0_15px_rgba(255,139,122,0.2)]" 
                                : "border-slate-800 bg-slate-900/50 text-slate-500"
                            )}>
                              {rank.min.toLocaleString()} PTS
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div 
                  className="absolute top-1/2 left-[25vw] right-[25vw] pointer-events-none z-20"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  <div 
                    className="absolute transition-all duration-1000 ease-out flex flex-col items-center"
                    style={{ left: `${pathProgress}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="relative -top-40 flex flex-col items-center animate-in slide-in-from-bottom-12 duration-1000">
                      <div className="relative p-2 rounded-[2.2rem] bg-accent shadow-[0_0_50px_rgba(255,139,122,0.8)] border-4 border-white group/avatar overflow-hidden">
                        <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.8rem] border-2 border-accent/20">
                          {currentStudent?.photoUrl ? (
                            <AvatarImage src={getDirectImageUrl(currentStudent.photoUrl)} className="object-cover" />
                          ) : (
                            <AvatarImage src={`https://picsum.photos/seed/${currentStudent?.avatarSeed || currentStudent?.id}/150`} />
                          )}
                          <AvatarFallback className="bg-slate-800 text-white font-black text-2xl">{currentStudent?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-accent/20 opacity-0 group/avatar:hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="mt-4 flex items-center gap-2 bg-slate-950 border-2 border-accent text-accent px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl shadow-2xl font-black text-xs sm:text-sm tabular-nums tracking-wider whitespace-nowrap">
                        <Flame className="w-3 h-3 sm:w-4 sm:h-4 animate-bounce" />
                        {currentInstData.points.toLocaleString()} EXP
                      </div>
                      <div className="w-1 h-12 bg-gradient-to-b from-accent to-transparent mt-1 rounded-full shadow-[0_0_10px_#FF8B7A]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-3 text-slate-600 animate-pulse pointer-events-none relative z-30">
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="text-[10px] font-black uppercase tracking-widest">Arrastra para explorar el mapa</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </section>

          <section className="space-y-12 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:800ms]">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <div className="flex items-center gap-6">
                <div className="p-5 rounded-[2rem] bg-white/5 text-accent border border-white/10 shadow-2xl group">
                  <StarIcon className="w-8 h-8 fill-current group-hover:scale-110 group-hover:rotate-12 transition-all" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase tracking-[0.2em]">Expediente de Logros</h2>
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" /> Bitácora oficial de trayectoria académica
                  </div>
                </div>
              </div>
              {isAdmin && (
                <Button className="rounded-2xl bg-accent hover:bg-accent/90 text-white font-black h-14 px-10 shadow-xl shadow-accent/30 gap-3 hover:scale-105 transition-all" onClick={() => { setEditingM(null); setMTitle(''); setMDate(''); setMAchieved(false); setIsMDialogOpen(true); }}>
                  <Plus className="w-5 h-5" /> Iniciar Protocolo de Hito
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studentMilestones.length > 0 ? studentMilestones.map((m) => (
                <div key={m.id} className={cn(
                  "p-10 rounded-[3.5rem] border-2 transition-all duration-500 group relative overflow-hidden",
                  m.achieved 
                    ? "bg-slate-900/40 border-white/10 shadow-2xl hover:border-accent/50" 
                    : "bg-slate-950/50 border-white/5 opacity-20 hover:opacity-40"
                )}>
                  {m.achieved && <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-accent/5 rounded-full blur-3xl" />}
                  <div className="flex items-start gap-8 relative z-10">
                    <div className={cn(
                      "w-16 h-16 rounded-[1.8rem] flex items-center justify-center shrink-0 shadow-inner border-2 transition-all group-hover:rotate-6",
                      m.achieved ? "bg-accent/10 border-accent/30 text-accent" : "bg-slate-800/50 border-white/5 text-slate-800"
                    )}>
                      {m.achieved ? <Crown className="w-8 h-8" /> : <StarIcon className="w-7 h-7" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className={cn("font-black text-base truncate uppercase tracking-[0.1em]", m.achieved ? "text-white" : "text-slate-700")}>{m.milestoneTitle}</h4>
                        {isStaff && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-accent" onClick={() => { setEditingM(m); setMTitle(m.milestoneTitle); setMDate(m.date || ''); setMAchieved(m.achieved); setIsMDialogOpen(true); }}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-destructive" onClick={() => deleteMilestone(m.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-4">
                        {m.achieved ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            <p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">{m.date || 'LOGRO VALIDADO'}</p>
                          </>
                        ) : (
                          <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">PENDIENTE DE ASIGNACIÓN</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-28 text-center bg-white/5 rounded-[5rem] border-2 border-dashed border-white/5">
                  <StarIcon className="w-20 h-20 text-white/5 mx-auto mb-8" />
                  <p className="text-slate-700 font-black uppercase tracking-[0.4em] text-[11px]">Sistema de Trayectoria Vacío</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <Dialog open={isRanksDialogOpen} onOpenChange={setIsRanksDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden bg-slate-900 text-white flex flex-col max-h-[90vh]">
          <DialogHeader className="bg-white/5 p-8 border-b border-white/10 shrink-0">
            <DialogTitle className="text-2xl font-black flex items-center gap-3 text-accent">
              <Settings className="w-6 h-6" />
              Configuración de Sectores: {selectedInstrument}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">Define los nombres, puntajes mínimos e iconos independientes para este instrumento.</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-900 custom-scrollbar">
            {tempRanks.map((rank, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-accent/20 text-accent border-none font-black text-[10px] uppercase">Sector {i + 1}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Nombre del Rango</Label>
                    <Input 
                      value={rank.name} 
                      onChange={(e) => {
                        const newRanks = [...tempRanks];
                        newRanks[i].name = e.target.value;
                        setTempRanks(newRanks);
                      }}
                      className="h-12 bg-slate-800 border-white/10 font-bold focus:border-accent text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Puntaje Mínimo</Label>
                    <Input 
                      type="number"
                      value={rank.min} 
                      onChange={(e) => {
                        const newRanks = [...tempRanks];
                        newRanks[i].min = parseInt(e.target.value) || 0;
                        setTempRanks(newRanks);
                      }}
                      className="h-12 bg-slate-800 border-white/10 font-bold focus:border-accent text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Icono (Emoji o URL de Imagen)
                  </Label>
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0 border border-white/10 overflow-hidden">
                      {rank.icon.startsWith('http') || rank.icon.startsWith('data:') || rank.icon.startsWith('/') ? (
                        <div className="relative w-full h-full p-1">
                          <Image src={getDirectImageUrl(rank.icon)} alt="Preview" fill className="object-contain" />
                        </div>
                      ) : rank.icon}
                    </div>
                    <Input 
                      value={rank.icon} 
                      onChange={(e) => {
                        const newRanks = [...tempRanks];
                        newRanks[i].icon = e.target.value;
                        setTempRanks(newRanks);
                      }}
                      placeholder="Emoji ✨ o URL https://..."
                      className="h-12 bg-slate-800 border-white/10 font-bold flex-1 focus:border-accent text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="p-8 bg-slate-950/50 border-t border-white/10 shrink-0">
            <Button variant="ghost" onClick={() => setIsRanksDialogOpen(false)} className="rounded-xl flex-1 h-14 font-black text-slate-400">Cancelar</Button>
            <Button onClick={handleSaveRanks} className="bg-accent text-white rounded-xl flex-1 h-14 font-black shadow-lg shadow-accent/20 gap-2">
              <Save className="w-5 h-5" /> Guardar para {selectedInstrument}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMDialogOpen} onOpenChange={setIsMDialogOpen}>
        <DialogContent className="rounded-[3.5rem] max-md border-none shadow-2xl p-0 overflow-hidden bg-slate-900 text-white">
          <DialogHeader className="bg-white/5 p-12 border-b border-white/10 text-center">
            <div className="mx-auto w-24 h-24 bg-accent rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-accent/30">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <DialogTitle className="text-3xl font-black">Asignación de Logro</DialogTitle>
            <DialogDescription className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mt-3">Base de Datos de Trayectoria</DialogDescription>
          </DialogHeader>
          <div className="p-12 space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 px-1">Descriptor del Hito</Label>
              <Input 
                value={mTitle} 
                onChange={(e) => setMTitle(e.target.value)}
                className="h-16 rounded-[1.5rem] border-white/10 bg-slate-800 text-white font-black focus:border-accent text-xl uppercase"
                placeholder="CONCEPTO DEL LOGRO"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 px-1">Ciclo Cronológico</Label>
              <Input 
                value={mDate} 
                onChange={(e) => setMDate(e.target.value)}
                className="h-16 rounded-[1.5rem] border-white/10 bg-slate-800 text-white font-black focus:border-accent uppercase"
                placeholder="EJ: VERANO 2024"
              />
            </div>
            <div className="flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
              <div className="space-y-1">
                <Label className="text-sm font-black uppercase tracking-widest">Activación</Label>
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">¿Validar inmediatamente?</p>
              </div>
              <Switch checked={mAchieved} onCheckedChange={setMAchieved} className="scale-150 data-[state=checked]:bg-accent" />
            </div>
          </div>
          <DialogFooter className="p-12 bg-slate-950/50 border-t border-white/10 flex gap-5">
            <Button variant="ghost" className="rounded-2xl flex-1 h-16 font-black text-slate-600 uppercase text-xs tracking-widest" onClick={() => setIsMDialogOpen(false)}>Abortar</Button>
            <Button className="bg-accent text-white rounded-2xl flex-1 h-16 font-black shadow-2xl shadow-accent/20 uppercase text-xs tracking-widest" onClick={handleSaveM}>Sincronizar Datos</Button>
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
