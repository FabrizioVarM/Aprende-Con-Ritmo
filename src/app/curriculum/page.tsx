
"use client"

import { useState, useMemo, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  BookOpenCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Clock, 
  CheckCircle2, 
  Link as LinkIcon, 
  GraduationCap,
  Save,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  LayoutList,
  LayoutGrid,
  Sparkles,
  FileText,
  Target,
  ArrowRight,
  Image as ImageIcon,
  Library,
  Lightbulb,
  CheckSquare,
  Images,
  Trash,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useCurriculumStore, CurriculumPlan, CurriculumStep } from '@/lib/curriculum-store';
import { useResourceStore } from '@/lib/resource-store';
import { useSettingsStore } from '@/lib/settings-store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getDirectImageUrl } from '@/lib/utils/images';

const INSTRUMENTS_LIST = ['Guitarra', 'Piano', 'Violín', 'Canto', 'Batería', 'Bajo', 'Teoría'];

const INSTRUMENT_EMOJIS: Record<string, string> = {
  'Guitarra': '🎸',
  'Piano': '🎹',
  'Violín': '🎻',
  'Canto': '🎤',
  'Batería': '🥁',
  'Bajo': '🎸',
  'Teoría': '📖'
};

export default function CurriculumPage() {
  const { user } = useAuth();
  const { curriculums, saveCurriculum, deleteCurriculum, loading } = useCurriculumStore();
  const { resources } = useResourceStore();
  const { settings, updateSettings } = useSettingsStore();
  const { toast } = useToast();
  const router = useRouter();
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(true);

  const [selectedInstrument, setSelectedInstrument] = useState<string>(INSTRUMENTS_LIST[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMeshOpen, setIsMeshOpen] = useState(false);
  const [viewingStep, setViewingStep] = useState<(CurriculumStep & { originalIndex: number }) | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(4);
  
  const [isHeroEditing, setIsHeroEditing] = useState(false);
  const [tempHero, setTempHero] = useState({
    title: '',
    subtitle: '',
    description: '',
    badge: '',
    imageUrl: ''
  });

  // Individual Step Editing/Adding states
  const [isStepFormOpen, setIsStepFormOpen] = useState(false);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [stepFormMode, setStepFormMode] = useState<'add' | 'edit'>('add');
  const [targetStepIdx, setTargetStepIdx] = useState<number | null>(null);
  const [insertPosition, setInsertPosition] = useState<string>('end');
  
  const [stepForm, setStepForm] = useState<CurriculumStep>({
    title: '',
    objective: '',
    concepts: '',
    activities: '',
    interactiveMaterial: '',
    criteria: '',
    durationClasses: 1,
    images: [],
    resourceId: undefined
  });

  useEffect(() => {
    const handleResize = () => {
      setItemsToShow(window.innerWidth >= 768 ? 4 : 1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollArrow(false);
      } else {
        setShowScrollArrow(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTimeline = () => {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isAdmin = user?.role === 'admin';
  const currentPlan = useMemo(() => 
    curriculums.find(c => c.instrument === selectedInstrument), 
  [curriculums, selectedInstrument]);

  const teacherImg = settings.curriculumHeroImageUrl || PlaceHolderImages.find(img => img.id === 'teacher-curriculum')?.imageUrl || "https://picsum.photos/seed/teacher/600/400";

  const openAddStep = () => {
    setStepFormMode('add');
    setStepForm({
      title: '',
      objective: '',
      concepts: '',
      activities: '',
      interactiveMaterial: '',
      criteria: '',
      durationClasses: 1,
      images: [],
      resourceId: undefined
    });
    setInsertPosition('end');
    setIsStepFormOpen(true);
  };

  const openEditIndividualStep = (step: CurriculumStep, index: number) => {
    setStepFormMode('edit');
    setTargetStepIdx(index);
    setStepForm(JSON.parse(JSON.stringify(step)));
    setIsStepFormOpen(true);
  };

  const handleDeleteIndividualStep = (index: number) => {
    if (!currentPlan) return;
    
    const newSteps = currentPlan.steps.filter((_, i) => i !== index);
    saveCurriculum({ ...currentPlan, steps: newSteps }, currentPlan.id);
    
    toast({ title: "Paso Eliminado 🗑️", description: "La malla curricular ha sido actualizada." });
    setViewingStep(null);
  };

  const handleSaveStep = () => {
    if (!stepForm.title) {
      toast({ variant: "destructive", title: "Título obligatorio" });
      return;
    }

    setIsSavingStep(true);

    if (!currentPlan) {
      const newPlan: CurriculumPlan = {
        id: selectedInstrument.toLowerCase(),
        instrument: selectedInstrument,
        description: `Plan de estudios para ${selectedInstrument}`,
        steps: [stepForm]
      };
      saveCurriculum(newPlan);
    } else {
      let newSteps = [...currentPlan.steps];
      if (stepFormMode === 'add') {
        if (insertPosition === 'end') {
          newSteps.push(stepForm);
        } else {
          const idx = parseInt(insertPosition);
          newSteps.splice(idx + 1, 0, stepForm);
        }
      } else if (stepFormMode === 'edit' && targetStepIdx !== null) {
        newSteps[targetStepIdx] = stepForm;
      }
      
      saveCurriculum({ ...currentPlan, steps: newSteps }, currentPlan.id);
    }

    toast({ title: stepFormMode === 'add' ? "Paso añadido ✨" : "Paso actualizado ✨" });
    setIsStepFormOpen(false);
    setViewingStep(null);
    
    setTimeout(() => setIsSavingStep(false), 500);
  };

  const handleAddStepImage = () => {
    setStepForm(prev => ({
      ...prev,
      images: [...(prev.images || []), '']
    }));
  };

  const handleUpdateStepImage = (idx: number, value: string) => {
    const newImages = [...(stepForm.images || [])];
    newImages[idx] = value;
    setStepForm(prev => ({ ...prev, images: newImages }));
  };

  const handleRemoveStepImage = (idx: number) => {
    setStepForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idx)
    }));
  };

  const handleDelete = async () => {
    if (currentPlan) {
      await deleteCurriculum(currentPlan.id);
      toast({ title: "Plan Elimidado 🗑️" });
      setIsDeleting(false);
    }
  };

  const handleSaveHero = () => {
    updateSettings({
      curriculumHeroTitle: tempHero.title,
      curriculumHeroSubtitle: tempHero.subtitle,
      curriculumHeroDescription: tempHero.description,
      curriculumHeroBadge: tempHero.badge,
      curriculumHeroImageUrl: tempHero.imageUrl
    });
    setIsHeroEditing(false);
    toast({ title: "Encabezado Actualizado ✨" });
  };

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return <AppLayout><div className="p-20 text-center">No tienes permiso para ver esta sección.</div></AppLayout>;
  }

  // Calculate sliding offset
  const offset = currentPlan ? Math.max(0, Math.min(currentPlan.steps.length - itemsToShow, currentStepIdx - Math.floor(itemsToShow / 2))) : 0;

  return (
    <AppLayout>
      <div className="space-y-12 relative">
        {showScrollArrow && (
          <Button 
            onClick={scrollToTimeline}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 rounded-full w-14 h-14 bg-accent/90 backdrop-blur-md text-white shadow-2xl hover:scale-110 hover:bg-accent active:scale-95 transition-all animate-bounce flex items-center justify-center border-4 border-white/20"
            size="icon"
          >
            <ChevronDown className="w-8 h-8" strokeWidth={3} />
          </Button>
        )}

        <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-accent to-accent/80 p-8 md:p-12 text-white shadow-2xl shadow-accent/20 group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          {isAdmin && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                setTempHero({
                  title: settings.curriculumHeroTitle || 'Plan de Estudios',
                  subtitle: settings.curriculumHeroSubtitle || 'Estandarizado',
                  description: settings.curriculumHeroDescription || '',
                  badge: settings.curriculumHeroBadge || 'Guía Docente Maestra',
                  imageUrl: settings.curriculumHeroImageUrl || ''
                });
                setIsHeroEditing(true);
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-md">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {settings.curriculumHeroBadge || 'Guía Docente Maestra'}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tight leading-none">
                {settings.curriculumHeroTitle || 'Plan de Estudios'} <br /> <span className="text-secondary">{settings.curriculumHeroSubtitle || 'Estandarizado'}</span>
              </h1>
              <p className="text-lg md:text-xl font-medium text-white/90 max-w-2xl leading-relaxed">
                {settings.curriculumHeroDescription || 'Bienvenido al núcleo académico de Aprende con Ritmo. Aquí encontrarás la ruta estructurada que garantiza que cada alumno, sin importar su profesor, reciba una formación técnica y musical de excelencia.'}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 bg-black/10 p-4 rounded-2xl border border-white/10">
                  <CheckCircle2 className="w-6 h-6 text-secondary" />
                  <p className="text-sm font-bold">Base Técnica Uniforme</p>
                </div>
                <div className="flex items-center gap-3 bg-black/10 p-4 rounded-2xl border border-white/10">
                  <Target className="w-6 h-6 text-secondary" />
                  <p className="text-sm font-bold">Objetivos Claros</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 hidden lg:flex justify-center">
              <div className="relative w-64 h-64 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image 
                  src={getDirectImageUrl(teacherImg)}
                  alt="Profesor de Música"
                  fill
                  className="object-cover"
                  data-ai-hint="music teacher"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-8 px-4">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
              <LayoutList className="w-6 h-6 text-accent" />
              Consulta las Mallas Curriculares
            </h2>
            
            <div className="bg-primary/5 p-6 rounded-[2.5rem] border-2 border-primary/10 shadow-inner">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {INSTRUMENTS_LIST.map(inst => {
                  const isSelected = selectedInstrument === inst;
                  return (
                    <Button
                      key={inst}
                      variant="outline"
                      className={cn(
                        "rounded-[1.5rem] h-20 font-black border-2 transition-all flex flex-col items-center justify-center p-2 gap-1",
                        isSelected 
                          ? "bg-accent border-accent text-white shadow-xl scale-105" 
                          : "bg-card border-primary/10 hover:border-accent/40 text-muted-foreground shadow-sm"
                      )}
                      onClick={() => {
                        setSelectedInstrument(inst);
                        setCurrentStepIdx(0);
                        setIsMeshOpen(true);
                      }}
                    >
                      <span className="text-2xl">{INSTRUMENT_EMOJIS[inst]}</span>
                      <span className="text-[10px] uppercase tracking-widest truncate w-full text-center">{inst}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3 max-w-xs pt-4 border-t border-primary/10">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Filtrar Línea Interactiva</Label>
            <Select value={selectedInstrument} onValueChange={(v) => {
              setSelectedInstrument(v);
              setCurrentStepIdx(0);
            }}>
              <SelectTrigger className="h-14 rounded-2xl border-2 font-black bg-card shadow-sm w-full focus:ring-accent">
                <SelectValue placeholder="Elegir Instrumento" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {INSTRUMENTS_LIST.map(inst => (
                  <SelectItem key={inst} value={inst} className="font-bold py-3">{inst}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <section ref={timelineRef} className="space-y-8 px-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-accent rounded-full" />
              <h2 className="text-2xl font-black text-foreground">Ruta de Aprendizaje Interactiva: {selectedInstrument}</h2>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button onClick={openAddStep} className="bg-accent text-white rounded-xl shadow-lg font-black gap-2 h-12 px-6">
                  <Plus className="w-5 h-5" /> Añadir Paso
                </Button>
                {currentPlan && (
                  <Button onClick={() => setIsDeleting(true)} size="icon" variant="outline" className="h-12 w-12 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : currentPlan && currentPlan.steps.length > 0 ? (
            <div className="relative pt-10 pb-20 overflow-hidden">
              {/* Sliding Container */}
              <div 
                className="flex transition-transform duration-700 ease-in-out px-4 relative"
                style={{ 
                  transform: `translateX(-${offset * (100 / itemsToShow)}%)` 
                }}
              >
                {/* Linea conectora de fondo (Moved inside sliding container to stay synced) */}
                <div className="absolute top-[40px] left-0 w-full h-1 bg-muted -translate-y-1/2 z-0 rounded-full opacity-30" />
                <div 
                  className="absolute top-[40px] left-0 h-1 bg-accent -translate-y-1/2 z-0 rounded-full transition-all duration-700 opacity-50" 
                  style={{ width: `${(currentStepIdx / (currentPlan.steps.length - 1)) * 100}%` }}
                />

                {currentPlan.steps.map((step, i) => {
                  const isCompleted = i < currentStepIdx;
                  const isCurrent = i === currentStepIdx;
                  const isFuture = i > currentStepIdx;

                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "flex flex-col items-center text-center space-y-6 transition-all duration-500 cursor-pointer group shrink-0",
                        itemsToShow === 1 ? "w-full" : "w-1/4",
                        isCompleted && "opacity-80 scale-95 hover:opacity-100",
                        isFuture && "opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100"
                      )}
                      onClick={() => {
                        setViewingStep({ ...step, originalIndex: i });
                        setCurrentStepIdx(i);
                      }}
                    >
                      {/* Indicador Numérico con efecto de ondas */}
                      <div className="relative">
                        {isCurrent && (
                          <>
                            <div className="absolute inset-0 rounded-[2rem] ring-4 ring-accent/60 animate-sonar" />
                            <div className="absolute inset-0 rounded-[2rem] ring-4 ring-accent/40 animate-sonar [animation-delay:1s]" />
                          </>
                        )}
                        <div className={cn(
                          "w-20 h-20 rounded-[2rem] flex items-center justify-center text-2xl font-black shadow-xl transition-all duration-500 group-hover:scale-110 relative z-10",
                          isCurrent 
                            ? "bg-accent text-white ring-8 ring-accent/20 scale-110" 
                            : isCompleted 
                              ? "bg-emerald-500 text-white" 
                              : "bg-white dark:bg-slate-800 text-muted-foreground border-4 border-primary/10"
                        )}>
                          {isCompleted ? <CheckCircle2 className="w-10 h-10" /> : i + 1}
                        </div>
                      </div>
                      
                      <div className="space-y-2 px-2">
                        <h3 className={cn(
                          "font-black text-lg leading-tight line-clamp-2",
                          isCurrent ? "text-accent" : "text-foreground"
                        )}>
                          {step.title}
                        </h3>
                        <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">
                          {step.durationClasses} {step.durationClasses === 1 ? 'Clase' : 'Clases'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controles de Navegación del Timeline */}
              <div className="flex justify-center gap-4 mt-12">
                <Button 
                  variant="outline" 
                  disabled={currentStepIdx === 0}
                  className="rounded-full w-14 h-14 border-2"
                  onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button 
                  variant="outline" 
                  disabled={currentStepIdx === currentPlan.steps.length - 1}
                  className="rounded-full w-14 h-14 border-2"
                  onClick={() => setCurrentStepIdx(prev => Math.min(currentPlan.steps.length - 1, prev + 1))}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center bg-primary/5 rounded-[3rem] border-4 border-dashed border-primary/10 space-y-6">
              <LayoutList className="w-20 h-20 text-muted-foreground/20 mx-auto" />
              <div>
                <h3 className="text-2xl font-black text-foreground">No hay plan para {selectedInstrument}</h3>
                <p className="text-muted-foreground font-bold italic mt-2">Aún no se ha estandarizado la currícula para este instrumento.</p>
              </div>
              {isAdmin && (
                <Button onClick={openAddStep} className="bg-accent text-white rounded-2xl h-14 px-10 font-black shadow-xl shadow-accent/20 gap-2">
                  <Plus className="w-5 h-5" /> Crear Primer Paso
                </Button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* MODAL: DETALLES DEL PASO (INTERACTIVO) */}
      <Dialog open={!!viewingStep} onOpenChange={(open) => !open && setViewingStep(null)}>
        <DialogContent className="rounded-[2.5rem] max-w-3xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
          {viewingStep && (
            <>
              <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-accent text-white rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none">
                      Paso {viewingStep.originalIndex + 1}
                    </Badge>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Duración: {viewingStep.durationClasses} Sesiones
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-2 font-black gap-2 h-10 px-4 hover:bg-accent hover:text-white transition-all"
                        onClick={() => openEditIndividualStep(viewingStep, viewingStep.originalIndex)}
                      >
                        <Edit2 className="w-4 h-4" /> Editar Paso
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-2 border-destructive/20 text-destructive font-black gap-2 h-10 px-4 hover:bg-destructive hover:text-white transition-all"
                        onClick={() => handleDeleteIndividualStep(viewingStep.originalIndex)}
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar Paso
                      </Button>
                    </div>
                  )}
                </div>
                <DialogTitle className="text-3xl font-black text-foreground leading-tight">
                  {viewingStep.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-card">
                {/* Objetivo */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" /> Objetivo del Paso
                  </h4>
                  <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 min-h-[80px]">
                    <p className="text-sm font-medium text-foreground leading-relaxed italic whitespace-pre-wrap">
                      {viewingStep.objective || "No definido."}
                    </p>
                  </div>
                </div>

                {/* Conceptos y Primera Imagen */}
                <div className={cn(
                  "grid gap-6 items-start",
                  (viewingStep.images && viewingStep.images.length > 0) ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                )}>
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Library className="w-4 h-4 text-accent" /> Conceptos a Enseñar
                    </h4>
                    <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 min-h-[80px]">
                      <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                        {viewingStep.concepts || "No definido."}
                      </p>
                    </div>
                  </div>

                  {viewingStep.images && viewingStep.images.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Images className="w-4 h-4 text-accent" /> Guía Visual Principal
                      </h4>
                      <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary/10 shadow-md group/img">
                        <Image 
                          src={getDirectImageUrl(viewingStep.images[0])} 
                          alt="Concepto Visual" 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actividades */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" /> Actividades Prácticas
                  </h4>
                  <div className="p-5 bg-accent/5 rounded-3xl border-2 border-dashed border-accent/20">
                    <p className="text-sm font-bold text-foreground leading-relaxed whitespace-pre-wrap">
                      {viewingStep.activities || "No definido."}
                    </p>
                  </div>
                </div>

                {/* Material Sugerido */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-accent" /> Material Interactivo Sugerido
                  </h4>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border-2 border-blue-100 dark:border-blue-900/20">
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300 leading-relaxed whitespace-pre-wrap">
                      {viewingStep.interactiveMaterial || "No hay sugerencias adicionales."}
                    </p>
                  </div>
                </div>

                {/* Galería de Imágenes Adicionales */}
                {viewingStep.images && viewingStep.images.length > 1 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Images className="w-4 h-4 text-accent" /> Multimedia Adicional
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewingStep.images.slice(1).map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary/10 shadow-sm group/img">
                          <Image 
                            src={getDirectImageUrl(img)} 
                            alt={`Guía Extra ${idx + 1}`} 
                            fill 
                            className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Criterio de Avance */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-accent" /> Criterio para Avanzar
                  </h4>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/20">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 leading-relaxed whitespace-pre-wrap">
                      {viewingStep.criteria || "Validar comprensión técnica básica."}
                    </p>
                  </div>
                </div>

                {viewingStep.resourceId && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-accent" /> Recurso Principal de Apoyo (Biblioteca)
                    </h4>
                    {resources.find(r => r.id === viewingStep.resourceId) ? (
                      <Card className="rounded-[2rem] border-2 border-accent/20 bg-accent/5 hover:border-accent/40 transition-all cursor-pointer overflow-hidden group" onClick={() => router.push(`/library?resourceId=${viewingStep.resourceId}`)}>
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-accent shadow-md group-hover:scale-110 transition-transform">
                              <BookOpenCheck className="w-8 h-8" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-accent uppercase tracking-widest">Recurso Vinculado</p>
                              <p className="text-lg font-black text-foreground">{resources.find(r => r.id === viewingStep.resourceId)?.title}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-6 h-6 text-accent group-hover:translate-x-2 transition-transform" />
                        </div>
                      </Card>
                    ) : (
                      <div className="p-4 bg-muted/20 rounded-2xl text-center italic text-xs text-muted-foreground">
                        El recurso vinculado ya no existe en la biblioteca.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="p-6 bg-muted/30 border-t">
                <Button className="w-full bg-accent text-white rounded-2xl h-14 font-black shadow-lg shadow-accent/20" onClick={() => setViewingStep(null)}>
                  Entendido, ¡A clase!
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: MALLA CURRICULAR (VERSIÓN ESCRITA) */}
      <Dialog open={isMeshOpen} onOpenChange={setIsMeshOpen}>
        <DialogContent className="rounded-[3rem] max-w-4xl border-none shadow-2xl p-0 overflow-hidden flex flex-col h-[85vh]">
          <DialogHeader className="bg-primary/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-3xl font-black text-foreground flex items-center gap-3">
              <LayoutList className="w-8 h-8 text-accent" />
              Malla Curricular: {selectedInstrument}
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">Vista panorámica de todos los pasos académicos del instrumento.</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 bg-card">
            <div className="p-8 space-y-6">
              <div className="p-6 bg-accent/5 rounded-[2rem] border-2 border-dashed border-accent/20 mb-8">
                <p className="text-sm font-bold text-accent italic leading-relaxed text-center">
                  "{currentPlan?.description || 'Plan estandarizado de la academia.'}"
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {currentPlan?.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 items-start">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-accent shrink-0 shadow-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-2 pb-6 border-b border-primary/5 last:border-0">
                      <h4 className="font-black text-lg text-foreground">{step.title}</h4>
                      <p className="text-xs font-bold text-accent uppercase tracking-widest">{step.objective}</p>
                      <div className="flex gap-3 pt-2">
                        <Badge variant="outline" className="rounded-lg text-[10px] font-black uppercase px-2 py-0.5 border-primary/20">
                          {step.durationClasses} Clases
                        </Badge>
                        {step.resourceId && (
                          <Badge variant="outline" className="rounded-lg text-[10px] font-black uppercase px-2 py-0.5 border-accent/20 text-accent">
                            Recurso Enlazado
                          </Badge>
                        )}
                        {step.images && step.images.length > 0 && (
                          <Badge variant="outline" className="rounded-lg text-[10px] font-black uppercase px-2 py-0.5 border-blue-200 text-blue-600">
                            {step.images.length} Imagen(es)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 bg-muted/30 border-t shrink-0">
            <Button variant="outline" onClick={() => setIsMeshOpen(false)} className="w-full rounded-2xl h-12 font-black border-2">Cerrar Malla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin: Modal de Edición de Encabezado (Hero) */}
      <Dialog open={isHeroEditing} onOpenChange={setIsHeroEditing}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
              <Edit2 className="w-6 h-6 text-accent" />
              Editar Bienvenida
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">Personaliza el mensaje y la imagen de cabecera de esta sección.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6 bg-card overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Etiqueta (Badge)</Label>
                <input 
                  value={tempHero.badge} 
                  onChange={(e) => setTempHero(prev => ({...prev, badge: e.target.value}))}
                  className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Título (Parte 1)</Label>
                <input 
                  value={tempHero.title} 
                  onChange={(e) => setTempHero(prev => ({...prev, title: e.target.value}))}
                  className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Título (Parte 2 - Destacado)</Label>
                <input 
                  value={tempHero.subtitle} 
                  onChange={(e) => setTempHero(prev => ({...prev, subtitle: e.target.value}))}
                  className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL de Imagen del Profesor</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input 
                    value={tempHero.imageUrl} 
                    onChange={(e) => setTempHero(prev => ({...prev, imageUrl: e.target.value}))}
                    className="flex h-12 w-full rounded-xl border-2 border-input bg-background pl-10 pr-3 py-2 text-sm font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descripción de Bienvenida</Label>
              <Textarea 
                value={tempHero.description} 
                onChange={(e) => setTempHero(prev => ({...prev, description: e.target.value}))}
                className="min-h-[120px] rounded-xl border-2 font-medium p-4"
              />
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/30 border-t flex gap-3 shrink-0">
            <Button variant="outline" onClick={() => setIsHeroEditing(false)} className="rounded-xl flex-1 h-12 font-black">Cancelar</Button>
            <Button onClick={handleSaveHero} className="bg-accent text-white rounded-xl flex-1 h-12 font-black shadow-lg shadow-accent/20">
              <Save className="w-4 h-4 mr-2" /> Guardar Encabezado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin: Modal de Gestión de Paso Individual (Añadir o Editar) */}
      <Dialog open={isStepFormOpen} onOpenChange={setIsStepFormOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-4xl border-none shadow-2xl p-0 overflow-hidden flex flex-col h-[90vh]">
          <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
              {stepFormMode === 'add' ? <Plus className="w-8 h-8 text-accent" /> : <Edit2 className="w-8 h-8 text-accent" />}
              {stepFormMode === 'add' ? 'Añadir Nuevo Paso' : 'Editar Paso Existente'}
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Define los detalles pedagógicos y multimedia para este nivel de aprendizaje.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 bg-card">
            <div className="p-8 space-y-8">
              {stepFormMode === 'add' && currentPlan && currentPlan.steps.length > 0 && (
                <div className="space-y-3 p-6 bg-accent/5 rounded-3xl border-2 border-accent/10 border-dashed">
                  <Label className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" /> Ubicación del nuevo paso
                  </Label>
                  <Select value={insertPosition} onValueChange={setInsertPosition}>
                    <SelectTrigger className="h-12 rounded-xl border-2 font-bold bg-white">
                      <SelectValue placeholder="Elegir posición..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="end" className="font-bold">Al final de la ruta</SelectItem>
                      {currentPlan.steps.map((s, idx) => (
                        <SelectItem key={idx} value={String(idx)} className="font-bold">Después de: {s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Título del Paso</Label>
                  <input value={stepForm.title} onChange={(e) => setStepForm(p => ({...p, title: e.target.value}))} className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-black ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Ej: Primeros Acordes" />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Duración (Sesiones)</Label>
                  <Select value={String(stepForm.durationClasses)} onValueChange={(v) => setStepForm(p => ({...p, durationClasses: parseInt(v)}))}>
                    <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {[1, 2, 3].map(n => (
                        <SelectItem key={n} value={String(n)} className="font-bold">{n} {n === 1 ? 'Clase' : 'Clases'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Objetivo Académico</Label>
                  <Textarea value={stepForm.objective} onChange={(e) => setStepForm(p => ({...p, objective: e.target.value}))} className="min-h-[100px] rounded-xl border-2 font-medium text-xs" placeholder="¿Qué debe lograr el alumno?" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Conceptos a Enseñar (Soporta listas)</Label>
                  <Textarea value={stepForm.concepts} onChange={(e) => setStepForm(p => ({...p, concepts: e.target.value}))} className="min-h-[100px] rounded-xl border-2 font-medium text-xs" placeholder="Teoría, técnica, notas..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Actividades Prácticas (Soporta listas)</Label>
                <Textarea value={stepForm.activities} onChange={(e) => setStepForm(p => ({...p, activities: e.target.value}))} className="min-h-[120px] rounded-xl border-2 font-medium text-xs" placeholder="Ejercicios, dinámicas en clase..." />
              </div>

              <div className="space-y-4 border-t border-primary/10 pt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                    <Images className="w-3 h-3 text-accent" /> Galería Visual (URLs)
                  </Label>
                  <Button type="button" variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase rounded-lg border-2" onClick={handleAddStepImage}>
                    <Plus className="w-3 h-3 mr-1" /> Añadir Imagen
                  </Button>
                </div>
                <div className="space-y-3">
                  {stepForm.images?.map((url, idx) => (
                    <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                      <input 
                        value={url} 
                        onChange={(e) => handleUpdateStepImage(idx, e.target.value)} 
                        className="flex h-10 w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-xs font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                        placeholder="https://..." 
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveStepImage(idx)} className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Material Interactivo Sugerido</Label>
                  <Textarea value={stepForm.interactiveMaterial} onChange={(e) => setStepForm(p => ({...p, interactiveMaterial: e.target.value}))} className="min-h-[80px] rounded-xl border-2 font-medium text-xs" placeholder="Videos, apps, pistas..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Criterio para Avanzar</Label>
                  <Textarea value={stepForm.criteria} onChange={(e) => setStepForm(p => ({...p, criteria: e.target.value}))} className="min-h-[80px] rounded-xl border-2 font-medium text-xs" placeholder="¿Cómo sabemos que está listo?" />
                </div>
              </div>

              <div className="space-y-2 pb-8">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Recurso Vinculado (Biblioteca)</Label>
                <Select value={String(stepForm.resourceId || 'none')} onValueChange={(v) => setStepForm(p => ({...p, resourceId: v === 'none' ? undefined : parseInt(v)}))}>
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold text-xs">
                    <SelectValue placeholder="Vincular a biblioteca..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none" className="font-bold italic text-muted-foreground">Sin recurso vinculado</SelectItem>
                    {resources.filter(r => r.category === selectedInstrument || r.category === 'Teoría').map(res => (
                      <SelectItem key={res.id} value={String(res.id)} className="font-bold">{res.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-8 bg-muted/30 border-t flex gap-3 shrink-0">
            <Button variant="outline" disabled={isSavingStep} onClick={() => setIsStepFormOpen(false)} className="rounded-xl flex-1 h-14 font-black">Cancelar</Button>
            <Button 
              onClick={handleSaveStep} 
              disabled={!stepForm.title || isSavingStep}
              className="bg-accent text-white rounded-xl flex-1 h-14 font-black shadow-lg shadow-accent/20 gap-2"
            >
              {isSavingStep ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {stepFormMode === 'add' ? 'Confirmar Nuevo Paso' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin: Confirmar Eliminación Plan */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="rounded-[2.5rem] max-sm border-none shadow-2xl p-8 bg-card text-center space-y-6">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive mx-auto">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-black text-foreground">¿Confirmar Borrado?</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground leading-relaxed">
              Estás a punto de eliminar el plan de estudios maestro para {selectedInstrument}. Esta acción no se puede deshacer.
            </DialogDescription>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl h-12 font-black" onClick={() => setIsDeleting(false)}>Cancelar</Button>
            <Button className="flex-1 bg-destructive hover:bg-destructive/90 text-white rounded-xl h-12 font-black shadow-lg shadow-destructive/20" onClick={handleDelete}>Eliminar Todo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
