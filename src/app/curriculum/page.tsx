"use client"

import { useState, useMemo, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useCurriculumStore, CurriculumPlan, CurriculumStep } from '@/lib/curriculum-store';
import { useResourceStore } from '@/lib/resource-store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const INSTRUMENTS_LIST = ['Guitarra', 'Piano', 'Violín', 'Canto', 'Batería', 'Bajo', 'Teoría'];

export default function CurriculumPage() {
  const { user } = useAuth();
  const { curriculums, saveCurriculum, deleteCurriculum, loading } = useCurriculumStore();
  const { resources } = useResourceStore();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedInstrument, setSelectedInstrument] = useState<string>(INSTRUMENTS_LIST[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMeshOpen, setIsMeshOpen] = useState(false);
  const [viewingStep, setViewingStep] = useState<CurriculumStep | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  
  const [editPlan, setEditPlan] = useState<Partial<CurriculumPlan>>({
    instrument: INSTRUMENTS_LIST[0],
    description: '',
    steps: []
  });

  const isAdmin = user?.role === 'admin';
  const currentPlan = useMemo(() => 
    curriculums.find(c => c.instrument === selectedInstrument), 
  [curriculums, selectedInstrument]);

  const teacherImg = PlaceHolderImages.find(img => img.id === 'teacher-curriculum')?.imageUrl || "https://picsum.photos/seed/teacher/600/400";

  // Manejo de la línea interactiva (máximo 4 puntos visibles)
  const visibleSteps = useMemo(() => {
    if (!currentPlan) return [];
    // Ventana deslizante centrada en currentStepIdx
    let start = Math.max(0, currentStepIdx - 1);
    let end = Math.min(currentPlan.steps.length, start + 4);
    
    // Ajustar si estamos al final para siempre mostrar 4 si es posible
    if (end - start < 4 && start > 0) {
      start = Math.max(0, end - 4);
    }
    
    return currentPlan.steps.slice(start, end).map((step, i) => ({
      ...step,
      originalIndex: start + i
    }));
  }, [currentPlan, currentStepIdx]);

  const openCreate = () => {
    setEditPlan({
      instrument: selectedInstrument,
      description: '',
      steps: []
    });
    setIsEditing(true);
  };

  const openEdit = () => {
    if (currentPlan) {
      setEditPlan(JSON.parse(JSON.stringify(currentPlan)));
      setIsEditing(true);
    }
  };

  const addStep = () => {
    setEditPlan(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { title: '', explanation: '', durationClasses: 1 }]
    }));
  };

  const removeStep = (index: number) => {
    setEditPlan(prev => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index: number, field: keyof CurriculumStep, value: any) => {
    const newSteps = [...(editPlan.steps || [])];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setEditPlan(prev => ({ ...prev, steps: newSteps }));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...(editPlan.steps || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setEditPlan(prev => ({ ...prev, steps: newSteps }));
  };

  const handleSave = async () => {
    if (!editPlan.instrument || !editPlan.description) {
      toast({ variant: "destructive", title: "Datos incompletos" });
      return;
    }
    await saveCurriculum(editPlan as CurriculumPlan, currentPlan?.id);
    toast({ title: "Plan de Estudios Guardado ✨" });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (currentPlan) {
      await deleteCurriculum(currentPlan.id);
      toast({ title: "Plan Eliminado 🗑️" });
      setIsDeleting(false);
    }
  };

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return <AppLayout><div className="p-20 text-center">No tienes permiso para ver esta sección.</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-12">
        {/* Presentación de la Sección */}
        <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-accent to-accent/80 p-8 md:p-12 text-white shadow-2xl shadow-accent/20">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-md">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Guía Docente Maestra</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tight leading-none">
                Plan de Estudios <br /> <span className="text-secondary">Estandarizado</span>
              </h1>
              <p className="text-lg md:text-xl font-medium text-white/90 max-w-2xl leading-relaxed">
                Bienvenido al núcleo académico de Aprende con Ritmo. Aquí encontrarás la ruta estructurada que garantiza que cada alumno, sin importar su profesor, reciba una formación técnica y musical de excelencia.
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
                  src={teacherImg}
                  alt="Profesor de Música"
                  fill
                  className="object-cover"
                  data-ai-hint="music teacher"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Selección de Instrumento y Mallas */}
        <div className="space-y-8 px-4">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
              <LayoutList className="w-6 h-6 text-accent" />
              Consulta las Mallas Curriculares
            </h2>
            <div className="flex flex-wrap gap-3 w-full">
              {INSTRUMENTS_LIST.map(inst => (
                <Button
                  key={inst}
                  variant="outline"
                  className={cn(
                    "rounded-2xl h-14 px-6 font-black border-2 transition-all gap-2 flex-1 min-w-[180px]",
                    selectedInstrument === inst 
                      ? "bg-accent border-accent text-white shadow-lg scale-105" 
                      : "border-primary/20 hover:border-accent/40 text-muted-foreground"
                  )}
                  onClick={() => {
                    setSelectedInstrument(inst);
                    setCurrentStepIdx(0);
                    setIsMeshOpen(true);
                  }}
                >
                  {inst}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-w-xs pt-4 border-t border-primary/10">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Ver Línea Interactiva por Instrumento</Label>
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

        {/* Línea de Tiempo Interactiva */}
        <section className="space-y-8 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-accent rounded-full" />
              <h2 className="text-2xl font-black text-foreground">Ruta de Aprendizaje Interactiva: {selectedInstrument}</h2>
            </div>
            {isAdmin && currentPlan && (
              <div className="flex gap-2">
                <Button onClick={openEdit} size="icon" className="h-12 w-12 rounded-xl bg-accent text-white shadow-lg">
                  <Edit2 className="w-5 h-5" />
                </Button>
                <Button onClick={() => setIsDeleting(true)} size="icon" variant="outline" className="h-12 w-12 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : currentPlan && currentPlan.steps.length > 0 ? (
            <div className="relative pt-10 pb-20">
              {/* Línea conectora de fondo */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0 rounded-full" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-accent -translate-y-1/2 z-0 rounded-full transition-all duration-700" 
                style={{ width: `${(currentStepIdx / (currentPlan.steps.length - 1)) * 100}%` }}
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {visibleSteps.map((step, i) => {
                  const isCompleted = step.originalIndex < currentStepIdx;
                  const isCurrent = step.originalIndex === currentStepIdx;
                  const isFuture = step.originalIndex > currentStepIdx;

                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "flex flex-col items-center text-center space-y-6 transition-all duration-500 cursor-pointer group",
                        isCompleted && "opacity-40 scale-90 hover:opacity-100",
                        isFuture && "opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100"
                      )}
                      onClick={() => {
                        setViewingStep(step);
                        setCurrentStepIdx(step.originalIndex);
                      }}
                    >
                      <div className={cn(
                        "w-20 h-20 rounded-[2rem] flex items-center justify-center text-2xl font-black shadow-xl transition-all duration-500 group-hover:scale-110",
                        isCurrent 
                          ? "bg-accent text-white ring-8 ring-accent/20 scale-110" 
                          : isCompleted 
                            ? "bg-emerald-500 text-white" 
                            : "bg-white dark:bg-slate-800 text-muted-foreground border-4 border-primary/10"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-10 h-10" /> : step.originalIndex + 1}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className={cn(
                          "font-black text-lg leading-tight",
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
                <Button onClick={openCreate} className="bg-accent text-white rounded-2xl h-14 px-10 font-black shadow-xl shadow-accent/20 gap-2">
                  <Plus className="w-5 h-5" /> Crear Primer Plan
                </Button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* MODAL: DETALLES DEL PASO (INTERACTIVO) */}
      <Dialog open={!!viewingStep} onOpenChange={(open) => !open && setViewingStep(null)}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
          {viewingStep && (
            <>
              <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
                <div className="flex items-center gap-3">
                  <Badge className="bg-accent text-white rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none">
                    Paso {currentPlan?.steps.findIndex(s => s.title === viewingStep.title)! + 1}
                  </Badge>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Duración: {viewingStep.durationClasses} Sesiones
                  </span>
                </div>
                <DialogTitle className="text-3xl font-black text-foreground leading-tight">
                  {viewingStep.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-card">
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Info className="w-4 h-4 text-accent" /> Guía para el Profesor
                  </h4>
                  <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10">
                    <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap italic">
                      "{viewingStep.explanation}"
                    </p>
                  </div>
                </div>

                {viewingStep.resourceId && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-accent" /> Material de Apoyo
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
                  "{currentPlan?.description}"
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
                      <p className="text-xs font-medium text-muted-foreground leading-relaxed">{step.explanation}</p>
                      <div className="flex gap-3 pt-2">
                        <Badge variant="outline" className="rounded-lg text-[10px] font-black uppercase px-2 py-0.5 border-primary/20">
                          {step.durationClasses} Clases
                        </Badge>
                        {step.resourceId && (
                          <Badge variant="outline" className="rounded-lg text-[10px] font-black uppercase px-2 py-0.5 border-accent/20 text-accent">
                            Recurso Enlazado
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

      {/* Admin: Modal de Configuración Global */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="rounded-[2.5rem] max-w-4xl border-none shadow-2xl p-0 overflow-hidden flex flex-col h-[90vh]">
          <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-accent" />
              Configurar Plan Maestro
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">Define la ruta académica paso a paso para {editPlan.instrument}.</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 bg-card">
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Instrumento</Label>
                  <Select value={editPlan.instrument} onValueChange={(v) => setEditPlan(p => ({...p, instrument: v}))}>
                    <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {INSTRUMENTS_LIST.map(inst => (
                        <SelectItem key={inst} value={inst} className="font-bold">{inst}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descripción Global del Plan</Label>
                  <Textarea 
                    value={editPlan.description}
                    onChange={(e) => setEditPlan(p => ({...p, description: e.target.value}))}
                    className="min-h-[100px] rounded-xl border-2 font-bold"
                    placeholder="Ej: Este plan enfoca la técnica de púa alterna desde el primer día..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="font-black text-lg text-foreground uppercase tracking-widest flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-accent" /> Pasos del Esquema
                  </h3>
                  <Button size="sm" variant="outline" onClick={addStep} className="rounded-xl border-2 h-10 font-black uppercase text-[10px]">
                    <Plus className="w-4 h-4 mr-1" /> Añadir Paso
                  </Button>
                </div>

                <div className="space-y-4">
                  {editPlan.steps?.map((step, idx) => (
                    <Card key={idx} className="rounded-3xl border-2 border-primary/10 overflow-hidden relative group">
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => moveStep(idx, 'up')} disabled={idx === 0}><ChevronUp className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => moveStep(idx, 'down')} disabled={idx === editPlan.steps!.length - 1}><ChevronDown className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => removeStep(idx)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <CardContent className="p-6 space-y-4 bg-primary/5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Título del Paso #{idx + 1}</Label>
                            <Input value={step.title} onChange={(e) => updateStep(idx, 'title', e.target.value)} className="h-10 rounded-lg border-2 font-black" placeholder="Ej: Primeros Acordes" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Duración (Clases)</Label>
                            <Select value={String(step.durationClasses)} onValueChange={(v) => updateStep(idx, 'durationClasses', parseInt(v))}>
                              <SelectTrigger className="h-10 rounded-lg border-2 font-bold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="1" className="font-bold">1 Clase</SelectItem>
                                <SelectItem value="2" className="font-bold">2 Clases</SelectItem>
                                <SelectItem value="3" className="font-bold">3 Clases</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground">Explicación para el Profesor</Label>
                          <Textarea value={step.explanation} onChange={(e) => updateStep(idx, 'explanation', e.target.value)} className="min-h-[80px] rounded-lg border-2 font-medium text-xs" placeholder="Detalla qué debe lograr el alumno en este punto..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground">Recurso Vinculado (Opcional)</Label>
                          <Select value={String(step.resourceId || 'none')} onValueChange={(v) => updateStep(idx, 'resourceId', v === 'none' ? undefined : parseInt(v))}>
                            <SelectTrigger className="h-10 rounded-lg border-2 font-bold text-xs">
                              <SelectValue placeholder="Vincular a biblioteca..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="none" className="font-bold italic">Sin recurso vinculado</SelectItem>
                              {resources.filter(r => r.category === editPlan.instrument || r.category === 'Teoría').map(res => (
                                <SelectItem key={res.id} value={String(res.id)} className="font-bold">{res.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-8 bg-muted/30 border-t flex gap-3 shrink-0">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl flex-1 h-12 font-black">Cancelar</Button>
            <Button onClick={handleSave} className="bg-accent text-white rounded-xl flex-1 h-12 font-black shadow-lg shadow-accent/20">
              <Save className="w-4 h-4 mr-2" /> Guardar Plan Maestro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin: Confirmar Eliminación */}
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
            <Button className="flex-1 bg-destructive hover:bg-destructive/90 text-white rounded-xl h-12 font-black shadow-lg shadow-destructive/20" onClick={handleDelete}>Eliminar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
