
"use client"

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Search, BookOpen, Download, Play, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useToast } from '@/hooks/use-toast';
import { RESOURCES } from '@/lib/resources';

export default function LibraryPage() {
  const { user } = useAuth();
  const { toggleCompletion, getCompletionStatus } = useCompletionStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  const [selectedStudentId] = useState('1'); 

  const isStaff = user?.role === 'teacher' || user?.role === 'admin';

  const filtered = RESOURCES.filter(res => 
    (filter === 'Todos' || res.category === filter) &&
    (res.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggleCompletion = (resourceId: number, title: string) => {
    if (!user) return;
    toggleCompletion(resourceId, selectedStudentId, user.id);
    const isNowCompleted = !getCompletionStatus(resourceId, selectedStudentId);
    
    toast({
      title: isNowCompleted ? "Logro Validado 🏆" : "Estado Actualizado",
      description: isNowCompleted 
        ? `Has marcado "${title}" como completado para el alumno.`
        : `Se ha revertido el estado de "${title}".`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground font-headline">Biblioteca de Recursos 📚</h1>
            <p className="text-muted-foreground mt-1 text-lg">Materiales curados para acelerar tu aprendizaje.</p>
          </div>
          {isStaff && (
            <div className="bg-accent/10 border border-accent/20 p-4 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-accent">Modo Evaluación</p>
                <p className="text-sm font-bold">Editando logros para: <span className="underline">Ana García</span></p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar recursos..." 
              className="pl-10 rounded-2xl h-11 border-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {['Todos', 'Guitarra', 'Piano', 'Violín', 'Batería', 'Canto', 'Teoría'].map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? 'default' : 'outline'}
                className={cn(
                  "rounded-full px-6",
                  filter === cat ? "bg-accent text-white" : "border-primary"
                )}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res) => {
            const isCompleted = getCompletionStatus(res.id, user?.role === 'student' ? user.id : selectedStudentId);
            
            return (
              <Card key={res.id} className="rounded-3xl border-none shadow-md group overflow-hidden bg-white">
                <div className="relative aspect-video overflow-hidden">
                  {res.img ? (
                    <Image 
                      src={res.img.imageUrl} 
                      alt={res.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      data-ai-hint={res.img.imageHint}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-black backdrop-blur-sm rounded-full px-3">{res.category}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-accent transition-colors leading-tight">{res.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
                    <res.icon className="w-4 h-4" />
                    <span>Contenido {res.type}</span>
                  </div>

                  <div className={cn(
                    "p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                    isCompleted ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"
                  )}>
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      )}
                      <div>
                        <p className={cn(
                          "text-xs font-black uppercase tracking-widest",
                          isCompleted ? "text-emerald-700" : "text-orange-700"
                        )}>
                          {isCompleted ? "Completado" : "Pendiente"}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground leading-none mt-0.5">
                          {isCompleted ? "Examen validado" : "Examen no completado"}
                        </p>
                      </div>
                    </div>

                    {isStaff && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black uppercase text-muted-foreground">Validar</span>
                        <Switch 
                          checked={isCompleted} 
                          onCheckedChange={() => handleToggleCompletion(res.id, res.title)}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-xl gap-2 font-bold h-11">
                    <Download className="w-4 h-4" /> Descargar
                  </Button>
                  <Button variant="outline" className="rounded-xl px-3 border-primary h-11">
                    <Play className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
