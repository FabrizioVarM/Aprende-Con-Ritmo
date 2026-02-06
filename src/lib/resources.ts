
import { BookOpen, Play, type LucideIcon } from 'lucide-react';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export interface Resource {
  id: number;
  title: string;
  category: string;
  type: string;
  icon: LucideIcon;
  img: ImagePlaceholder;
  length?: string;
}

export const RESOURCES: Resource[] = [
  { id: 1, title: 'Básicos de Acordes de Guitarra', category: 'Guitarra', type: 'PDF', icon: BookOpen, img: PlaceHolderImages[0], length: '12 págs' },
  { id: 2, title: 'Masterclass de Escalas de Piano', category: 'Piano', type: 'Video', icon: Play, img: PlaceHolderImages[1], length: '45 min' },
  { id: 3, title: 'Guía de Afinación de Violín', category: 'Violín', type: 'PDF', icon: BookOpen, img: PlaceHolderImages[2], length: '5 págs' },
  { id: 4, title: 'Teoría Avanzada Vol 1', category: 'Teoría', type: 'Libro', icon: BookOpen, img: PlaceHolderImages[3], length: '120 págs' },
  { id: 5, title: 'Rudimentos Esenciales de Batería', category: 'Batería', type: 'PDF', icon: BookOpen, img: PlaceHolderImages[4], length: '15 págs' },
  { id: 6, title: 'Técnicas de Respiración y Apoyo', category: 'Canto', type: 'Video', icon: Play, img: PlaceHolderImages[5], length: '30 min' },
  { id: 7, title: 'Esenciales de Fingerstyle', category: 'Guitarra', type: 'Video', icon: Play, img: PlaceHolderImages[0], length: '20 min' },
  { id: 8, title: 'Práctica de Lectura a Primera Vista', category: 'Piano', type: 'PDF', icon: BookOpen, img: PlaceHolderImages[1], length: '8 págs' },
  { id: 9, title: 'Independencia en la Batería', category: 'Batería', type: 'Video', icon: Play, img: PlaceHolderImages[4], length: '25 min' },
];
