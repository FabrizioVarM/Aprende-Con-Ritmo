
"use client"

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Search, UserPlus, Filter, Trash, Edit, TrendingUp, GraduationCap, Briefcase, User as UserIcon, AtSign, Music, Check, Camera, Upload, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth, User } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';

const INSTRUMENTS_LIST = [
  'Guitarra', 'Piano', 'Violín', 'Canto', 'Batería', 'Bajo', 'Teoría'
];

export default function UsersPage() {
  const { allUsers, adminUpdateUser, adminDeleteUser, loading, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editInstruments, setEditInstruments] = useState<string[]>([]);
  const [editPhotoUrl, setEditPhotoUrl] = useState<string | undefined>(undefined);
  const [editAvatarSeed, setEditAvatarSeed] = useState('');

  // Delete State
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const students = filteredUsers.filter(u => u.role === 'student');
  const staff = filteredUsers.filter(u => u.role === 'teacher' || u.role === 'admin');

  const openEditDialog = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditUsername(u.username || '');
    setEditInstruments(u.instruments || []);
    setEditPhotoUrl(u.photoUrl);
    setEditAvatarSeed(u.avatarSeed || u.id);
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      adminUpdateUser(editingUser.id, {
        name: editName,
        username: editUsername,
        instruments: editInstruments,
        photoUrl: editPhotoUrl,
        avatarSeed: editAvatarSeed
      });
      setEditingUser(null);
      toast({
        title: "Usuario Actualizado ✨",
        description: `Los cambios para ${editName} se han guardado correctamente.`,
      });
    }
  };

  const handleDeleteUser = () => {
    if (deletingUserId) {
      const u = allUsers.find(u => u.id === deletingUserId);
      adminDeleteUser(deletingUserId);
      setDeletingUserId(null);
      toast({
        title: "Cuenta Eliminada 🗑️",
        description: `El usuario ${u?.name} ha sido borrado del sistema.`,
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhotoUrl(reader.result as string);
        toast({ description: "Foto cargada correctamente." });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setEditAvatarSeed(newSeed);
    setEditPhotoUrl(undefined);
    toast({ description: "Nuevo avatar generado." });
  };

  const removePhoto = () => {
    setEditPhotoUrl(undefined);
    toast({ description: "Se ha vuelto al avatar por defecto." });
  };

  const toggleInstrument = (inst: string) => {
    setEditInstruments(prev => 
      prev.includes(inst) 
        ? prev.filter(i => i !== inst) 
        : [...prev, inst]
    );
  };

  if (!isMounted || loading || !user) return null;

  const UserTable = ({ users }: { users: User[] }) => (
    <div className="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[300px] font-black uppercase text-[10px] tracking-widest">Usuario</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest">Rol</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest">Estado</TableHead>
            <TableHead className="text-right font-black uppercase text-[10px] tracking-widest">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? users.map((u) => (
            <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-primary/20 shadow-sm">
                    {u.photoUrl ? (
                      <AvatarImage src={u.photoUrl} className="object-cover" />
                    ) : (
                      <AvatarImage src={`https://picsum.photos/seed/${u.avatarSeed || u.id}/100`} />
                    )}
                    <AvatarFallback className="bg-primary text-secondary-foreground font-black">{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-black text-secondary-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground font-medium">{u.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize rounded-full px-3 font-bold text-[10px] bg-primary/20 text-secondary-foreground">
                  {u.role === 'student' ? 'Estudiante' : u.role === 'teacher' ? 'Profesor' : 'Admin'}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-green-600 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  Activo
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/10">
                      <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl w-48 border-none shadow-xl p-2">
                    <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground px-2 pb-2">Opciones</DropdownMenuLabel>
                    <DropdownMenuItem 
                      className="gap-2 rounded-xl font-bold py-2 cursor-pointer"
                      onClick={() => openEditDialog(u)}
                    >
                      <Edit className="w-4 h-4" /> Editar Perfil
                    </DropdownMenuItem>
                    {u.role === 'student' && (
                      <DropdownMenuItem 
                        className="gap-2 rounded-xl font-bold py-2 cursor-pointer"
                        onClick={() => router.push(`/progress?studentId=${u.id}`)}
                      >
                        <TrendingUp className="w-4 h-4" /> Ver Progreso
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem 
                      className="gap-2 rounded-xl font-bold py-2 text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => setDeletingUserId(u.id)}
                    >
                      <Trash className="w-4 h-4" /> Eliminar Cuenta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-bold italic bg-primary/5">
                No se encontraron usuarios en esta categoría.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-foreground font-headline tracking-tight">Gestión de Usuarios 👥</h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">Administra las cuentas y permisos de la escuela de música.</p>
          </div>
          <Button className="bg-accent text-white rounded-2xl gap-2 h-14 px-8 shadow-xl shadow-accent/20 hover:scale-105 transition-all font-black">
            <UserPlus className="w-5 h-5" /> Agregar Nuevo Usuario
          </Button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-md border-none p-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre o correo..." 
                className="pl-12 rounded-2xl h-12 border-2 border-primary/10 bg-white font-bold focus:border-accent transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-2xl gap-2 border-2 border-primary/10 h-12 px-6 font-black hover:border-accent hover:bg-accent/5">
              <Filter className="w-4 h-4" /> Filtrar Lista
            </Button>
          </div>

          <Tabs defaultValue="students" className="w-full">
            <TabsList className="bg-primary/5 p-1 rounded-2xl h-14 mb-8">
              <TabsTrigger 
                value="students" 
                className="rounded-xl px-10 h-12 font-black data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-accent transition-all"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Alumnos
              </TabsTrigger>
              <TabsTrigger 
                value="staff" 
                className="rounded-xl px-10 h-12 font-black data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-accent transition-all"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Profesores y Personal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="animate-in fade-in-50 duration-500 outline-none">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-accent rounded-full" />
                  <h2 className="text-2xl font-black text-secondary-foreground">Directorio de Estudiantes</h2>
                </div>
                <UserTable users={students} />
              </div>
            </TabsContent>

            <TabsContent value="staff" className="animate-in fade-in-50 duration-500 outline-none">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" />
                  <h2 className="text-2xl font-black text-secondary-foreground">Cuerpo Docente y Administración</h2>
                </div>
                <UserTable users={staff} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary/10 p-8 border-b space-y-2 shrink-0">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="w-20 h-20 border-4 border-white shadow-xl">
                  {editPhotoUrl ? (
                    <AvatarImage src={editPhotoUrl} className="object-cover" />
                  ) : (
                    <AvatarImage src={`https://picsum.photos/seed/${editAvatarSeed}/150`} />
                  )}
                  <AvatarFallback className="text-2xl font-black">{editName[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 flex flex-col gap-1">
                  <Button 
                    size="icon" 
                    className="w-8 h-8 rounded-full bg-accent text-white shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                    title="Subir foto"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-black text-secondary-foreground">Editar Perfil</DialogTitle>
                <DialogDescription className="text-base text-secondary-foreground/70 font-medium">
                  {editingUser?.role === 'teacher' ? 'Perfil del Profesor' : editingUser?.role === 'student' ? 'Perfil del Estudiante' : 'Perfil Administrativo'}
                </DialogDescription>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="h-7 rounded-lg text-[10px] font-black uppercase px-2 border-primary/20 bg-white/50" onClick={generateRandomAvatar}>
                    <RefreshCw className="w-3 h-3 mr-1" /> Aleatorio
                  </Button>
                  {editPhotoUrl && (
                    <Button variant="outline" size="sm" className="h-7 rounded-lg text-[10px] font-black uppercase px-2 border-destructive/20 text-destructive bg-white/50" onClick={removePhoto}>
                      <X className="w-3 h-3 mr-1" /> Quitar
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
          </DialogHeader>

          <div className="p-8 space-y-8 bg-white overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre Completo</Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-12 pl-11 rounded-xl border-2 font-bold focus:border-accent"
                    placeholder="Nombre"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre de Usuario</Label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={editUsername} 
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="h-12 pl-11 rounded-xl border-2 font-bold focus:border-accent"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Music className="w-4 h-4 text-accent" /> 
                {editingUser?.role === 'teacher' ? 'Especialidades (Instrumentos que enseña)' : 'Instrumentos (Lo que aprende)'}
              </Label>
              <div className="flex flex-wrap gap-2">
                {INSTRUMENTS_LIST.map(inst => {
                  const isSelected = editInstruments.includes(inst);
                  return (
                    <button
                      key={inst}
                      type="button"
                      onClick={() => toggleInstrument(inst)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-black transition-all border-2",
                        isSelected 
                          ? "bg-accent border-accent text-white shadow-md scale-105" 
                          : "bg-white border-primary/10 text-muted-foreground hover:border-accent/30"
                      )}
                    >
                      {inst}
                      {isSelected && <Check className="w-3 h-3 ml-2 inline animate-in zoom-in" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-gray-50 flex gap-3 border-t shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setEditingUser(null)} 
              className="rounded-xl flex-1 h-14 font-black"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              className="bg-accent text-white rounded-xl flex-1 h-14 font-black shadow-lg shadow-accent/20 hover:scale-105 transition-all"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <AlertDialogTitle className="text-2xl font-black text-secondary-foreground">¿Confirmar eliminación?</AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium">
                Esta acción eliminará al usuario de los directorios y no se podrán reservar nuevas clases con él. 
                <br /><br />
                <span className="font-black text-destructive uppercase text-xs tracking-widest">Aviso Académico:</span>
                <ul className="text-left text-sm mt-3 space-y-2 list-disc pl-5 font-bold text-muted-foreground">
                  <li>Las clases ya completadas se mantendrán en el historial.</li>
                  <li>Las clases reservadas seguirán activas para el administrador.</li>
                  <li>El usuario ya no tendrá acceso a la plataforma.</li>
                </ul>
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:space-x-0">
            <AlertDialogCancel className="rounded-xl flex-1 h-12 font-black border-2">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="rounded-xl flex-1 h-12 font-black bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
