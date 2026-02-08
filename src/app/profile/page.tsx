
"use client"

import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Music, User, AtSign, Check, Camera, Upload, RefreshCw, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const INSTRUMENTS_LIST = [
  'Guitarra', 'Piano', 'Violín', 'Canto', 'Batería', 'Bajo', 'Teoría'
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [avatarSeed, setAvatarSeed] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setSelectedInstruments(user.instruments || []);
      setAvatarSeed(user.avatarSeed || user.id);
      setPhotoUrl(user.photoUrl);
    }
  }, [user]);

  const handleSave = () => {
    updateUser({
      name,
      username,
      phone,
      instruments: selectedInstruments,
      avatarSeed,
      photoUrl
    });
    
    toast({
      title: "¡Perfil Actualizado! ✨",
      description: "Tus cambios se han guardado correctamente.",
    });
  };

  const toggleInstrument = (inst: string) => {
    setSelectedInstruments(prev => 
      prev.includes(inst) 
        ? prev.filter(i => i !== inst) 
        : [...prev, inst]
    );
  };

  const generateRandomAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
    setPhotoUrl(undefined); // Al generar aleatorio, priorizamos el avatar por semilla
    toast({
      description: "Se ha generado un nuevo avatar aleatorio.",
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        toast({
          description: "Foto cargada correctamente.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoUrl(undefined);
    toast({
      description: "Se ha vuelto al avatar aleatorio.",
    });
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-foreground font-headline tracking-tight">Mi Perfil Musical 🎼</h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Personaliza tu identidad en la academia.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 rounded-[2.5rem] border-none shadow-md overflow-hidden bg-card">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-primary shadow-xl">
                  {photoUrl ? (
                    <AvatarImage src={photoUrl} className="object-cover" />
                  ) : (
                    <AvatarImage src={`https://picsum.photos/seed/${avatarSeed}/200`} />
                  )}
                  <AvatarFallback className="text-4xl">{name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="absolute -bottom-2 flex gap-2 w-full justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-accent text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
                    title="Subir foto propia"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={generateRandomAvatar}
                    className="bg-secondary text-secondary-foreground p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
                    title="Generar avatar aleatorio"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  {photoUrl && (
                    <button 
                      onClick={removePhoto}
                      className="bg-destructive text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
                      title="Eliminar foto propia"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                />
              </div>
              
              <div className="pt-4">
                <h2 className="text-xl font-black text-foreground">{name}</h2>
                <p className="text-sm font-bold text-accent uppercase tracking-widest mt-1">@{username || 'usuario'}</p>
                <Badge variant="secondary" className="mt-3 bg-primary/20 text-secondary-foreground rounded-full px-4 capitalize font-bold">
                  {user.role === 'student' ? 'Estudiante' : user.role === 'teacher' ? 'Profesor' : 'Administrador'}
                </Badge>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-2 border-primary/20 font-bold"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" /> Subir Foto
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl font-bold text-muted-foreground"
                  onClick={generateRandomAvatar}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Avatar Aleatorio
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 rounded-[2.5rem] border-none shadow-md bg-card">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
                <User className="w-6 h-6 text-accent" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 pl-11 rounded-xl border-2 font-bold text-foreground bg-card"
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre de Usuario</Label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 pl-11 rounded-xl border-2 font-bold text-foreground bg-card"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Correo Electrónico (No editable)</Label>
                  <Input 
                    value={email} 
                    disabled
                    className="h-12 rounded-xl border-2 bg-muted/30 font-bold opacity-60 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Número de Contacto</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 pl-11 rounded-xl border-2 font-bold text-foreground bg-card"
                      placeholder="+51 999 999 999"
                      type="tel"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Music className="w-4 h-4 text-accent" /> 
                  {user.role === 'teacher' ? 'Mis Especialidades (Instrumentos que enseño)' : 'Mis Instrumentos (Lo que aprendo)'}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {INSTRUMENTS_LIST.map(inst => {
                    const isSelected = selectedInstruments.includes(inst);
                    return (
                      <button
                        key={inst}
                        onClick={() => toggleInstrument(inst)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-black transition-all border-2",
                          isSelected 
                            ? "bg-accent border-accent text-white shadow-md" 
                            : "bg-card border-primary/10 text-muted-foreground hover:border-accent/30"
                        )}
                      >
                        {inst}
                        {isSelected && <Check className="w-3 h-3 ml-2 inline" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 bg-muted/30 border-t flex justify-end">
              <Button 
                onClick={handleSave}
                className="bg-accent text-white rounded-2xl h-14 px-10 font-black shadow-xl hover:scale-105 transition-all"
              >
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
