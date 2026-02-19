
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, User, Music, Music2, Music3, Music4, Loader2, ShieldCheck, ExternalLink, FileText, Scale, AlertTriangle, Copyright, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import Link from 'next/link';
import Image from 'next/image';
import { useSettingsStore } from '@/lib/settings-store';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DecorativeNote {
  id: number;
  left: string;
  top: string;
  delay: string;
  duration: string;
  size: number;
  iconIndex: number;
}

export default function RegisterPage() {
  const router = useRouter();
  const { settings } = useSettingsStore();
  const { register, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [notes, setNotes] = useState<DecorativeNote[]>([]);

  useEffect(() => {
    const generatedNotes = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `-${Math.random() * 10}s`,
      duration: `${6 + Math.random() * 8}s`,
      size: 24 + Math.random() * 30,
      iconIndex: Math.floor(Math.random() * 4)
    }));
    setNotes(generatedNotes);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast({
        variant: "destructive",
        title: "Requisito legal",
        description: "Debes aceptar los Términos de Uso para continuar.",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Contraseña débil",
        description: "Debe tener al menos 6 caracteres.",
      });
      return;
    }
    setIsRegistering(true);
    const newUser = await register(name, email, password);
    if (newUser) {
      router.push('/register/instruments');
    } else {
      toast({
        variant: "destructive",
        title: "Error al registrar",
        description: "El correo ya podría estar en uso o hubo un fallo de red.",
      });
      setIsRegistering(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!acceptedTerms) {
      toast({
        variant: "destructive",
        title: "Requisito legal",
        description: "Debes aceptar los Términos de Uso antes de registrarte con Google.",
      });
      return;
    }
    setIsGoogleLoading(true);
    const success = await loginWithGoogle();
    if (success) {
      router.push('/register/instruments');
    } else {
      setIsGoogleLoading(false);
    }
  };

  // Función para procesar y dar diseño al texto de términos
  const renderFormattedTerms = (text?: string) => {
    if (!text) return <p className="italic text-muted-foreground">Cargando términos...</p>;
    
    // Dividir por párrafos (doble salto de línea)
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((para, i) => {
      // Dividir por la primera línea para separar el título del cuerpo si existe
      const lines = para.split('\n');
      const firstLine = lines[0].trim();
      const restLines = lines.slice(1).join('\n').trim();

      // Identificar si la primera línea es un encabezado de sección (ej: "1. Titulo", "1- Titulo")
      const isHeader = /^(\d+[\.\-\)]\s*.*)/.test(firstLine);
      
      const processText = (t: string) => {
        const parts = t.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-accent font-black drop-shadow-sm">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
      };

      if (isHeader) {
        return (
          <div key={i} className="mb-8 mt-10 first:mt-0 animate-in fade-in slide-in-from-left-4 duration-500">
            <h4 className="text-xl font-black text-foreground flex items-center gap-3">
              <div className="w-2 h-8 bg-accent rounded-full shadow-[0_0_10px_rgba(255,139,122,0.4)]" />
              {processText(firstLine)}
            </h4>
            <div className="h-0.5 w-full bg-primary/10 mt-2 mb-4 rounded-full" />
            {restLines && (
              <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap px-1">
                {processText(restLines)}
              </p>
            )}
          </div>
        );
      }

      return (
        <p key={i} className="mb-5 text-sm md:text-base text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap px-1">
          {processText(para)}
        </p>
      );
    });
  };

  const icons = [Music, Music2, Music3, Music4];

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/20 p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
        {notes.map((note) => {
          const Icon = icons[note.iconIndex];
          return (
            <div 
              key={note.id}
              className="absolute animate-float"
              style={{
                left: note.left,
                top: note.top,
                animationDelay: note.delay,
                animationDuration: note.duration,
              }}
            >
              <Icon size={note.size} className="text-accent" />
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-16 h-16 bg-white p-1 rounded-2xl shadow-lg mb-4 overflow-hidden border-2 border-accent">
            <Image 
              src={settings.appLogoUrl} 
              alt="Logo" 
              fill 
              className="object-cover"
              data-ai-hint="academy logo"
            />
          </div>
          <h2 className="text-3xl font-bold font-headline text-foreground">Únete y Aprende Con Ritmo!</h2>
          <p className="text-muted-foreground mt-2">Tu aventura musical comienza aquí</p>
        </div>

        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm rounded-3xl p-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-foreground">Crear Cuenta</CardTitle>
            <CardDescription>Completa tus datos para empezar</CardDescription>
          </CardHeader>

          <div className="px-6 pb-2">
            <Button 
              variant="outline" 
              className={cn(
                "w-full h-12 rounded-xl border-2 font-bold gap-3 transition-all",
                !acceptedTerms ? "opacity-50 grayscale cursor-not-allowed" : "hover:bg-accent/5"
              )}
              onClick={handleGoogleRegister}
              disabled={isGoogleLoading || isRegistering}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.53v2.77h2.63c1.54-1.41 2.43-3.5 2.43-5.31z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Registrarse con Google
            </Button>
          </div>

          <div className="flex items-center gap-4 px-6 py-2">
            <Separator className="flex-1" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">o usa tu correo</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input 
                    id="name" 
                    placeholder="Juan Pérez" 
                    className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-10 py-2 text-sm font-bold text-foreground focus:border-accent outline-none transition-all" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input 
                    id="email" 
                    type="email" 
                    placeholder="nombre@ejemplo.com" 
                    className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-10 py-2 text-sm font-bold text-foreground focus:border-accent outline-none transition-all" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-10 py-2 text-sm font-bold text-foreground focus:border-accent outline-none transition-all" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-start space-x-3 p-3 bg-primary/10 rounded-2xl border border-primary/20">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms} 
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-xs font-bold text-foreground leading-snug cursor-pointer"
                    >
                      Acepto los Términos de Uso y la Política de Privacidad de la academia.
                    </label>
                    <Dialog open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen}>
                      <DialogTrigger asChild>
                        <button type="button" className="text-[10px] text-accent font-black uppercase tracking-widest flex items-center gap-1 hover:underline text-left">
                          <ExternalLink className="w-3 h-3 shrink-0" /> Leer términos detallados y sanciones
                        </button>
                      </DialogTrigger>
                      <DialogContent className="rounded-[2.5rem] max-w-3xl border-none shadow-2xl p-0 overflow-hidden flex flex-col h-[85vh]">
                        <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
                          <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-accent" />
                            Términos, Condiciones y Políticas
                          </DialogTitle>
                          <DialogDescription className="font-medium text-muted-foreground">Normas de convivencia y uso de la plataforma Aprende con Ritmo.</DialogDescription>
                        </DialogHeader>
                        
                        <div className="flex-1 p-8 bg-card overflow-y-auto min-h-0 custom-scrollbar">
                          <div className="prose prose-sm max-w-none">
                            {renderFormattedTerms(settings.termsContent)}
                          </div>
                        </div>

                        <DialogFooter className="p-6 bg-muted/30 border-t shrink-0">
                          <Button 
                            className="w-full bg-accent text-white rounded-xl h-14 font-black shadow-lg shadow-accent/20 hover:scale-105 transition-all"
                            onClick={() => {
                              setAcceptedTerms(true);
                              setIsTermsModalOpen(false);
                            }}
                          >
                            <FileText className="w-5 h-5 mr-2" /> Entiendo y Acepto las Condiciones
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                disabled={isRegistering || isGoogleLoading || !acceptedTerms} 
                className={cn(
                  "w-full bg-accent hover:bg-accent/90 text-white rounded-xl py-6 text-lg font-black transition-all",
                  !acceptedTerms && "opacity-50 grayscale cursor-not-allowed"
                )}
              >
                {isRegistering ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Registrarse'}
              </Button>
              <p className="text-sm text-center text-muted-foreground font-medium">
                ¿Ya tienes una cuenta? <Link href="/login" className="text-accent font-bold hover:underline">Inicia sesión</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
