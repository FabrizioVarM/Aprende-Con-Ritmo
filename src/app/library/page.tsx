
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
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  BookOpen, 
  Download, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Check, 
  Edit2, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  FileText, 
  Timer, 
  FileType, 
  Eye, 
  EyeOff, 
  Globe, 
  ChevronDown, 
  Lock, 
  Unlock, 
  Plus,
  Target,
  Sparkles,
  Info,
  GraduationCap,
  X
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useResourceStore } from '@/lib/resource-store';
import { useToast } from '@/hooks/use-toast';
import { Resource } from '@/lib/resources';
import { AvatarPreviewContent } from '@/components/AvatarPreviewContent';
import { getDirectImageUrl, getDriveDownloadUrl } from '@/lib/utils/images';

const ALL_CATEGORIES = ['Todos', 'Guitarra', 'Piano', 'Bajo', 'Violín', 'Batería', 'Canto', 'Teoría'];
const CONTENT_TYPES = ['PDF', 'Video', 'Libro', 'Audio', 'Clase', 'Partitura'];
const FALLBACK_IMAGE = "https://picsum.photos/seed/fallback/600/400";

export default function LibraryPage() {
  const { user, allUsers, loading } = useAuth();
  const { toggleCompletion, getCompletionStatus } = useCompletionStore();
  const { 
    resources, 
    libraryDescription, 
    updateResource, 
    addResource,
    updateLibraryDescription,
    toggleStudentVisibility,
    toggleGlobalVisibility,
    toggleEnabledStatus
  } = useResourceStore();
  const { toast } = useToast();
  
  const [isMounted, setIsMounted] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isInitialFilterSet, setIsInitialFilterSet] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(''); 
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState(libraryDescription);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Helper local states for UI toggles in forms
  const [enableDownloadInForm, setEnableDownloadInForm] = useState(true);
  const [enableInteractInForm, setEnableInteractInForm] = useState(true);

  // Create State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    title: '',
    category: 'Guitarra',
    type: 'PDF',
    length: '',
    description: '',
    objective: '',
    tip: '',
    img: { imageUrl: '', imageHint: 'music' },
    downloadUrl: '#',
    interactUrl: '#',
    isVisibleGlobally: false,
    isEnabled: false,
    assignedStudentIds: []
  });

  const studentsList = useMemo(() => allUsers.filter(u => u.role === 'student'), [allUsers]);
  const selectedStudent = useMemo(() => studentsList.find(s => s.id === selectedStudentId), [studentsList, selectedStudentId]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isStaff = user?.role === 'teacher' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';
  const canManage = isAdmin || (user?.role === 'teacher' && user?.canManageLibrary);

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

  // Sincronizar toggles de formulario cuando se edita un recurso
  useEffect(() => {
    if (editingResource) {
      setEnableDownloadInForm(editingResource.downloadUrl !== '#' && !!editingResource.downloadUrl);
      setEnableInteractInForm(editingResource.interactUrl !== '#' && !!editingResource.interactUrl);
    }
  }, [editingResource]);

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

  const visibleResources = useMemo(() => {
    if (!user) return [];
    if (isStaff) return resources;
    return resources.filter(res => 
      res.isVisibleGlobally === true || 
      res.assignedStudentIds?.includes(user.id)
    );
  }, [resources, user, isStaff]);

  const filtered = visibleResources.filter(res => 
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
      const finalResource = {
        ...editingResource,
        downloadUrl: enableDownloadInForm ? editingResource.downloadUrl : '#',
        interactUrl: enableInteractInForm ? editingResource.interactUrl : '#'
      };
      updateResource(editingResource.id, finalResource);
      toast({
        title: "Recurso Actualizado ✨",
        description: "Los cambios se han guardado correctamente.",
      });
      setEditingResource(null);
    }
  };

  const handleCreateResource = () => {
    if (!newResource.title) {
      toast({ variant: "destructive", title: "Error", description: "El título es obligatorio." });
      return;
    }
    const id = Date.now();
    const finalResource = {
      ...newResource,
      id,
      downloadUrl: enableDownloadInForm ? newResource.downloadUrl : '#',
      interactUrl: enableInteractInForm ? newResource.interactUrl : '#'
    } as Resource;

    addResource(finalResource);
    toast({ title: "Material Creado 🎊", description: "El recurso ha sido añadido a la biblioteca." });
    setIsCreateDialogOpen(false);
    setNewResource({
      title: '',
      category: 'Guitarra',
      type: 'PDF',
      length: '',
      description: '',
      objective: '',
      tip: '',
      img: { imageUrl: '', imageHint: 'music' },
      downloadUrl: '#',
      interactUrl: '#',
      isVisibleGlobally: false,
      isEnabled: false,
      assignedStudentIds: []
    });
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
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold text-foreground font-headline tracking-tight">Biblioteca de Recursos 📚</h1>
              {canManage && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="rounded-2xl bg-accent text-white h-12 px-6 shadow-lg hover:scale-105 transition-all font-black gap-2"
                >
                  <Plus className="w-5 h-5" /> Material nuevo
                </Button>
              )}
            </div>
            <div className="mt-2 group relative">
              <p className="text-muted-foreground text-lg font-medium leading-relaxed pr-10">
                {libraryDescription}
              </p>
              {canManage && (
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
            <div className="bg-card border-2 border-accent/40 p-2 pl-4 pr-4 rounded-[2rem] flex flex-col sm:flex-row items-center gap-4 shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-accent" />
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent">Modo Evaluación</p>
                  <p className="text-xs font-bold text-muted-foreground">Alumno:</p>
                </div>
              </div>

              {selectedStudent && (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cursor-zoom-in hover:scale-110 transition-transform relative group">
                      <Avatar className="w-12 h-12 border-2 border-accent shadow-md shrink-0">
                        {selectedStudent.photoUrl ? (
                          <AvatarImage src={getDirectImageUrl(selectedStudent.photoUrl)} className="object-cover" style={selectedStudent.photoTransform ? { transform: `translate(${selectedStudent.photoTransform.x}px, ${selectedStudent.photoTransform.y}px) scale(${selectedStudent.photoTransform.scale})`, transition: 'transform 0.2s ease-out' } : {}} />
                        ) : (
                          <AvatarImage src={`https://picsum.photos/seed/${selectedStudent.avatarSeed || selectedStudent.id}/200`} style={selectedStudent.photoTransform ? { transform: `translate(${selectedStudent.photoTransform.x}px, ${selectedStudent.photoTransform.y}px) scale(${selectedStudent.photoTransform.scale})`, transition: 'transform 0.2s ease-out' } : {}} />
                        )}
                        <AvatarFallback className="text-sm font-black">{selectedStudent.name ? selectedStudent.name[0] : 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Search className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2.5rem] max-w-sm border-none shadow-2xl p-0 overflow-hidden bg-card">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Perfil del Estudiante</DialogTitle>
                      <DialogDescription>Vista detallada del perfil del alumno bajo evaluación actual.</DialogDescription>
                    </DialogHeader>
                    <AvatarPreviewContent 
                      src={selectedStudent.photoUrl ? getDirectImageUrl(selectedStudent.photoUrl) : `https://picsum.photos/seed/${selectedStudent.avatarSeed || selectedStudent.id}/600`}
                      name={selectedStudent.name || 'Alumno'}
                      subtitle="Estudiante bajo evaluación"
                    />
                  </DialogContent>
                </Dialog>
              )}

              <div className="w-full sm:w-64">
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="h-14 rounded-2xl border-accent/30 bg-accent/5 font-black text-foreground focus:ring-accent flex items-center gap-3 px-4 transition-all overflow-hidden">
                    <span className="truncate">{selectedStudent ? selectedStudent.name : "Seleccionar Alumno"}</span>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 shadow-xl p-1">
                    {studentsList.map(student => (
                      <SelectItem key={student.id} value={student.id} className="font-bold py-3 rounded-xl cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-primary/10 shrink-0 shadow-sm">
                            {student.photoUrl ? (
                              <AvatarImage src={getDirectImageUrl(student.photoUrl)} className="object-cover" style={student.photoTransform ? { transform: `translate(${student.photoTransform.x}px, ${student.photoTransform.y}px) scale(${student.photoTransform.scale})`, transition: 'transform 0.2s ease-out' } : {}} />
                            ) : (
                              <AvatarImage src={`https://picsum.photos/seed/${student.avatarSeed || student.id}/100`} style={student.photoTransform ? { transform: `translate(${student.photoTransform.x}px, ${student.photoTransform.y}px) scale(${student.photoTransform.scale})`, transition: 'transform 0.2s ease-out' } : {}} />
                            )}
                            <AvatarFallback className="text-xs font-black">{student.name ? student.name[0] : 'U'}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{student.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-primary/5 p-4 rounded-3xl border border-primary/20">
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
            {ALL_CATEGORIES.map((cat) => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length > 0 ? filtered.map((res) => {
            const isCompleted = getCompletionStatus(res.id, user?.role === 'student' ? user.id : selectedStudentId);
            const isVisibleForTarget = res.isVisibleGlobally || res.assignedStudentIds?.includes(selectedStudentId);
            const isEnabled = res.isEnabled !== false;
            const isLockedForStudent = !isStaff && !isEnabled;

            let rawImgUrl = FALLBACK_IMAGE;
            if (typeof res.img === 'string') {
              rawImgUrl = res.img;
            } else if (res.img && res.img.imageUrl) {
              rawImgUrl = res.img.imageUrl;
            }
            
            const imgUrl = getDirectImageUrl(rawImgUrl);
            const imgHint = (typeof res.img === 'object' && res.img !== null) ? res.img.imageHint : "music resource";
            
            return (
              <Card 
                key={res.id} 
                className={cn(
                  "rounded-[2.5rem] border-2 shadow-md group overflow-hidden bg-card hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col",
                  isStaff && !res.isVisibleGlobally && !res.assignedStudentIds?.includes(selectedStudentId) 
                    ? "border-dashed border-primary/20 opacity-80" 
                    : "border-primary/40 hover:border-accent/40",
                  isLockedForStudent && "opacity-70 grayscale-[0.3]"
                )}
                onClick={() => {
                  if (isLockedForStudent) return;
                  setViewingResource(res);
                }}
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image 
                    src={imgUrl} 
                    alt={res.title}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-700 group-hover:scale-110",
                      isLockedForStudent && "blur-[2px]",
                      !isEnabled && "opacity-60 grayscale-[0.2]"
                    )}
                    data-ai-hint={imgHint}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== FALLBACK_IMAGE) {
                        target.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-white/95 dark:bg-slate-900/95 text-secondary-foreground dark:text-foreground backdrop-blur-sm rounded-full px-4 py-1 font-black shadow-sm border-none w-fit">{res.category}</Badge>
                    {isStaff && !res.isVisibleGlobally && (
                      <Badge variant="destructive" className="rounded-full px-3 py-1 font-black text-[8px] uppercase tracking-widest gap-1 w-fit">
                        <EyeOff className="w-2.5 h-2.5" /> Privado
                      </Badge>
                    )}
                    {!isEnabled && (
                      <Badge variant="secondary" className="bg-orange-500 text-white rounded-full px-3 py-1 font-black text-[8px] uppercase tracking-widest gap-1 w-fit border-none">
                        <Lock className="w-2.5 h-2.5" /> Bloqueado
                      </Badge>
                    )}
                  </div>
                  {canManage && (
                    <div className="absolute top-4 right-4">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-full w-10 h-10 shadow-lg bg-white/90 dark:bg-slate-900/90 hover:bg-accent hover:text-white transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingResource(res);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {isLockedForStudent && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 text-center">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                        <Lock className="w-8 h-8 text-white mx-auto mb-2" />
                        <p className="text-white text-[10px] font-black uppercase tracking-widest leading-tight">
                          Material Deshabilitado por la Academia
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-black group-hover:text-accent transition-colors leading-tight min-h-[3rem] line-clamp-2 text-foreground font-headline">{res.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                      <BookOpen className="w-3.5 h-3.5 text-accent" />
                      <span>{res.type}</span>
                    </div>
                    {res.length && (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        <Timer className="w-3.5 h-3.5 text-accent" />
                        <span>{res.length}</span>
                      </div>
                    )}
                  </div>

                  {isStaff && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Collapsible className="pb-2">
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-between h-9 rounded-xl bg-accent/5 hover:bg-accent/10 border border-accent/10 mb-2 px-3 group"
                          >
                            <div className="flex items-center gap-2">
                              <Eye className="w-3.5 h-3.5 text-accent" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-accent">Editar Visibilidad</span>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-accent transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="grid grid-cols-2 gap-2">
                            <div className={cn(
                              "p-3 rounded-2xl border flex flex-col gap-1 items-center text-center transition-all duration-300",
                              isVisibleForTarget ? "bg-blue-50 border-blue-100 dark:bg-blue-900/10" : "bg-muted/30 border-primary/5",
                              res.isVisibleGlobally && "opacity-40 grayscale-[0.5]"
                            )}>
                              <div className="flex items-center gap-1.5">
                                <Eye className={cn("w-3 h-3", isVisibleForTarget ? "text-blue-600" : "text-muted-foreground")} />
                                <span className="text-[8px] font-black uppercase text-muted-foreground">Alumno</span>
                              </div>
                              <Switch 
                                checked={isVisibleForTarget} 
                                onCheckedChange={() => toggleStudentVisibility(res.id, selectedStudentId)}
                                className="scale-75 data-[state=checked]:bg-blue-500"
                              />
                            </div>
                            <div className={cn(
                              "p-3 rounded-2xl border flex flex-col gap-1 items-center text-center transition-all duration-300",
                              res.isVisibleGlobally ? "bg-purple-50 border-purple-100 dark:bg-purple-900/10" : "bg-muted/30 border-primary/5"
                            )}>
                              <div className="flex items-center gap-1.5">
                                <Globe className={cn("w-3 h-3", res.isVisibleGlobally ? "text-purple-600" : "text-muted-foreground")} />
                                <span className="text-[8px] font-black uppercase text-muted-foreground">Global</span>
                              </div>
                              <Switch 
                                checked={res.isVisibleGlobally || false} 
                                onCheckedChange={() => toggleGlobalVisibility(res.id)}
                                className="scale-75 data-[state=checked]:bg-purple-500"
                              />
                            </div>
                          </div>
                          <div className={cn(
                            "p-3 rounded-2xl border flex items-center justify-between transition-all duration-300",
                            isEnabled ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10" : "bg-orange-50 border-orange-100 dark:bg-orange-900/10"
                          )}>
                            <div className="flex items-center gap-2">
                              {isEnabled ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-orange-600" />}
                              <span className="text-[9px] font-black uppercase text-muted-foreground">Habilitar Acceso</span>
                            </div>
                            <Switch 
                              checked={isEnabled} 
                              onCheckedChange={() => toggleEnabledStatus(res.id)}
                              className="scale-75 data-[state=checked]:bg-emerald-500"
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}

                  <div className={cn(
                    "p-2 rounded-[1.5rem] border-2 transition-all flex items-center justify-between shadow-sm",
                    isCompleted ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50" : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50"
                  )}>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-xl flex items-center justify-center shadow-inner",
                        isCompleted ? "bg-card text-emerald-600 dark:text-emerald-400" : "bg-card text-orange-600 dark:text-orange-400"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className={cn(
                          "text-[8px] font-black uppercase tracking-widest leading-none",
                          isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-orange-700 dark:text-orange-400"
                        )}>
                          {isCompleted ? "Completado" : "Pendiente"}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground leading-none mt-0.5">
                          {isCompleted ? "Validado ✅" : "Sin validar ⏳"}
                        </p>
                      </div>
                    </div>

                    {isStaff && (
                      <div className="flex items-center gap-1.5 bg-card/50 px-2 py-0.5 rounded-lg border border-primary/5" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[7px] font-black uppercase text-muted-foreground">Validar</span>
                        <Switch 
                          checked={isCompleted} 
                          onCheckedChange={() => handleToggleCompletion(res.id, res.title)}
                          className="scale-75 data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {!isLockedForStudent && (
                    <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                      {res.downloadUrl && res.downloadUrl !== '#' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-8 rounded-lg text-[9px] font-black uppercase gap-1 border-primary/20 hover:bg-accent/5 hover:border-accent/30 transition-all"
                          onClick={() => window.open(getDriveDownloadUrl(res.downloadUrl), '_blank')}
                        >
                          <Download className="w-3 h-3" /> Descargar
                        </Button>
                      )}
                      {res.interactUrl && res.interactUrl !== '#' && (
                        <Button 
                          size="sm" 
                          className="flex-1 h-8 rounded-lg text-[9px] font-black uppercase gap-1 bg-accent text-white shadow-sm hover:scale-105 transition-all"
                          onClick={() => window.open(res.interactUrl, '_blank')}
                        >
                          <Play className="w-3 h-3" /> Interactuar
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }) : (
            <div className="col-span-full py-20 text-center bg-primary/5 rounded-[3rem] border-4 border-dashed border-primary/10">
              <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-black text-foreground">Sin resultados</h3>
              <p className="text-muted-foreground font-bold italic">No hay recursos que coincidan con los filtros seleccionados o no tienes permisos de acceso.</p>
              <Button variant="link" onClick={() => setSelectedFilters([])} className="text-accent font-black mt-2 underline">Ver todo el catálogo</Button>
            </div>
          )}
        </div>
      </div>

      {/* DIÁLOGO: VISTA DE DETALLES DEL MATERIAL */}
      <Dialog open={!!viewingResource} onOpenChange={(open) => !open && setViewingResource(null)}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
          {viewingResource && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{viewingResource.title}</DialogTitle>
                <DialogDescription>Detalles técnicos y objetivos pedagógicos del material de {viewingResource.category}.</DialogDescription>
              </DialogHeader>
              <div className="relative h-32 md:h-40 w-full shrink-0">
                <Image 
                  src={getDirectImageUrl(typeof viewingResource.img === 'string' ? viewingResource.img : viewingResource.img?.imageUrl || FALLBACK_IMAGE)} 
                  alt={viewingResource.title} 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                  <Badge className="bg-accent text-white border-none px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest mb-2 shadow-lg w-fit">
                    {viewingResource.category}
                  </Badge>
                  <h2 className="text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md font-headline line-clamp-2">
                    {viewingResource.title}
                  </h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 bg-card custom-scrollbar">
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-accent">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Tipo</p>
                        <p className="text-xs font-black text-foreground">{viewingResource.type}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-accent">
                        <Timer className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Extensión</p>
                        <p className="text-xs font-black text-foreground">{viewingResource.length || '---'}</p>
                      </div>
                    </div>
                  </div>

                  {viewingResource.description && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <FileText className="w-3 h-3 text-accent" /> Sobre este material
                      </h4>
                      <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                        {viewingResource.description}
                      </p>
                    </div>
                  )}

                  {viewingResource.objective && (
                    <div className="p-5 rounded-[1.5rem] bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/20 space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" /> Objetivo Académico
                      </h4>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100 leading-relaxed italic whitespace-pre-wrap">
                        {viewingResource.objective}
                      </p>
                    </div>
                  )}

                  {viewingResource.tip && (
                    <div className="p-5 rounded-[1.5rem] bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-100 dark:border-orange-900/30 space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> Tip del Profesor
                      </h4>
                      <p className="text-sm font-bold text-orange-900 dark:text-orange-100 leading-relaxed whitespace-pre-wrap">
                        {viewingResource.tip}
                      </p>
                    </div>
                  )}

                  <div className="p-5 rounded-[2rem] bg-accent/5 border-2 border-dashed border-accent/20 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Indicación para Completar</h4>
                      <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                        Para que este material sea validado como Completado y sume puntos a tu progreso, deberás realizar el examen correspondiente con tu profesor durante tu clase presencial o virtual.
                      </p>
                    </div>
                  </div>

                  {/* PREVISUALIZACIÓN DE PARTITURA */}
                  {viewingResource.downloadUrl && viewingResource.downloadUrl !== '#' && (
                    <div className="space-y-3 pt-4 border-t border-primary/10">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-accent" /> Vista Previa del Material
                      </h4>
                      <div 
                        className="relative aspect-[3/4] w-32 rounded-xl overflow-hidden border-2 border-primary/10 shadow-sm cursor-zoom-in hover:scale-105 transition-transform group"
                        onClick={() => setPreviewImage(getDirectImageUrl(viewingResource.downloadUrl))}
                      >
                        <Image 
                          src={getDirectImageUrl(viewingResource.downloadUrl)} 
                          alt="Vista previa de partitura" 
                          fill 
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Search className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <p className="text-[9px] font-bold text-muted-foreground italic">Haz clic para ampliar la partitura.</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="p-6 bg-muted/30 border-t flex flex-col sm:flex-row gap-3 shrink-0">
                {(viewingResource.downloadUrl && viewingResource.downloadUrl !== '#') && (
                  <Button 
                    className="flex-1 bg-white border-2 border-primary/10 text-foreground rounded-2xl h-12 font-black shadow-sm hover:bg-accent/5 hover:border-accent/30 transition-all gap-2"
                    onClick={() => window.open(getDriveDownloadUrl(viewingResource.downloadUrl), '_blank')}
                  >
                    <Download className="w-4 h-4" /> Descargar
                  </Button>
                )}
                {(viewingResource.interactUrl && viewingResource.interactUrl !== '#') && (
                  <Button 
                    className="flex-1 bg-accent text-white rounded-2xl h-12 font-black shadow-xl shadow-accent/20 hover:scale-105 transition-all gap-2"
                    onClick={() => window.open(viewingResource.interactUrl, '_blank')}
                  >
                    <Play className="w-4 h-4" /> Interactuar
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="rounded-2xl h-12 font-black sm:w-32"
                  onClick={() => setViewingResource(null)}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: VISTA PREVIA A TAMAÑO COMPLETO */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Vista Completa de Partitura</DialogTitle>
            <DialogDescription>Imagen de la partitura en tamaño completo.</DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {previewImage && (
              <Image 
                src={previewImage} 
                alt="Partitura completa" 
                fill 
                className="object-contain"
                priority
              />
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 bg-black/40 text-white rounded-full hover:bg-black/60 z-50 h-10 w-10"
              onClick={() => setPreviewImage(null)}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: AGREGAR NUEVO RECURSO */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (open) {
          setEnableDownloadInForm(true);
          setEnableInteractInForm(true);
        }
      }}>
        <DialogContent className="rounded-[2.5rem] max-w-3xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
              <Plus className="w-8 h-8 text-accent" />
              Nuevo Material Didáctico
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground font-medium">
              Configura cada aspecto del nuevo material. Por defecto será privado y bloqueado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 bg-card custom-scrollbar">
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Título del Material</Label>
                  <Input 
                    value={newResource.title} 
                    onChange={(e) => setNewResource(prev => ({...prev, title: e.target.value}))}
                    className="h-12 rounded-xl border-2 font-bold text-foreground bg-card focus:border-accent"
                    placeholder="Ej: Acordes de Jazz Vol 1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Categoría (Instrumento)</Label>
                    <Select 
                      value={newResource.category} 
                      onValueChange={(val) => setNewResource(prev => ({...prev, category: val}))}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 font-bold text-foreground bg-card">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {ALL_CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                          <SelectItem key={cat} value={cat} className="font-bold">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tipo de Contenido</Label>
                    <Select 
                      value={newResource.type} 
                      onValueChange={(val) => setNewResource(prev => ({...prev, type: val}))}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 font-bold text-foreground bg-card">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {CONTENT_TYPES.map(type => (
                          <SelectItem key={type} value={type} className="font-bold">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Duración / Extensión</Label>
                    <Input 
                      value={newResource.length} 
                      onChange={(e) => setNewResource(prev => ({...prev, length: e.target.value}))}
                      className="h-12 rounded-xl border-2 font-bold text-foreground bg-card focus:border-accent"
                      placeholder="Ej: 15 min o 12 págs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">URL Imagen Portada</Label>
                    <Input 
                      value={newResource.img?.imageUrl} 
                      onChange={(e) => setNewResource(prev => ({...prev, img: { imageUrl: e.target.value, imageHint: 'music' }}))}
                      className="h-12 rounded-xl border-2 font-bold text-foreground bg-card focus:border-accent"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descripción Detallada</Label>
                  <Textarea 
                    value={newResource.description} 
                    onChange={(e) => setNewResource(prev => ({...prev, description: e.target.value}))}
                    className="min-h-[100px] rounded-xl border-2 font-bold"
                    placeholder="Explica de qué trata este material..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Objetivo Académico</Label>
                    <Textarea 
                      value={newResource.objective} 
                      onChange={(e) => setNewResource(prev => ({...prev, objective: e.target.value}))}
                      className="min-h-[80px] rounded-xl border-2 font-bold"
                      placeholder="¿Qué aprenderá el alumno?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tip del Profesor</Label>
                    <Textarea 
                      value={newResource.tip} 
                      onChange={(e) => setNewResource(prev => ({...prev, tip: e.target.value}))}
                      className="min-h-[80px] rounded-xl border-2 font-bold"
                      placeholder="Un consejo práctico..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-primary/10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Botón de Descarga</Label>
                      <Switch checked={enableDownloadInForm} onCheckedChange={setEnableDownloadInForm} />
                    </div>
                    {enableDownloadInForm && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Input 
                          value={newResource.downloadUrl === '#' ? '' : newResource.downloadUrl} 
                          onChange={(e) => setNewResource(prev => ({...prev, downloadUrl: e.target.value}))}
                          className="h-10 rounded-xl border-2 font-bold text-foreground bg-card focus:border-accent text-xs"
                          placeholder="Enlace de descarga"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Botón de Interacción</Label>
                      <Switch checked={enableInteractInForm} onCheckedChange={setEnableInteractInForm} />
                    </div>
                    {enableInteractInForm && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Input 
                          value={newResource.interactUrl === '#' ? '' : newResource.interactUrl} 
                          onChange={(e) => setNewResource(prev => ({...prev, interactUrl: e.target.value}))}
                          className="h-10 rounded-xl border-2 font-bold text-foreground bg-card focus:border-accent text-xs"
                          placeholder="Enlace de interacción"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/30 flex gap-3 border-t shrink-0">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl flex-1 h-14 font-black text-foreground">Cancelar</Button>
            <Button onClick={handleCreateResource} className="bg-accent text-white rounded-xl flex-1 h-14 font-black shadow-lg shadow-accent/20">Crear Material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: EDITAR RECURSO EXISTENTE */}
      <Dialog open={!!editingResource} onOpenChange={(open) => !open && setEditingResource(null)}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary/10 dark:bg-accent/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
              <Edit2 className="w-6 h-6 text-accent" />
              Editar Recurso
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground font-medium">
              Modifica los detalles técnicos y descriptivos del material.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 bg-card custom-scrollbar">
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Título del Material</Label>
                  <Input 
                    value={editingResource?.title || ''} 
                    onChange={(e) => setEditingResource(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="h-12 rounded-xl border-2 font-bold text-foreground bg-card focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        {ALL_CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                          <SelectItem key={cat} value={cat} className="font-bold">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <FileType className="w-3 h-3" /> Tipo de Contenido
                    </Label>
                    <Select 
                      value={editingResource?.type || ''} 
                      onValueChange={(val) => setEditingResource(prev => prev ? {...prev, type: val} : null)}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 font-bold text-foreground bg-card">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {CONTENT_TYPES.map(type => (
                          <SelectItem key={type} value={type} className="font-bold">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Timer className="w-3 h-3" /> Duración / Extensión
                    </Label>
                    <Input 
                      value={editingResource?.length || ''} 
                      onChange={(e) => setEditingResource(prev => prev ? {...prev, length: e.target.value} : null)}
                      className="h-12 rounded-xl border-2 font-bold text-foreground bg-card focus:border-accent"
                      placeholder="Ej: 15 min o 12 págs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" /> URL Imagen
                    </Label>
                    <Input 
                      value={typeof editingResource?.img === 'string' ? editingResource.img : editingResource?.img?.imageUrl || ''} 
                      onChange={(e) => setEditingResource(prev => {
                        if (!prev) return null;
                        if (typeof prev.img === 'string') return {...prev, img: e.target.value};
                        return {...prev, img: {...(prev.img || { imageHint: 'music' }), imageUrl: e.target.value}};
                      })}
                      className="h-12 rounded-xl border-2 font-bold text-foreground bg-card focus:border-accent"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descripción Detallada</Label>
                  <Textarea 
                    value={editingResource?.description || ''} 
                    onChange={(e) => setEditingResource(prev => prev ? {...prev, description: e.target.value} : null)}
                    className="min-h-[100px] rounded-xl border-2 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Objetivo Académico</Label>
                    <Textarea 
                      value={editingResource?.objective || ''} 
                      onChange={(e) => setEditingResource(prev => prev ? {...prev, objective: e.target.value} : null)}
                      className="min-h-[80px] rounded-xl border-2 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tip del Profesor</Label>
                    <Textarea 
                      value={editingResource?.tip || ''} 
                      onChange={(e) => setEditingResource(prev => prev ? {...prev, tip: e.target.value} : null)}
                      className="min-h-[80px] rounded-xl border-2 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-primary/10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Download className="w-3 h-3" /> Botón Descarga
                      </Label>
                      <Switch checked={enableDownloadInForm} onCheckedChange={setEnableDownloadInForm} />
                    </div>
                    {enableDownloadInForm && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Input 
                          value={editingResource?.downloadUrl === '#' ? '' : editingResource?.downloadUrl || ''} 
                          onChange={(e) => setEditingResource(prev => prev ? {...prev, downloadUrl: e.target.value} : null)}
                          className="h-10 rounded-xl border-2 font-bold text-foreground bg-card focus:border-accent text-xs"
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <LinkIcon className="w-3 h-3" /> Botón Interacción
                      </Label>
                      <Switch checked={enableInteractInForm} onCheckedChange={setEnableInteractInForm} />
                    </div>
                    {enableInteractInForm && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Input 
                          value={editingResource?.interactUrl === '#' ? '' : editingResource?.interactUrl || ''} 
                          onChange={(e) => setEditingResource(prev => prev ? {...prev, interactUrl: e.target.value} : null)}
                          className="h-10 rounded-xl border-2 font-bold text-foreground bg-card focus:border-accent text-xs"
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/30 flex gap-3 border-t shrink-0">
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
              Personaliza el mensaje de bienvenida para tus alumnos.
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
