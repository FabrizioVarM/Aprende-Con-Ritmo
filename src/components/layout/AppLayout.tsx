
"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Library, 
  TrendingUp, 
  Users, 
  LogOut,
  Menu,
  User as UserIcon
} from 'lucide-react';
import { useAuth, UserRole } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Panel', href: '/dashboard', icon: LayoutDashboard, roles: ['student', 'teacher', 'admin'] },
  { label: 'Horario', href: '/schedule', icon: Calendar, roles: ['student', 'teacher', 'admin'] },
  { label: 'Biblioteca', href: '/library', icon: Library, roles: ['student', 'teacher', 'admin'] },
  { label: 'Progreso', href: '/progress', icon: TrendingUp, roles: ['student', 'teacher'] },
  { label: 'Usuarios', href: '/users', icon: Users, roles: ['admin'] },
  { label: 'Mi Perfil', href: '/profile', icon: UserIcon, roles: ['student', 'teacher', 'admin'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const appLogo = PlaceHolderImages.find(img => img.id === 'app-logo');

  if (!user) {
    return <>{children}</>;
  }

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm border-r border-border p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-md border-2 border-accent">
          {appLogo && (
            <Image 
              src={appLogo.imageUrl} 
              alt="Logo" 
              fill 
              className="object-cover"
              data-ai-hint={appLogo.imageHint}
            />
          )}
        </div>
        <span className="text-xl font-extrabold text-secondary-foreground font-headline tracking-tight">
          Aprende Con Ritmo
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <span className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                isActive 
                  ? "bg-secondary text-secondary-foreground font-semibold shadow-sm" 
                  : "text-muted-foreground hover:bg-primary/30 hover:text-foreground"
              )}>
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-accent" : "text-muted-foreground"
                )} />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border">
        <Link href="/profile" className="flex items-center gap-3 px-4 py-4 mb-4 hover:bg-primary/10 rounded-2xl transition-all">
          <Avatar className="w-10 h-10 border-2 border-primary">
            {user.photoUrl ? (
              <AvatarImage src={user.photoUrl} className="object-cover" />
            ) : (
              <AvatarImage src={`https://picsum.photos/seed/${user.avatarSeed || user.id}/100`} />
            )}
            <AvatarFallback className="bg-primary">{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {user.role === 'student' ? 'Estudiante' : user.role === 'teacher' ? 'Profesor' : 'Administrador'}
            </span>
          </div>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
          onClick={() => {
            logout();
            router.push('/login');
          }}
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar de Escritorio */}
      <aside className="hidden md:block w-72 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 bg-white/80 border-b">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 overflow-hidden rounded-lg border-2 border-accent">
              {appLogo && (
                <Image 
                  src={appLogo.imageUrl} 
                  alt="Logo" 
                  fill 
                  className="object-cover"
                  data-ai-hint={appLogo.imageHint}
                />
              )}
            </div>
            <span className="font-bold">Aprende Con Ritmo</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetHeader className="sr-only">
                <SheetTitle>Menú de Navegación</SheetTitle>
                <SheetDescription>Acceso a las secciones principales de la academia Aprende Con Ritmo</SheetDescription>
              </SheetHeader>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
