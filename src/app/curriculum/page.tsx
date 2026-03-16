
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
  Clock, 
  CheckCircle2, 
  Link as LinkIcon, 
  GraduationCap,
  Save,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  LayoutList
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useCurriculumStore, CurriculumPlan, CurriculumStep } from '@/lib/curriculum-store';
import { useResourceStore } from '@/lib/resource-store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const INSTRUMENTS_LIST = ['Guitarra', 'Piano', 'Violín', 'Canto', 'Batería', 'Bajo', 'Teoría'];

export default function CurriculumPage() {
  const { user } = useAuth();
  const { curriculums, saveCurriculum, deleteCurriculum, loading } = useCurriculumStore();
  const { resources } = useResourceStore();
  const { toast } = useToast();

  const [selectedInstrument, setSelectedInstrument] = useState<string>(INSTRUMENTS_LIST[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [editPlan, setEditPlan] = useState<Partial<CurriculumPlan>>({
    instrument: INSTRUMENTS_LIST[0],
    description: '',
    steps: []
  });

  const isAdmin = user?.role === 'admin';
  const currentPlan = useMemo(() => 
    curriculums.find(c => c.instrument === selectedInstrument), 
  [curriculums, selectedInstrument]);

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
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground font-headline tracking-tight flex items-center gap-3">
              <BookOpenCheck className="w-10 h-10 text-accent" />
              Plan de Estudios Estandarizado 📚
            </h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">Esquema académico para guiar el aprendizaje de todos los alumnos.</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
              <SelectTrigger className="h-14 rounded-2xl border-2 font-black bg-card shadow-sm w-full md:w-64">
                <SelectValue placeholder="Instrumento" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {INSTRUMENTS_LIST.map(inst => (
                  <SelectItem key={inst} value={inst} className="font-bold py-3">{inst}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAdmin && currentPlan && (
              <Button onClick={openEdit} size="icon" className="h-14 w-14 rounded-2xl bg-accent text-white shadow-lg shrink-0">
                <Edit2 className="w-6 h-6" />
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : currentPlan ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
              <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-md bg-card overflow-hidden">
                <CardHeader className="bg-primary/5 p-8 border-b">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-accent text-white rounded-full font-black px-4 py-1 border-none shadow-sm uppercase text-[10px]">
                      {selectedInstrument}
                    </Badge>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{currentPlan.steps.length} Pasos</span>
                  </div>
                  <CardTitle className="text-2xl font-black mt-4">Guía Académica</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                    "{currentPlan.description}"
                  </p>
                  <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-[2rem] border-2 border-blue-100 dark:border-blue-900/30 flex gap-4 items-start">
                    <Info className="w-6 h-6 text-blue-600 shrink-0" />
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300 leading-relaxed">
                      Sigue este esquema con tus alumnos para asegurar una base técnica uniforme. La duración de cada paso es referencial.
                    </p>
                  </div>
                </CardContent>
                {isAdmin && (
                  <CardFooter className="p-6 bg-muted/30 border-t flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 font-black h-12" onClick={() => setIsDeleting(true)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Eliminar Plan
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-2 h-8 bg-accent rounded-full" />
                <h2 className="text-2xl font-black text-foreground">Ruta de Aprendizaje</h2>
              </div>

              <div className="space-y-4">
                {currentPlan.steps.map((step, idx) => {
                  const resource = resources.find(r => r.id === step.resourceId);
                  return (
                    <div key={idx} className="flex gap-6 group">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-card border-2 border-accent/20 shadow-md flex items-center justify-center font-black text-accent text-xl relative z-10 group-hover:scale-110 transition-transform group-hover:bg-accent group-hover:text-white group-hover:border-accent">
                          {idx + 1}
                        </div>
                        {idx < currentPlan.steps.length - 1 && <div className="w-1 flex-1 bg-accent/10 my-2 rounded-full" />}
                      </div>
                      
                      <Card className="flex-1 rounded-[2rem] border-2 border-primary/10 shadow-sm bg-card hover:border-accent/30 transition-all">
                        <CardContent className="p-6 sm:p-8 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-black text-foreground">{step.title}</h3>
                            <div className="flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 shrink-0">
                              <Clock className="w-3.5 h-3.5 text-accent" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duración: {step.durationClasses} {step.durationClasses === 1 ? 'Clase' : 'Clases'}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                            {step.explanation}
                          </p>

                          {resource && (
                            <div className="pt-4 border-t border-primary/5">
                              <Button 
                                variant="ghost" 
                                className="h-auto p-4 rounded-2xl bg-accent/5 border border-accent/10 hover:bg-accent/10 w-full justify-between group/res"
                                onClick={() => router.push(`/library?resourceId=${resource.id}`)}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-accent shadow-sm">
                                    <LinkIcon className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-[9px] font-black uppercase text-accent tracking-widest">Recurso de Apoyo</p>
                                    <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{resource.title}</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-accent group-hover/res:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
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
      </div>

      {/* Admin: Modal de Edición de Plan */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="rounded-[2.5rem] max-w-4xl border-none shadow-2xl p-0 overflow-hidden flex flex-col h-[90vh]">
          <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-accent" />
              Configurar Plan de Estudios
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
                    <LayoutList className="w-5 h-5 text-accent" /> Pasos del Esquema
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
                  {editPlan.steps?.length === 0 && (
                    <div className="py-10 text-center bg-muted/20 rounded-3xl border-2 border-dashed">
                      <p className="text-xs font-bold text-muted-foreground">No has añadido pasos todavía.</p>
                    </div>
                  )}
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
        <DialogContent className="rounded-[2.5rem] max-w-sm border-none shadow-2xl p-8 bg-card text-center space-y-6">
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
