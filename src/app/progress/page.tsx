
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
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getDirectImageUrl } from '@/lib/utils/images';

const RANKS = [
  { name: 'Aprendiz', min: 0, icon: '🌱', color: 'from-slate-500 to-slate-600', glow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)]' },
  { name: 'Entusiasta', min: 1000, icon: '✨', color: 'from-blue-500 to-blue-700', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' },
  { name: 'En Formación', min: 2300, icon: '📚', color: 'from-emerald-500 to-emerald-700', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' },
  { name: 'Preparado', min: 4000, icon: '🎓', color: 'from-amber-500 to-amber-700', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
  { name: 'Virtuoso', min: 6200, icon: '🔥', color: 'from-rose-500 to-rose-700', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]' },
  { name: 'Maestro', min: 9000, icon: '👑', color: 'from-purple-500 to-purple-700', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' },
];

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

  // Drag-to-scroll logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
    const stats: Record<string, { points: number; completedHours: number; rank: typeof RANKS[0], nextRank: typeof RANKS[0] | null }> = {};
    
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

      let currentRank = RANKS[0];
      let nextRank = null;
      for (let i = RANKS.length - 1; i >= 0; i--) {
        if (points >= RANKS[i].min) {
          currentRank = RANKS[i];
          nextRank = RANKS[i + 1] || null;
          break;
        }
      }
      stats[cat] = { points, completedHours, rank: currentRank, nextRank };
    });
    return stats;
  }, [completions, availabilities, currentStudent, getSkillLevel, resources]);

  const currentInstData = useMemo(() => {
    return instrumentStats[selectedInstrument] || { points: 0, completedHours: 0, rank: RANKS[0], nextRank: RANKS[1] };
  }, [instrumentStats, selectedInstrument]);

  const pathProgress = useMemo(() => {
    const points = currentInstData.points;
    const totalNodes = RANKS.length;
    
    let segmentIndex = 0;
    for (let i = 0; i < totalNodes - 1; i++) {
      if (points >= RANKS[i].min && points < RANKS[i+1].min) {
        segmentIndex = i;
        break;
      }
      if (i === totalNodes - 2 && points >= RANKS[totalNodes - 1].min) {
        segmentIndex = totalNodes - 1;
      }
    }

    if (segmentIndex >= totalNodes - 1) {
      return 100;
    }

    const segmentStart = RANKS[segmentIndex].min;
    const segmentEnd = RANKS[segmentIndex + 1].min;
    const segmentRange = segmentEnd - segmentStart;
    const segmentProgress = (points - segmentStart) / segmentRange;
    
    const totalProgress = (segmentIndex + segmentProgress) / (totalNodes - 1);
    return totalProgress * 100;
  }, [currentInstData.points]);

  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (isMounted && scrollRef.current && currentInstData.rank && !hasScrolledRef.current) {
      const rankIndex = RANKS.findIndex(r => r.name === currentInstData.rank.name);
      if (rankIndex !== -1) {
        const timer = setTimeout(() => {
          if (!scrollRef.current) return;
          const container = scrollRef.current;
          const contentWidth = container.scrollWidth;
          const viewportWidth = container.clientWidth;
          
          const nodeX = (rankIndex / (RANKS.length - 1)) * (contentWidth - 200) + 100;
          const centerOffset = nodeX - (viewportWidth / 2);
          
          container.scrollTo({
            left: Math.max(0, centerOffset),
            behavior: 'smooth'
          });
          hasScrolledRef.current = true;
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isMounted, currentInstData.rank, selectedInstrument]);

  useEffect(() => {
    hasScrolledRef.current = false;
  }, [selectedInstrument, selectedStudentId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  const handleTouchEnd = () => {
    setIsDragging(false);
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

  const getRankDisplayName = (baseName: string, instrument: string) => {
    const title = INSTRUMENT_TITLES[instrument] || 'Músico';
    return `${title} ${baseName}`;
  };

  if (!isMounted || !user) return null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#020617] -m-4 md:-m-8 lg:-m-12 p-4 md:p-12 relative overflow-hidden text-slate-100 selection:bg-accent selection:text-white">
        {/* Futuristic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[150px] animate-pulse [animation-delay:2s]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-12">
          
          {/* Header HUB Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Left: Global Points & Selection */}
            <div className="lg:col-span-7 flex flex-col md:flex-row items-center gap-10">
              <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-accent rounded-[3.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                <div className="rounded-[3.5rem] bg-slate-900/40 border border-white/10 backdrop-blur-3xl px-10 py-8 flex items-center gap-6 shadow-2xl relative">
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
                <div className="flex flex-wrap gap-2">
                  {isStaff && (
                    <div className="bg-white/5 border border-white/10 p-1 rounded-2xl flex items-center backdrop-blur-md shadow-inner">
                      <Search className="w-3.5 h-3.5 text-accent ml-3" />
                      <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                        <SelectTrigger className="w-40 h-9 rounded-xl border-none bg-transparent font-black text-slate-300 focus:ring-0 text-[9px] uppercase tracking-widest">
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
                      <SelectTrigger className="w-40 h-9 rounded-xl border-none bg-transparent font-black text-slate-300 focus:ring-0 text-[9px] uppercase tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl bg-slate-900 border-white/10 text-white">
                        {Array.from(new Set([...(currentStudent?.instruments || []), 'Teoría'])).map(inst => (
                          <SelectItem key={inst} value={inst} className="font-bold text-xs">{inst}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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

            {/* Right: Technical Evolution */}
            <div className="lg:col-span-5 flex justify-end">
              <div className="w-full max-w-sm space-y-6 bg-slate-900/30 border border-white/5 backdrop-blur-3xl rounded-[3rem] p-8 shadow-2xl relative group hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-xl">
                      <Cpu className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">Biometría de Datos</span>
                  </div>
                  <Badge variant="ghost" className="text-[8px] font-mono text-slate-600 p-0 tracking-tighter">LVL_MAP_V3</Badge>
                </div>
                
                <div className="space-y-5">
                  {currentSkills.length > 0 ? currentSkills.map((skill, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{skill.name}</span>
                        <span className="text-accent text-[10px] font-mono font-bold tracking-tighter">{skill.level.toString().padStart(3, '0')}%</span>
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

          {/* MAIN PILAR: THE LEVEL PATH */}
          <section className="relative select-none animate-in fade-in zoom-in duration-1000 [animation-delay:400ms]">
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="overflow-x-auto overflow-y-visible immersive-scrollbar flex items-center relative pt-48 pb-32 cursor-grab active:cursor-grabbing h-[500px]"
            >
              <div className="relative flex items-center min-w-[300%] px-[25vw] h-12">
                {/* The Level Line Base */}
                <div className="absolute top-1/2 left-[25vw] right-[25vw] h-[12px] bg-slate-900 -translate-y-1/2 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-accent via-blue-500 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_30px_rgba(255,139,122,0.5)]"
                    style={{ width: `${pathProgress}%` }}
                  />
                </div>

                {/* Rank Nodes */}
                <div className="absolute left-[25vw] right-[25vw] top-1/2 -translate-y-1/2 flex justify-between items-center">
                  {RANKS.map((rank, i) => {
                    const isReached = currentInstData.points >= rank.min;
                    const isCurrent = currentInstData.rank.name === rank.name;
                    
                    return (
                      <div key={i} className="relative flex items-center justify-center w-0 h-0 group">
                        {/* Anchor point for visual centering */}
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
                          <span className="text-4xl sm:text-6xl mb-1 drop-shadow-lg group-hover:scale-110 transition-transform">{rank.icon}</span>
                          <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-tighter opacity-70">SECTOR {i + 1}</div>
                        </div>

                        {/* Rank Label (Bottom) */}
                        <div className={cn(
                          "absolute top-28 sm:top-36 w-64 text-center transition-all duration-700 flex flex-col items-center left-1/2 -translate-x-1/2 px-4",
                          isReached ? "opacity-100 translate-y-0" : "opacity-30 translate-y-4"
                        )}>
                          <p className={cn(
                            "font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] mb-2 drop-shadow-md leading-tight",
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

                {/* DYNAMIC STUDENT MARKER */}
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
            
            {/* Scroll Indicator Hint - Positioned below the map */}
            <div className="mt-4 flex items-center justify-center gap-3 text-slate-600 animate-pulse pointer-events-none relative z-30">
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Arrastra para explorar el mapa</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </section>

          {/* Trayectoria Tray */}
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
