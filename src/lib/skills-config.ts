
"use client"

export const DEFAULT_SKILLS_CONFIG: Record<string, { name: string; color: string; defaultLevel: number }[]> = {
  'Guitarra': [
    { name: 'Precisión de Ritmo', color: 'bg-accent', defaultLevel: 0 },
    { name: 'Lectura de Notas', color: 'bg-blue-500', defaultLevel: 0 },
    { name: 'Dinámicas', color: 'bg-orange-500', defaultLevel: 0 },
    { name: 'Técnica', color: 'bg-green-500', defaultLevel: 0 },
  ],
  'Piano': [
    { name: 'Independencia de manos', color: 'bg-accent', defaultLevel: 0 },
    { name: 'Lectura en Clave de Fa', color: 'bg-blue-500', defaultLevel: 0 },
    { name: 'Escalas Mayores', color: 'bg-orange-500', defaultLevel: 0 },
    { name: 'Uso del Pedal', color: 'bg-green-500', defaultLevel: 0 },
  ],
  'Bajo': [
    { name: 'Groove y Timing', color: 'bg-accent', defaultLevel: 0 },
    { name: 'Técnica de Dedos/Púa', color: 'bg-blue-500', defaultLevel: 0 },
    { name: 'Escalas Pentatónicas', color: 'bg-orange-500', defaultLevel: 0 },
    { name: 'Técnica de Slap', color: 'bg-green-500', defaultLevel: 0 },
  ],
  'Violín': [
    { name: 'Postura del Arco', color: 'bg-accent', defaultLevel: 0 },
    { name: 'Intonación', color: 'bg-blue-500', defaultLevel: 0 },
    { name: 'Vibrato', color: 'bg-orange-500', defaultLevel: 0 },
    { name: 'Lectura Rápida', color: 'bg-green-500', defaultLevel: 0 },
  ],
  'Batería': [
    { name: 'Coordinación', color: 'bg-accent', defaultLevel: 0 },
    { name: 'Velocidad', color: 'bg-blue-500', defaultLevel: 0 },
    { name: 'Rudimentos', color: 'bg-orange-500', defaultLevel: 0 },
    { name: 'Groove', color: 'bg-green-500', defaultLevel: 0 },
  ],
  'Canto': [
    { name: 'Respiración', color: 'bg-accent', defaultLevel: 0 },
    { name: 'Afinación', color: 'bg-blue-500', defaultLevel: 0 },
    { name: 'Proyección', color: 'bg-orange-500', defaultLevel: 0 },
    { name: 'Dicción', color: 'bg-green-500', defaultLevel: 0 },
  ],
  'Teoría': [
    { name: 'Lectura de Pentagrama', color: 'bg-accent', defaultLevel: 0 },
    { name: 'Intervalos', color: 'bg-blue-500', defaultLevel: 0 },
    { name: 'Armonía Básica', color: 'bg-orange-500', defaultLevel: 0 },
  ],
  'Default': [
    { name: 'Teoría Musical', color: 'bg-accent', defaultLevel: 0 },
    { name: 'Entrenamiento Auditivo', color: 'bg-blue-500', defaultLevel: 0 },
  ]
};
