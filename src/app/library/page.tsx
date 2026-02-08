
"use client"

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, BookOpen, Download, Play, CheckCircle2, AlertCircle, ShieldCheck, Check, Users, Edit2, Link as LinkIcon, Image as ImageIcon, FileText } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useResourceStore } from '@/lib/resource-store';
import { useToast } from '@/hooks/use-toast';
import { Resource } from '@/lib/resources';

export default function LibraryPage() {
  const { user, allUsers, loading } = useAuth();
  const { toggleCompletion, getCompletionStatus } = useCompletionStore();
  const { resources, libraryDescription, updateResource, updateLibraryDescription } = useResourceStore();
  const { toast } = useToast();
  
  const [isMounted, setIsMounted] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isInitialFilterSet, setIsInitialFilterSet] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(''); 
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState(libraryDescription);

  const studentsList = useMemo(() => allUsers.filter(u => u.role === 'student'), [allUsers]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isStaff = user?.role === 'teacher' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user && user.role === 'student' && !isInitialFilterSet) {
      if (user.instruments && user.instruments.length > 0) {
        setSelectedFilters([...user.instruments]);
      }
      setIsInitialFilterSet(true);
    }
  }, [user, isInitialFilterSet]);

  useEffect(() => {
    if (isStaff && studentsList.length > 0 && !selectedStudentId) {
      setSelectedStudentId(studentsList[0].id);
    }
  }, [isStaff, studentsList, selectedStudentId]);

  useEffect(() => {
    if (isStaff && selectedStudentId) {
      const student = studentsList.find(s => s.id === selectedStudentId);
      if (student && student.instruments) {
        setSelectedFilters([...student.instruments]);
      }
    }
  }, [selectedStudentId, isStaff, studentsList]);

  const toggleFilter = (cat: string) => {
    if (cat === 'Todos') {
      setSelectedFilters([]);
      return;
    }
    setSelectedFilters(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat) 
        : [...prev, cat]
    );
  };

  const filtered = resources.filter(res => 
    (selectedFilters.length === 0 || selectedFilters.includes(res.category)) &&
    (res.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggleCompletion = (resourceId: number, title: string) => {
    if (!user) return;
    const targetStudentId = user.role === 'student' ? user.id : selectedStudentId;
    toggleCompletion(resourceId, targetStudentId, user.id);
    const isNowCompleted = !getCompletionStatus(resourceId, targetStudentId);
    
    toast({
      title: isNowCompleted ? "Logro Validado 🏆" : "Estado Actualizado",
      description: isNowCompleted 
        ? `Has marcado "${title}" como completado para el alumno.`
        : `Se ha revertido el estado de "${title}".`,
    });
  };

  const handleSaveResourceEdit = () => {
    if (editingResource) {
      updateResource(editingResource.id, editingResource);
      toast({
        title: "Recurso Actualizado ✨",
        description: "Los cambios se han guardado correctamente.",
      });
      setEditingResource(null);
    }
  };

  const handleSaveDescription = () => {
    updateLibraryDescription(tempDescription);
    toast({
      title: "Descripción Actualizada ✨",
      description: "El texto informativo de la biblioteca ha sido actualizado.",
    });
    setIsEditingDescription(false);
  };

  if (!isMounted || loading || !user) return null;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-extrabold text-foreground font-headline tracking-tight">Biblioteca de Recursos 📚</h1>
            <div className="mt-2 group relative">
              <p className="text-muted-foreground text-lg font-medium leading-relaxed pr-10">
                {libraryDescription}
              </p>
              {isAdmin && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 hover:bg-accent hover:text-white"
                  onClick={() => {
                    setTempDescription(libraryDescription);
                    setIsEditingDescription(true);
                  }}
                  title="Editar descripción"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          {isStaff && (
            <div className="bg-card border-2 border-accent/20 p-2 pl-4 rounded-[2rem] flex flex-col sm:flex-row items-center gap-4 shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-accent" />
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent">Modo Evaluación</p>
                  <p className="text-xs font-bold text-muted-foreground">Alumno seleccionado:</p>
                </div>
              </div>
              <div className="w-full sm:w-64">
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="h-12 rounded-2xl border-accent/30 bg-accent/5 font-black text-foreground focus:ring-accent">
                    <Users className="w-4 h-4 mr-2 text-accent" />
                    <SelectValue placeholder="Seleccionar Alumno" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {studentsList.map(student => (
                      <SelectItem key={student.id} value={student.id} className="font-bold py-3">
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-primary/5 p-4 rounded-3xl border border-primary/10">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar recursos..." 
              className="pl-11 rounded-2xl h-12 border-primary/20 bg-card focus:border-accent transition-all font-medium text-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {['Todos', 'Guitarra', 'Piano', 'Bajo', 'Violín', 'Batería', 'Canto', 'Teoría'].map((cat) => {
              const isActive = cat === 'Todos' ? selectedFilters.length === 0 : selectedFilters.includes(cat);
              return (
                <Button
                  key={cat}
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    "rounded-full px-5 h-10 transition-all font-black text-xs shrink-0",
                    isActive 
                      ? "bg-accent text-white border-accent shadow-md shadow-accent/20" 
                      : "border-primary/20 bg-card text-muted-foreground hover:border-accent/50"
                  )}
                  onClick={() => toggleFilter(cat)}
                >
                  {cat}
                  {isActive && cat !== 'Todos' && <Check className="ml-2 w-3 h-3" />}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length > 0 ? filtered.map((res) => {
            const isCompleted = getCompletionStatus(res.id, user?.role === 'student' ? user.id : selectedStudentId);
            
            return (
              <Card key={res.id} className="rounded-[2.5rem] border-2 border-primary/20 shadow-md group overflow-hidden bg-card hover:shadow-xl hover:border-accent/40 transition-all duration-300">
                <div className="relative aspect-video overflow-hidden">
                  <Image 
                    src={res.img.imageUrl} 
                    alt={res.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint={res.img.imageHint}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white/95 dark:bg-slate-900/95 text-secondary-foreground dark:text-foreground backdrop-blur-sm rounded-full px-4 py-1 font-black shadow-sm border-none">{res.category}</Badge>
                  </div>
                  {isAdmin && (
                    <div className="absolute top-4 right-4">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-full w-10 h-10 shadow-lg bg-white/90 dark:bg-slate-900/90 hover:bg-accent hover:text-white transition-all"
                        onClick={() => setEditingResource(res)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-black group-hover:text-accent transition-colors leading-tight min-h-[3rem] line-clamp-2 text-foreground">{res.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-widest">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span>Contenido {res.type}</span>
                  </div>

                  <div className={cn(
                    "p-4 rounded-3xl border-2 transition-all flex items-center justify-between shadow-sm",
                    isCompleted ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50" : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner",
                        isCompleted ? "bg-card text-emerald-600 dark:text-emerald-400" : "bg-card text-orange-600 dark:text-orange-400"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-orange-700 dark:text-orange-400"
                        )}>
                          {isCompleted ? "Completado" : "Pendiente"}
                        </p>
                        <p className="text-[11px] font-bold text-muted-foreground leading-none mt-1">
                          {isCompleted ? "Examen validado ✅" : "Examen no completado ⏳"}
                        </p>
                      </div>
                    </div>

                    {isStaff && (
                      <div className="flex flex-col items-center gap-1.5 bg-card/50 p-2 rounded-2xl border border-primary/5">
                        <span className="text-[8px] font-black uppercase text-muted-foreground">Validar</span>
                        <Switch 
                          checked={isCompleted} 
                          onCheckedChange={() => handleToggleCompletion(res.id, res.title)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-none rounded-2xl border-2 border-primary/10 h-12 gap-2 font-black px-4 text-xs hover:border-accent hover:bg-accent/5 text-foreground"
                    onClick={() => res.downloadUrl && window.open(res.downloadUrl, '_blank')}
                  >
                    <Download className="w-4 h-4" /> Descargar
                  </Button>
                  <Button 
                    className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-2xl gap-2 font-black h-12 shadow-lg shadow-accent/20"
                    onClick={() => res.interactUrl && window.open(res.interactUrl, '_blank')}
                  >
                    <Play className="w-4 h-4" /> Interactúa!
                  </Button>
                </CardFooter>
              </Card>
            );
          }) : (
            <div className="col-span-full py-20 text-center bg-primary/5 rounded-[3rem] border-4 border-dashed border-primary/10">
              <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-black text-foreground">Sin resultados</h3>
              <p className="text-muted-foreground font-bold italic">No hay recursos que coincidan con los filtros seleccionados.</p>
              <Button variant="link" onClick={() => setSelectedFilters([])} className="text-accent font-black mt-2 underline">Ver todo el catálogo</Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!editingResource} onOpenChange={(open) => !open && setEditingResource(null)}>
        <DialogContent className="rounded-[2.5rem] max-w-xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-primary/10 dark:bg-accent/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
              <Edit2 className="w-6 h-6 text-accent" />
              Editar Recurso
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground font-medium">
              Modifica los detalles del material educativo.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6 bg-card overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Título del Material</Label>
                  <Input 
                    value={editingResource?.title || ''} 
                    onChange={(e) => setEditingResource(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="h-12 rounded-xl border-2 font-bold text-foreground bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Categoría (Instrumento)</Label>
                  <Select 
                    value={editingResource?.category || ''} 
                    onValueChange={(val) => setEditingResource(prev => prev ? {...prev, category: val} : null)}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2 font-bold text-foreground bg-card">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {['Guitarra', 'Piano', 'Bajo', 'Violín', 'Batería', 'Canto', 'Teoría'].map(cat => (
                        <SelectItem key={cat} value={cat} className="font-bold">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> URL de Imagen de Portada
                </Label>
                <Input 
                  value={editingResource?.img.imageUrl || ''} 
                  onChange={(e) => setEditingResource(prev => prev ? {...prev, img: {...prev.img, imageUrl: e.target.value}} : null)}
                  className="h-12 rounded-xl border-2 font-bold text-foreground bg-card"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Download className="w-3 h-3" /> Enlace de Descarga
                  </Label>
                  <Input 
                    value={editingResource?.downloadUrl || ''} 
                    onChange={(e) => setEditingResource(prev => prev ? {...prev, downloadUrl: e.target.value} : null)}
                    className="h-12 rounded-xl border-2 font-bold text-foreground bg-card"
                    placeholder="#"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" /> Enlace de Interacción
                  </Label>
                  <Input 
                    value={editingResource?.interactUrl || ''} 
                    onChange={(e) => setEditingResource(prev => prev ? {...prev, interactUrl: e.target.value} : null)}
                    className="h-12 rounded-xl border-2 font-bold text-foreground bg-card"
                    placeholder="#"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/30 flex gap-3 border-t">
            <Button variant="outline" onClick={() => setEditingResource(null)} className="rounded-xl flex-1 h-14 font-black text-foreground">Cancelar</Button>
            <Button onClick={handleSaveResourceEdit} className="bg-accent text-white rounded-xl flex-1 h-14 font-black shadow-lg shadow-accent/20">Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingDescription} onOpenChange={isEditingDescription => setIsEditingDescription(isEditingDescription)}>
        <DialogContent className="rounded-[2.5rem] max-w-xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-primary/10 dark:bg-accent/10 p-8 border-b space-y-2">
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
              <FileText className="w-6 h-6 text-accent" />
              Editar Descripción de la Biblioteca
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground font-medium">
              Personaliza el mensaje de bienvenida y las instrucciones para tus alumnos.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 bg-card">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Texto Descriptivo</Label>
              <Textarea 
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                className="min-h-[200px] rounded-2xl border-2 font-bold p-4 focus:border-accent text-foreground bg-card"
                placeholder="Escribe aquí la descripción..."
              />
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/30 flex gap-3 border-t">
            <Button variant="outline" onClick={() => setIsEditingDescription(false)} className="rounded-xl flex-1 h-14 font-black text-foreground">Cancelar</Button>
            <Button onClick={handleSaveDescription} className="bg-accent text-white rounded-xl flex-1 h-14 font-black shadow-lg shadow-accent/20">Guardar Descripción</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
