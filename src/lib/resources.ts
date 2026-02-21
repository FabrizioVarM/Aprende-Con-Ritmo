
import { BookOpen, Play, type LucideIcon } from 'lucide-react';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export interface Resource {
  id: number;
  title: string;
  category: string;
  type: string;
  icon?: any; 
  img: {
    imageUrl: string;
    imageHint: string;
  };
  length?: string;
  description?: string;
  objective?: string;
  tip?: string;
  downloadUrl?: string;
  interactUrl?: string;
  isVisibleGlobally?: boolean;
  isEnabled?: boolean;
  assignedStudentIds?: string[];
}

export const INITIAL_RESOURCES: Resource[] = [
  { 
    id: 1, 
    title: 'Básicos de Acordes de Guitarra', 
    category: 'Guitarra', 
    type: 'PDF', 
    img: { imageUrl: "https://picsum.photos/seed/guitar1/600/400", imageHint: "guitar music" }, 
    length: '12 págs',
    description: 'Una guía exhaustiva para principiantes que cubre los acordes mayores y menores más utilizados en la música popular. Incluye diagramas de posición y ejercicios de cambio rápido.',
    objective: 'Dominar las 8 posiciones básicas de acordes para poder acompañar cualquier canción sencilla.',
    tip: 'Mantén el pulgar detrás del mástil para mayor palanca y asegúrate de que solo las yemas de tus dedos toquen las cuerdas.',
    downloadUrl: '#', 
    interactUrl: '#', 
    isVisibleGlobally: true, 
    isEnabled: true, 
    assignedStudentIds: [] 
  },
  { 
    id: 2, 
    title: 'Masterclass de Escalas de Piano', 
    category: 'Piano', 
    type: 'Video', 
    img: { imageUrl: "https://picsum.photos/seed/piano1/600/400", imageHint: "piano keys" }, 
    length: '45 min',
    description: 'Video detallado sobre la ejecución técnica de escalas mayores y menores armónicas. Analizamos el paso del pulgar y la postura de la muñeca para evitar tensiones.',
    objective: 'Desarrollar fluidez y velocidad en el teclado mediante el uso correcto de la digitación estándar.',
    tip: 'Practica con metrónomo a velocidad muy lenta (60 BPM) hasta que cada nota suene con el mismo volumen.',
    downloadUrl: '#', 
    interactUrl: '#', 
    isVisibleGlobally: true, 
    isEnabled: true, 
    assignedStudentIds: [] 
  },
  { 
    id: 3, 
    title: 'Guía de Afinación de Violín', 
    category: 'Violín', 
    type: 'PDF', 
    img: { imageUrl: "https://picsum.photos/seed/violin1/600/400", imageHint: "violin instrument" }, 
    length: '5 págs',
    description: 'Manual práctico para aprender a afinar tu instrumento usando tanto las clavijas como los microafinadores. Incluye consejos para cuidar la estabilidad de las cuerdas.',
    objective: 'Ser capaz de preparar el instrumento para la práctica diaria sin ayuda externa.',
    tip: 'Afloja siempre un poco la cuerda antes de subir el tono con la clavija para evitar roturas por tensión súbita.',
    downloadUrl: '#', 
    interactUrl: '#', 
    isVisibleGlobally: true, 
    isEnabled: true, 
    assignedStudentIds: [] 
  },
  { 
    id: 4, 
    title: 'Teoría Avanzada Vol 1', 
    category: 'Teoría', 
    type: 'Libro', 
    img: { imageUrl: "https://picsum.photos/seed/theory1/600/400", imageHint: "music theory" }, 
    length: '120 págs',
    description: 'Primer volumen de nuestra serie de teoría. Cubre armonía funcional, círculo de quintas y análisis de formas musicales clásicas.',
    objective: 'Comprender la estructura lógica detrás de las composiciones y mejorar la lectura a primera vista.',
    tip: 'Dibuja el círculo de quintas a mano una vez al día; es la mejor forma de memorizar las armaduras.',
    downloadUrl: '#', 
    interactUrl: '#', 
    isVisibleGlobally: true, 
    isEnabled: true, 
    assignedStudentIds: [] 
  },
  { 
    id: 5, 
    title: 'Rudimentos Esenciales de Batería', 
    category: 'Batería', 
    type: 'PDF', 
    img: { imageUrl: "https://picsum.photos/seed/drums1/600/400", imageHint: "drums instrument" }, 
    length: '15 págs',
    description: 'Los 40 rudimentos internacionales explicados con notación clara. Enfoque especial en single strokes, double strokes y paradiddles.',
    objective: 'Mejorar el control de baquetas y la independencia de manos necesaria para ritmos complejos.',
    tip: 'Utiliza el rebote natural del parche; no fuerces el golpe hacia abajo, deja que la baqueta respire.',
    downloadUrl: '#', 
    interactUrl: '#', 
    isVisibleGlobally: true, 
    isEnabled: true, 
    assignedStudentIds: [] 
  },
  { 
    id: 6, 
    title: 'Técnicas de Respiración y Apoyo', 
    category: 'Canto', 
    type: 'Video', 
    img: { imageUrl: "https://picsum.photos/seed/vocal1/600/400", imageHint: "singing microphone" }, 
    length: '30 min',
    description: 'Clase magistral sobre el uso del diafragma y la gestión del aire. Fundamental para evitar la fatiga vocal y alcanzar notas altas con seguridad.',
    objective: 'Aprender a proyectar la voz sin forzar las cuerdas vocales mediante el apoyo abdominal.',
    tip: 'Imagina que tienes un cinturón inflable alrededor de tu cintura; esa es la zona que debe expandirse al inhalar.',
    downloadUrl: '#', 
    interactUrl: '#', 
    isVisibleGlobally: true, 
    isEnabled: true, 
    assignedStudentIds: [] 
  }
];
