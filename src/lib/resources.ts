
import { BookOpen, Play, type LucideIcon } from 'lucide-react';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export interface Resource {
  id: number;
  title: string;
  category: string;
  type: string;
  icon?: any; // Usaremos strings para persistencia o componentes directos
  img: {
    imageUrl: string;
    imageHint: string;
  };
  length?: string;
  downloadUrl?: string;
  interactUrl?: string;
}

export const INITIAL_RESOURCES: Resource[] = [
  { id: 1, title: 'Básicos de Acordes de Guitarra', category: 'Guitarra', type: 'PDF', img: { imageUrl: "https://picsum.photos/seed/guitar1/600/400", imageHint: "guitar music" }, length: '12 págs', downloadUrl: '#', interactUrl: '#' },
  { id: 2, title: 'Masterclass de Escalas de Piano', category: 'Piano', type: 'Video', img: { imageUrl: "https://picsum.photos/seed/piano1/600/400", imageHint: "piano keys" }, length: '45 min', downloadUrl: '#', interactUrl: '#' },
  { id: 3, title: 'Guía de Afinación de Violín', category: 'Violín', type: 'PDF', img: { imageUrl: "https://picsum.photos/seed/violin1/600/400", imageHint: "violin instrument" }, length: '5 págs', downloadUrl: '#', interactUrl: '#' },
  { id: 4, title: 'Teoría Avanzada Vol 1', category: 'Teoría', type: 'Libro', img: { imageUrl: "https://picsum.photos/seed/theory1/600/400", imageHint: "music theory" }, length: '120 págs', downloadUrl: '#', interactUrl: '#' },
  { id: 5, title: 'Rudimentos Esenciales de Batería', category: 'Batería', type: 'PDF', img: { imageUrl: "https://picsum.photos/seed/drums1/600/400", imageHint: "drums instrument" }, length: '15 págs', downloadUrl: '#', interactUrl: '#' },
  { id: 6, title: 'Técnicas de Respiración y Apoyo', category: 'Canto', type: 'Video', img: { imageUrl: "https://picsum.photos/seed/vocal1/600/400", imageHint: "singing microphone" }, length: '30 min', downloadUrl: '#', interactUrl: '#' },
  { id: 7, title: 'Esenciales de Fingerstyle', category: 'Guitarra', type: 'Video', img: { imageUrl: "https://picsum.photos/seed/guitar1/600/400", imageHint: "guitar music" }, length: '20 min', downloadUrl: '#', interactUrl: '#' },
  { id: 8, title: 'Práctica de Lectura a Primera Vista', category: 'Piano', type: 'PDF', img: { imageUrl: "https://picsum.photos/seed/piano1/600/400", imageHint: "piano keys" }, length: '8 págs', downloadUrl: '#', interactUrl: '#' },
  { id: 9, title: 'Independencia en la Batería', category: 'Batería', type: 'Video', img: { imageUrl: "https://picsum.photos/seed/drums1/600/400", imageHint: "drums instrument" }, length: '25 min', downloadUrl: '#', interactUrl: '#' },
];
