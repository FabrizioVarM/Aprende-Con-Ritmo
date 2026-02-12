
"use client"

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogTrigger
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoreHorizontal, Search, UserPlus, Filter, Trash, Edit, TrendingUp, GraduationCap, Briefcase, User as UserIcon, AtSign, Music, Check, Camera, Upload, RefreshCw, X, AlertTriangle, Mail, Lock, Phone, ShieldCheck, Library } from 'lucide-react';
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
import { useAuth, User, UserRole } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';

const INSTRUMENTS_LIST = [
  'Guitarra', 'Piano', 'Violín', 'Canto', 'Batería', 'Bajo', 'Teoría'
];

function UsersContent() {
  const { allUsers, adminUpdateUser, adminAddUser, adminDeleteUser, loading, user: currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editInstruments, setEditInstruments] = useState<string[]>([]);
  const [editPhotoUrl, setEditPhotoUrl] = useState<string | undefined>(undefined);
  const [editAvatarSeed, setEditAvatarSeed] = useState('');
  const [editCanManageLibrary, setEditCanManageLibrary] = useState(false);

  // Create State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newUsername, setNewUsername] = useState('');
  const [newInstruments, setNewInstruments] = useState<string[]>([]);
  const [newCanManageLibrary, setNewCanManageLibrary] = useState(false);

  // Delete State
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (searchParams.get('add') === 'true') {
      setIsCreateDialogOpen(true);
    }
  }, [searchParams]);

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
    setEditPhone(u.phone || '');
    setEditRole(u.role);
    setEditInstruments(u.instruments || []);
    setEditPhotoUrl(u.photoUrl);
    setEditAvatarSeed(u.avatarSeed || u.id);
    setEditCanManageLibrary(u.canManageLibrary || false);
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      adminUpdateUser(editingUser.id, {
        name: editName,
        username: editUsername,
        phone: editPhone,
        role: editRole,
        instruments: editInstruments,
        photoUrl: editPhotoUrl,
        avatarSeed: editAvatarSeed,
        canManageLibrary: editCanManageLibrary
      });
      setEditingUser(null);
      toast({
        title: "Usuario Actualizado ✨",
        description: `Los cambios para ${editName} se han guardado correctamente.`,
      });
    }
  };

  const handleCreateUser = () => {
    if (!newName || !newEmail) {
      toast({
        variant: "destructive",
        title: "Datos incompletos",
        description: "Por favor completa el nombre y el correo electrónico.",
      });
      return;
    }

    adminAddUser({
      name: newName,
      email: newEmail,
      role: newRole,
      username: newUsername,
      phone: newPhone,
      instruments: newInstruments,
      canManageLibrary: newCanManageLibrary
    });

    setIsCreateDialogOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('student');
    setNewUsername('');
    setNewInstruments([]);
    setNewCanManageLibrary(false);

    toast({
      title: "¡Usuario Creado! 🎊",
      description: "La cuenta ha sido dada de alta correctamente.",
    });
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

  const toggleInstrument = (inst: string, isCreate: boolean = false) => {
    if (isCreate) {
      setNewInstruments(prev => 
        prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]
      );
    } else {
      setEditInstruments(prev => 
        prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]
      );
    }
  };

  if (!isMounted || loading || !currentUser) return null;

  const UserTable = ({ users }: { users: User[] }) => (
    <div className="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[300px] font-black uppercase text-[10px] tracking-widest text-muted-foreground">Usuario</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Rol</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Estado</TableHead>
            <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground">Acciones</TableHead>
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
                    <div className="font-black text-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground font-medium">{u.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant="secondary" className="capitalize rounded-full px-3 font-bold text-[10px] bg-primary/20 text-secondary-foreground w-fit">
                    {u.role === 'student' ? 'Estudiante' : u.role === 'teacher' ? 'Profesor' : 'Admin'}
                  </Badge>
                  {u.role === 'teacher' && u.canManageLibrary && (
                    <Badge variant="outline" className="text-[8px] font-black uppercase border-accent text-accent w-fit bg-accent/5">
                      Gestor Biblioteca
                    </Badge>
                  )}
                </div>
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
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-white rounded-2xl gap-2 h-14 px-8 shadow-xl shadow-accent/20 hover:scale-105 transition-all font-black">
                <UserPlus className="w-5 h-5" /> Agregar Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
              <DialogHeader className="bg-primary/10 dark:bg-accent/10 p-8 border-b space-y-2 shrink-0">
                <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                  <UserPlus className="w-8 h-8 text-accent" />
                  Crear Nuevo Usuario
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground font-medium">
                  Da de alta a un nuevo alumno o profesor en la plataforma.
                </DialogDescription>
              </DialogHeader>
              <div className="p-8 space-y-8 bg-card overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre Completo</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-12 pl-11 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                        placeholder="Nombre del usuario"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={newEmail} 
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="h-12 pl-11 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                        placeholder="usuario@ejemplo.com"
                        type="email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre de Usuario</Label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={newUsername} 
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="h-12 pl-11 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Rol en la Academia</Label>
                    <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                      <SelectTrigger className="h-12 rounded-xl border-2 font-bold bg-card text-foreground">
                        <SelectValue placeholder="Seleccionar Rol" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="student" className="font-bold">Estudiante</SelectItem>
                        <SelectItem value="teacher" className="font-bold">Profesor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Número de Contacto</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={newPhone} 
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="h-12 pl-11 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                        placeholder="Número de contacto"
                        type="tel"
                      />
                    </div>
                  </div>
                </div>

                {newRole === 'teacher' && (
                  <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border-2 border-accent/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                        <Library className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <Label className="text-sm font-black text-foreground">Permisos de Biblioteca</Label>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Permite crear y editar materiales</p>
                      </div>
                    </div>
                    <Switch checked={newCanManageLibrary} onCheckedChange={setNewCanManageLibrary} />
                  </div>
                )}

                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Music className="w-4 h-4 text-accent" /> 
                    {newRole === 'teacher' ? 'Especialidades (Instrumentos que enseña)' : 'Instrumentos (Lo que aprende)'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {INSTRUMENTS_LIST.map(inst => {
                      const isSelected = newInstruments.includes(inst);
                      return (
                        <button
                          key={inst}
                          type="button"
                          onClick={() => toggleInstrument(inst, true)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-black transition-all border-2",
                            isSelected 
                              ? "bg-accent border-accent text-white shadow-md scale-105" 
                              : "bg-card border-primary/10 text-muted-foreground hover:border-accent/30"
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
              <DialogFooter className="p-8 bg-muted/30 flex gap-3 border-t shrink-0">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl flex-1 h-14 font-black text-foreground">Cancelar</Button>
                <Button onClick={handleCreateUser} className="bg-accent text-white rounded-xl flex-1 h-14 font-black shadow-lg shadow-accent/20">Crear Usuario</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-[2.5rem] shadow-md border-2 border-primary/20 p-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre o correo..." 
                className="pl-12 rounded-2xl h-12 border-2 border-primary/10 bg-card text-foreground font-bold focus:border-accent transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-2xl gap-2 border-2 border-primary/10 h-12 px-6 font-black hover:border-accent hover:bg-accent/5 text-foreground">
              <Filter className="w-4 h-4" /> Filtrar Lista
            </Button>
          </div>

          <Tabs defaultValue="students" className="w-full">
            <TabsList className="bg-primary/5 p-1 rounded-2xl h-14 mb-8">
              <TabsTrigger 
                value="students" 
                className="rounded-xl px-10 h-12 font-black data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-accent transition-all"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Alumnos
              </TabsTrigger>
              <TabsTrigger 
                value="staff" 
                className="rounded-xl px-10 h-12 font-black data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-accent transition-all"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Profesores y Personal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="animate-in fade-in-50 duration-500 outline-none">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-accent rounded-full" />
                  <h2 className="text-2xl font-black text-foreground">Directorio de Estudiantes</h2>
                </div>
                <UserTable users={students} />
              </div>
            </TabsContent>

            <TabsContent value="staff" className="animate-in fade-in-50 duration-500 outline-none">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" />
                  <h2 className="text-2xl font-black text-foreground">Cuerpo Docente y Administración</h2>
                </div>
                <UserTable users={staff} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-primary/10 dark:bg-accent/10 p-8 border-b space-y-2 shrink-0">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="w-20 h-20 border-4 border-card shadow-xl">
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
                <DialogTitle className="text-2xl font-black text-foreground">Editar Perfil</DialogTitle>
                <DialogDescription className="text-base text-muted-foreground font-medium">
                  {editingUser?.role === 'teacher' ? 'Perfil del Profesor' : editingUser?.role === 'student' ? 'Perfil del Estudiante' : 'Perfil Administrativo'}
                </DialogDescription>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="h-7 rounded-lg text-[10px] font-black uppercase px-2 border-primary/20 bg-card/50 text-foreground" onClick={generateRandomAvatar}>
                    <RefreshCw className="w-3 h-3 mr-1" /> Aleatorio
                  </Button>
                  {editPhotoUrl && (
                    <Button variant="outline" size="sm" className="h-7 rounded-lg text-[10px] font-black uppercase px-2 border-destructive/20 text-destructive bg-card/50" onClick={removePhoto}>
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

          <div className="p-8 space-y-8 bg-card overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre Completo</Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-12 pl-11 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
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
                    className="h-12 pl-11 rounded-xl border-2 font-bold focus:border-accent bg-card text-foreground"
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Número de Contacto</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={editPhone} 
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="h-12 font-bold pl-11 rounded-xl border-2 focus:border-accent bg-card text-foreground"
                    placeholder="Número de contacto"
                    type="tel"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-accent" /> Rol en la Academia
                </Label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold bg-card text-foreground">
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="student" className="font-bold">Estudiante</SelectItem>
                    <SelectItem value="teacher" className="font-bold">Profesor</SelectItem>
                    <SelectItem value="admin" className="font-bold">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editRole === 'teacher' && (
              <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border-2 border-accent/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <Library className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <Label className="text-sm font-black text-foreground">Permisos de Biblioteca</Label>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Permite crear y editar materiales</p>
                  </div>
                </div>
                <Switch checked={editCanManageLibrary} onCheckedChange={setEditCanManageLibrary} />
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Music className="w-4 h-4 text-accent" /> 
                {editRole === 'teacher' ? 'Especialidades (Instrumentos que enseña)' : 'Instrumentos (Lo que aprende)'}
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
                          : "bg-card border-primary/10 text-muted-foreground hover:border-accent/30"
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

          <div className="p-8 bg-muted/30 border-t flex gap-3 shrink-0">
            <Button variant="outline" onClick={() => setEditingUser(null)} className="rounded-xl flex-1 h-14 font-black text-foreground">Cancelar</Button>
            <Button onClick={handleSaveEdit} className="bg-accent text-white rounded-xl flex-1 h-14 font-black shadow-lg shadow-accent/20 hover:scale-105 transition-all">Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8 bg-card">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <AlertDialogTitle className="text-2xl font-black text-foreground">¿Confirmar eliminación?</AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium text-muted-foreground">
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
            <AlertDialogCancel className="rounded-xl flex-1 h-12 font-black border-2 text-foreground">Cancelar</AlertDialogCancel>
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

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersContent />
    </Suspense>
  );
}
