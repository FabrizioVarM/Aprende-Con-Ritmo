"use client"

export const DEFAULT_SKILLS_CONFIG: Record<string, { name: string; color: string; defaultLevel: number }[]> = {
  'Guitarra': [
    { name: 'Precisión de Ritmo', color: 'bg-accent', defaultLevel: 20 },
    { name: 'Lectura de Notas', color: 'bg-blue-500', defaultLevel: 10 },
    { name: 'Dinámicas', color: 'bg-orange-500', defaultLevel: 5 },
    { name: 'Técnica', color: 'bg-green-500', defaultLevel: 15 },
  ],
  'Piano': [
    { name: 'Independencia de manos', color: 'bg-accent', defaultLevel: 15 },
    { name: 'Lectura en Clave de Fa', color: 'bg-blue-500', defaultLevel: 20 },
    { name: 'Escalas Mayores', color: 'bg-orange-500', defaultLevel: 30 },
    { name: 'Uso del Pedal', color: 'bg-green-500', defaultLevel: 10 },
  ],
  'Violín': [
    { name: 'Postura del Arco', color: 'bg-accent', defaultLevel: 30 },
    { name: 'Intonación', color: 'bg-blue-500', defaultLevel: 15 },
    { name: 'Vibrato', color: 'bg-orange-500', defaultLevel: 5 },
    { name: 'Lectura Rápida', color: 'bg-green-500', defaultLevel: 10 },
  ],
  'Batería': [
    { name: 'Coordinación', color: 'bg-accent', defaultLevel: 25 },
    { name: 'Velocidad', color: 'bg-blue-500', defaultLevel: 20 },
    { name: 'Rudimentos', color: 'bg-orange-500', defaultLevel: 30 },
    { name: 'Groove', color: 'bg-green-500', defaultLevel: 20 },
  ],
  'Canto': [
    { name: 'Respiración', color: 'bg-accent', defaultLevel: 40 },
    { name: 'Afinación', color: 'bg-blue-500', defaultLevel: 30 },
    { name: 'Proyección', color: 'bg-orange-500', defaultLevel: 20 },
    { name: 'Dicción', color: 'bg-green-500', defaultLevel: 35 },
  ],
  'Teoría': [
    { name: 'Lectura de Pentagrama', color: 'bg-accent', defaultLevel: 10 },
    { name: 'Intervalos', color: 'bg-blue-500', defaultLevel: 5 },
    { name: 'Armonía Básica', color: 'bg-orange-500', defaultLevel: 0 },
  ],
  'Default': [
    { name: 'Teoría Musical', color: 'bg-accent', defaultLevel: 10 },
    { name: 'Entrenamiento Auditivo', color: 'bg-blue-500', defaultLevel: 5 },
  ]
};
