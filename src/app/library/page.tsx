
"use client"

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Download, Play, CheckCircle2, AlertCircle, ShieldCheck, Check, Users } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useToast } from '@/hooks/use-toast';
import { RESOURCES } from '@/lib/resources';

const MOCK_STUDENTS = [
  { id: '1', name: 'Ana García', instruments: ['Guitarra'] },
  { id: '4', name: 'Liam Smith', instruments: ['Piano'] },
  { id: '5', name: 'Emma Wilson', instruments: ['Violín'] },
  { id: '6', name: 'Tom Holland', instruments: ['Batería'] },
];

export default function LibraryPage() {
  const { user } = useAuth();
  const { toggleCompletion, getCompletionStatus } = useCompletionStore();
  const { toast } = useToast();
  
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isInitialFilterSet, setIsInitialFilterSet] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('1'); 

  const isStaff = user?.role === 'teacher' || user?.role === 'admin';

  // Efecto para inicializar los filtros según el perfil del usuario (si es alumno)
  useEffect(() => {
    if (user && user.role === 'student' && !isInitialFilterSet) {
      if (user.instruments && user.instruments.length > 0) {
        setSelectedFilters(user.instruments);
      }
      setIsInitialFilterSet(true);
    }
  }, [user, isInitialFilterSet]);

  // Efecto para actualizar filtros automáticamente cuando el profesor cambia de alumno
  useEffect(() => {
    if (isStaff) {
      const student = MOCK_STUDENTS.find(s => s.id === selectedStudentId);
      if (student && student.instruments) {
        setSelectedFilters(student.instruments);
      }
    }
  }, [selectedStudentId, isStaff]);

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

  const filtered = RESOURCES.filter(res => 
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

  const currentStudentName = MOCK_STUDENTS.find(s => s.id === selectedStudentId)?.name || 'Alumno';

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground font-headline tracking-tight">Biblioteca de Recursos 📚</h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">Materiales curados para acelerar tu aprendizaje.</p>
          </div>
          {isStaff && (
            <div className="bg-white border-2 border-accent/20 p-2 pl-4 rounded-[2rem] flex flex-col sm:flex-row items-center gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-accent" />
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent">Modo Evaluación</p>
                  <p className="text-xs font-bold text-muted-foreground">Alumno seleccionado:</p>
                </div>
              </div>
              <div className="w-full sm:w-64">
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="h-12 rounded-2xl border-accent/30 bg-accent/5 font-black text-secondary-foreground focus:ring-accent">
                    <Users className="w-4 h-4 mr-2 text-accent" />
                    <SelectValue placeholder="Seleccionar Alumno" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {MOCK_STUDENTS.map(student => (
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
              className="pl-11 rounded-2xl h-12 border-primary/20 bg-white focus:border-accent transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {['Todos', 'Guitarra', 'Piano', 'Violín', 'Batería', 'Canto', 'Teoría'].map((cat) => {
              const isActive = cat === 'Todos' ? selectedFilters.length === 0 : selectedFilters.includes(cat);
              return (
                <Button
                  key={cat}
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    "rounded-full px-5 h-10 transition-all font-black text-xs shrink-0",
                    isActive 
                      ? "bg-accent text-white border-accent shadow-md shadow-accent/20" 
                      : "border-primary/20 bg-white text-muted-foreground hover:border-accent/50"
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
              <Card key={res.id} className="rounded-[2.5rem] border-none shadow-md group overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-video overflow-hidden">
                  {res.img ? (
                    <Image 
                      src={res.img.imageUrl} 
                      alt={res.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      data-ai-hint={res.img.imageHint}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/95 text-secondary-foreground backdrop-blur-sm rounded-full px-4 py-1 font-black shadow-sm border-none">{res.category}</Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-black group-hover:text-accent transition-colors leading-tight min-h-[3rem] line-clamp-2">{res.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-widest">
                    <res.icon className="w-4 h-4 text-accent" />
                    <span>Contenido {res.type}</span>
                  </div>

                  <div className={cn(
                    "p-4 rounded-3xl border-2 transition-all flex items-center justify-between shadow-sm",
                    isCompleted ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner",
                        isCompleted ? "bg-white text-emerald-600" : "bg-white text-orange-600"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          isCompleted ? "text-emerald-700" : "text-orange-700"
                        )}>
                          {isCompleted ? "Completado" : "Pendiente"}
                        </p>
                        <p className="text-[11px] font-bold text-muted-foreground leading-none mt-1">
                          {isCompleted ? "Examen validado ✅" : "Examen no completado ⏳"}
                        </p>
                      </div>
                    </div>

                    {isStaff && (
                      <div className="flex flex-col items-center gap-1.5 bg-white/50 p-2 rounded-2xl border border-primary/5">
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
                  <Button variant="outline" className="flex-none rounded-2xl border-2 border-primary/10 h-12 gap-2 font-black px-4 text-xs hover:border-accent hover:bg-accent/5">
                    <Download className="w-4 h-4" /> Descargar
                  </Button>
                  <Button className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-2xl gap-2 font-black h-12 shadow-lg shadow-accent/20">
                    <Play className="w-4 h-4" /> Interactúa!
                  </Button>
                </CardFooter>
              </Card>
            );
          }) : (
            <div className="col-span-full py-20 text-center bg-primary/5 rounded-[3rem] border-4 border-dashed border-primary/10">
              <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-black text-secondary-foreground">Sin resultados</h3>
              <p className="text-muted-foreground font-bold italic">No hay recursos que coincidan con los filtros seleccionados.</p>
              <Button variant="link" onClick={() => setSelectedFilters([])} className="text-accent font-black mt-2 underline">Ver todo el catálogo</Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
