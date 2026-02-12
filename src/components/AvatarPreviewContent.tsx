
"use client"

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Move, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AvatarPreviewContentProps {
  src: string;
  name: string;
  subtitle?: string;
  onSave?: (transform: { scale: number; position: { x: number; y: number } }) => void;
}

/**
 * Componente que permite previsualizar una imagen con zoom y desplazamiento
 * para simular el recorte circular de la foto de perfil.
 */
export function AvatarPreviewContent({ src, name, subtitle, onSave }: AvatarPreviewContentProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setStartPos({ x: clientX, y: clientY });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const dx = clientX - startPos.x;
    const dy = clientY - startPos.y;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setStartPos({ x: clientX, y: clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ scale, position });
    }
    toast({
      title: "Ajustes de imagen aplicados ✨",
      description: "El nuevo encuadre se ha guardado correctamente para tu perfil.",
    });
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Área de Visualización */}
      <div 
        className="relative aspect-square overflow-hidden bg-slate-900 cursor-move touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <div 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="w-full h-full relative"
        >
          <Image 
            src={src} 
            alt={name}
            fill
            className="object-contain pointer-events-none select-none"
            priority
          />
        </div>
        
        {/* Máscara Circular de Referencia */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] rounded-full border-2 border-white/30" />
        </div>

        {/* Indicador Flotante */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white/70">
          <Move className="w-4 h-4" />
        </div>
      </div>

      {/* Controles de Edición Visual */}
      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ZoomIn className="w-3.5 h-3.5 text-accent" /> Control de Zoom
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-[10px] font-black uppercase text-accent hover:bg-accent/10" 
              onClick={reset}
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Resetear Vista
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
            <Slider 
              value={[scale]} 
              min={0.5} 
              max={3} 
              step={0.01} 
              onValueChange={([val]) => setScale(val)}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="text-center pt-2 space-y-6">
          <div>
            <h3 className="text-2xl font-black text-foreground leading-none">{name}</h3>
            {subtitle && (
              <p className="text-sm font-bold text-accent uppercase tracking-widest mt-2">{subtitle}</p>
            )}
          </div>

          <Button 
            onClick={handleSave}
            className="w-full bg-accent text-white rounded-2xl h-14 font-black shadow-xl shadow-accent/20 hover:scale-105 transition-all gap-2"
          >
            <Check className="w-5 h-5" /> Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
