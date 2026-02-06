
"use client"

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, BookOpen, Download, Play } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const RESOURCES = [
  { id: 1, title: 'Básicos de Acordes de Guitarra', category: 'Guitarra', type: 'PDF', icon: BookOpen, img: PlaceHolderImages[0] },
  { id: 2, title: 'Masterclass de Escalas de Piano', category: 'Piano', type: 'Video', icon: Play, img: PlaceHolderImages[1] },
  { id: 3, title: 'Guía de Afinación de Violín', category: 'Violín', type: 'PDF', icon: BookOpen, img: PlaceHolderImages[2] },
  { id: 4, title: 'Teoría Avanzada Vol 1', category: 'Teoría', type: 'Libro', icon: BookOpen, img: PlaceHolderImages[3] },
  { id: 5, title: 'Rudimentos Esenciales de Batería', category: 'Batería', type: 'PDF', icon: BookOpen, img: PlaceHolderImages[4] },
  { id: 6, title: 'Técnicas de Respiración y Apoyo', category: 'Canto', type: 'Video', icon: Play, img: PlaceHolderImages[5] },
  { id: 7, title: 'Esenciales de Fingerstyle', category: 'Guitarra', type: 'Video', icon: Play, img: PlaceHolderImages[0] },
  { id: 8, title: 'Práctica de Lectura a Primera Vista', category: 'Piano', type: 'PDF', icon: BookOpen, img: PlaceHolderImages[1] },
  { id: 9, title: 'Independencia en la Batería', category: 'Batería', type: 'Video', icon: Play, img: PlaceHolderImages[4] },
];

export default function LibraryPage() {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  const filtered = RESOURCES.filter(res => 
    (filter === 'Todos' || res.category === filter) &&
    (res.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline">Biblioteca de Recursos 📚</h1>
          <p className="text-muted-foreground mt-1 text-lg">Materiales curados para acelerar tu aprendizaje.</p>
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
          {filtered.map((res) => (
            <Card key={res.id} className="rounded-3xl border-none shadow-md group overflow-hidden">
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
                <CardTitle className="text-xl group-hover:text-accent transition-colors">{res.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <res.icon className="w-4 h-4" />
                  <span>Contenido {res.type}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-xl gap-2">
                  <Download className="w-4 h-4" /> Descargar
                </Button>
                <Button variant="outline" className="rounded-xl px-3 border-primary">
                  <Play className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
