
"use client"

import { useState } from 'react';
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
import { MoreHorizontal, Search, UserPlus, Filter, Trash, Edit, TrendingUp, GraduationCap, Briefcase } from 'lucide-react';
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
import { useAuth } from '@/lib/auth-store';

export default function UsersPage() {
  const { allUsers } = useAuth();
  const [search, setSearch] = useState('');

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const students = filteredUsers.filter(u => u.role === 'student');
  const staff = filteredUsers.filter(u => u.role === 'teacher' || u.role === 'admin');

  const UserTable = ({ users }: { users: any[] }) => (
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
                    <DropdownMenuItem className="gap-2 rounded-xl font-bold py-2"><Edit className="w-4 h-4" /> Editar Perfil</DropdownMenuItem>
                    {u.role === 'student' && (
                      <DropdownMenuItem className="gap-2 rounded-xl font-bold py-2"><TrendingUp className="w-4 h-4" /> Ver Progreso</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem className="gap-2 rounded-xl font-bold py-2 text-destructive focus:text-destructive"><Trash className="w-4 h-4" /> Eliminar Cuenta</DropdownMenuItem>
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
    </AppLayout>
  );
}
