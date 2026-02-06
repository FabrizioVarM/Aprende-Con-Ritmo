
"use client"

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Music, User, AtSign, Check, Camera, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const INSTRUMENTS_LIST = [
  'Guitarra', 'Piano', 'Violín', 'Canto', 'Batería', 'Bajo', 'Flauta', 'Teoría'
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [avatarSeed, setAvatarSeed] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setSelectedInstruments(user.instruments || []);
      setAvatarSeed(user.avatarSeed || user.id);
    }
  }, [user]);

  const handleSave = () => {
    updateUser({
      name,
      username,
      instruments: selectedInstruments,
      avatarSeed
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

  const changeAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
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
          <Card className="md:col-span-1 rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-primary shadow-xl">
                  <AvatarImage src={`https://picsum.photos/seed/${avatarSeed}/200`} />
                  <AvatarFallback className="text-4xl">{name[0]}</AvatarFallback>
                </Avatar>
                <button 
                  onClick={changeAvatar}
                  className="absolute bottom-0 right-0 bg-accent text-white p-3 rounded-2xl shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              
              <div>
                <h2 className="text-xl font-black text-secondary-foreground">{name}</h2>
                <p className="text-sm font-bold text-accent uppercase tracking-widest mt-1">@{username || 'usuario'}</p>
                <Badge variant="secondary" className="mt-3 bg-primary/20 text-secondary-foreground rounded-full px-4 capitalize font-bold">
                  {user.role === 'student' ? 'Estudiante' : user.role === 'teacher' ? 'Profesor' : 'Administrador'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 rounded-[2.5rem] border-none shadow-md bg-white">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-xl font-black flex items-center gap-2">
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
                      className="h-12 pl-11 rounded-xl border-2 font-bold"
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
                      className="h-12 pl-11 rounded-xl border-2 font-bold"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Correo Electrónico (No editable)</Label>
                <Input 
                  value={email} 
                  disabled
                  className="h-12 rounded-xl border-2 bg-muted/30 font-bold opacity-60"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Music className="w-4 h-4 text-accent" /> Mis Instrumentos
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
                            : "bg-white border-primary/10 text-muted-foreground hover:border-accent/30"
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
            <CardFooter className="p-8 bg-gray-50 border-t flex justify-end">
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
