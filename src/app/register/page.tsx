"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, User, Music, Music2, Music3, Music4, Loader2, ShieldCheck, ExternalLink, FileText, Scale, AlertTriangle, Copyright } from 'lucide-react';
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
                  <Input 
                    id="name" 
                    placeholder="Juan Pérez" 
                    className="pl-10 rounded-xl bg-background text-foreground border-border" 
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
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nombre@ejemplo.com" 
                    className="pl-10 rounded-xl bg-background text-foreground border-border" 
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
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 rounded-xl bg-background text-foreground border-border" 
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-[10px] text-accent font-black uppercase tracking-widest flex items-center gap-1 hover:underline text-left">
                          <ExternalLink className="w-3 h-3 shrink-0" /> Leer términos detallados y sanciones
                        </button>
                      </DialogTrigger>
                      <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
                        <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
                          <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-accent" />
                            Términos, Condiciones y Políticas
                          </DialogTitle>
                          <DialogDescription className="font-medium text-muted-foreground">Normas de convivencia y uso de la plataforma Aprende con Ritmo.</DialogDescription>
                        </DialogHeader>
                        
                        <div className="flex-1 p-8 bg-card overflow-y-auto min-h-0">
                          <div className="space-y-8 text-sm font-medium text-foreground leading-relaxed">
                            
                            <section className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <Music className="w-3.5 h-3.5 text-accent" />
                                </div>
                                <h3 className="font-black text-accent uppercase tracking-widest text-xs">1. Identidad y Propósito</h3>
                              </div>
                              <p>
                                La plataforma <strong>Aprende con Ritmo</strong> es una herramienta de gestión académica musical diseñada para facilitar la interacción entre alumnos, profesores y administración. El registro implica el uso de datos personales para fines exclusivamente educativos y de coordinación institucional.
                              </p>
                            </section>

                            <section className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <User className="w-3.5 h-3.5 text-accent" />
                                </div>
                                <h3 className="font-black text-accent uppercase tracking-widest text-xs">2. Usuarios y Menores de Edad</h3>
                              </div>
                              <p>
                                En caso de que el estudiante sea menor de edad, el registro y la operación de la aplicación deben ser realizados por el padre, madre o tutor legal, quien asume la responsabilidad total de la cuenta y la veracidad de la información proporcionada.
                              </p>
                            </section>

                            <section className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <Copyright className="w-3.5 h-3.5 text-accent" />
                                </div>
                                <h3 className="font-black text-accent uppercase tracking-widest text-xs">3. Propiedad Intelectual y Material Didáctico</h3>
                              </div>
                              <p>
                                Todo el material proporcionado en la Biblioteca (partituras, videos, audios, textos) es propiedad intelectual de la academia o cuenta con las licencias correspondientes para uso educativo.
                              </p>
                              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500 rounded-r-xl italic font-bold text-orange-800 dark:text-orange-200">
                                Queda estrictamente <strong>PROHIBIDA</strong> la descarga, reproducción, distribución, venta o uso de cualquier material didáctico fuera de la plataforma con fines de lucro sin la autorización expresa y por escrito de la dirección de Aprende con Ritmo.
                              </div>
                            </section>

                            <section className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <Scale className="w-3.5 h-3.5 text-accent" />
                                </div>
                                <h3 className="font-black text-accent uppercase tracking-widest text-xs">4. Código de Conducta y Uso Correcto</h3>
                              </div>
                              <p>El usuario se compromete a:</p>
                              <ul className="list-disc pl-5 space-y-2 font-bold text-muted-foreground italic">
                                <li>Proporcionar información veraz y mantenerla actualizada.</li>
                                <li>Mantener un trato respetuoso y profesional con los docentes y personal administrativo.</li>
                                <li>Utilizar la agenda de clases de forma responsable, respetando los tiempos de los profesores.</li>
                                <li>No intentar vulnerar la seguridad de la plataforma ni acceder a perfiles ajenos.</li>
                              </ul>
                            </section>

                            <section className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <AlertTriangle className="w-3.5 h-3.5 text-accent" />
                                </div>
                                <h3 className="font-black text-accent uppercase tracking-widest text-xs">5. Incumplimiento y Sanciones</h3>
                              </div>
                              <p>El incumplimiento de cualquiera de estos términos podrá resultar en:</p>
                              <ul className="list-decimal pl-5 space-y-2 font-bold text-muted-foreground italic">
                                <li>Amonestaciones verbales o escritas enviadas al perfil del alumno.</li>
                                <li>Suspensión temporal del acceso a la plataforma y materiales.</li>
                                <li><strong>Expulsión Definitiva</strong> de la academia y eliminación permanente de la cuenta sin derecho a reembolso en caso de faltas graves a la moral o mal uso de la propiedad intelectual.</li>
                                <li>Acciones legales pertinentes en caso de lucro indebido con materiales de la academia.</li>
                              </ul>
                            </section>

                            <section className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <FileText className="w-3.5 h-3.5 text-accent" />
                                </div>
                                <h3 className="font-black text-accent uppercase tracking-widest text-xs">6. Tratamiento de Datos</h3>
                              </div>
                              <p>Al registrarse, usted autoriza la recopilación y almacenamiento de:</p>
                              <ul className="list-disc pl-5 space-y-2 font-bold text-muted-foreground italic">
                                <li>Nombres, correos electrónicos y números de teléfono.</li>
                                <li>Instrumentos de interés y niveles de progreso técnico.</li>
                                <li>Fotografías de perfil y evidencias de aprendizaje.</li>
                                <li>Historial de asistencia y calificaciones.</li>
                              </ul>
                            </section>

                            <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 italic text-[11px] text-muted-foreground">
                              Al pulsar "Entiendo y Acepto", usted confirma que ha leído, comprendido y acepta someterse a estas condiciones en su totalidad, reconociendo la autoridad de la academia para velar por el correcto cumplimiento de las mismas.
                            </div>
                          </div>
                        </div>

                        <DialogFooter className="p-6 bg-muted/30 border-t shrink-0">
                          <Button 
                            className="w-full bg-accent text-white rounded-xl h-12 font-black shadow-lg"
                            onClick={() => {
                              setAcceptedTerms(true);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" /> Entiendo y Acepto las Condiciones
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
