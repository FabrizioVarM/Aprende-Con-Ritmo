
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
import { MoreHorizontal, Search, UserPlus, Filter, Trash, Edit, TrendingUp } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const MOCK_USERS_DATA = [
  { id: 1, name: 'Ana Garcia', email: 'ana@example.com', role: 'estudiante', status: 'Activo' },
  { id: 2, name: 'Carlos Valdes', email: 'carlos@example.com', role: 'profesor', status: 'Activo' },
  { id: 3, name: 'Emma Watson', email: 'emma@example.com', role: 'estudiante', status: 'Pendiente' },
  { id: 4, name: 'Liam Neeson', email: 'liam@example.com', role: 'profesor', status: 'Activo' },
  { id: 5, name: 'Sofia Vergara', email: 'sofia@example.com', role: 'admin', status: 'Activo' },
  { id: 6, name: 'Tom Holland', email: 'tom@example.com', role: 'estudiante', status: 'Inactivo' },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');

  const filteredUsers = MOCK_USERS_DATA.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground font-headline">Gestión de Usuarios 👥</h1>
            <p className="text-muted-foreground mt-1 text-lg">Administra las cuentas y permisos de la escuela.</p>
          </div>
          <Button className="bg-accent text-white rounded-xl gap-2 h-12 px-6 shadow-lg shadow-accent/20">
            <UserPlus className="w-5 h-5" /> Agregar Nuevo Usuario
          </Button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-border p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre o correo..." 
                className="pl-10 rounded-2xl h-11 border-primary/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-2xl gap-2 border-primary h-11 px-6">
              <Filter className="w-4 h-4" /> Filtrar
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-primary">
                          <AvatarImage src={`https://picsum.photos/seed/${user.id}/100`} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize rounded-full px-3">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 text-sm font-medium",
                        user.status === 'Activo' ? "text-green-600" : 
                        user.status === 'Pendiente' ? "text-orange-600" : "text-red-600"
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          user.status === 'Activo' ? "bg-green-600" : 
                          user.status === 'Pendiente' ? "bg-orange-600" : "bg-red-600"
                        )} />
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-48">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2"><Edit className="w-4 h-4" /> Editar Perfil</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><TrendingUp className="w-4 h-4" /> Ver Progreso</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive"><Trash className="w-4 h-4" /> Eliminar Cuenta</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
