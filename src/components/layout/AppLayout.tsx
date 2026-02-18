
"use client"

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home,
  LayoutDashboard, 
  Calendar, 
  Library, 
  TrendingUp, 
  Users, 
  LogOut,
  Menu,
  User as UserIcon,
  Settings,
  Check,
  ShoppingBag,
  Mic2,
  ClipboardList,
  Gift,
  Bell,
  Trash2,
  CheckCircle2,
  Clock,
  Search
} from 'lucide-react';
import { useAuth, UserRole } from '@/lib/auth-store';
import { useSettingsStore, AppSettings } from '@/lib/settings-store';
import { useNotificationStore } from '@/lib/notification-store';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationListener } from '@/components/NotificationListener';
import Image from 'next/image';
import { AvatarPreviewContent } from '@/components/AvatarPreviewContent';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  showKey?: keyof AppSettings;
  enableKey?: keyof AppSettings;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', href: '/home', icon: Home, roles: ['student', 'teacher', 'admin'] },
  { label: 'Panel Personal', href: '/dashboard', icon: LayoutDashboard, roles: ['student', 'teacher', 'admin'] },
  { label: 'Horario', href: '/schedule', icon: Calendar, roles: ['student', 'teacher', 'admin'] },
  { label: 'Biblioteca', href: '/library', icon: Library, roles: ['student', 'teacher', 'admin'] },
  { label: 'Progreso', href: '/progress', icon: TrendingUp, roles: ['student', 'teacher', 'admin'] },
  { 
    label: 'Producción Musical', 
    href: '/production', 
    icon: Mic2, 
    roles: ['student', 'teacher', 'admin'], 
    showKey: 'showProduction',
    enableKey: 'enableProduction'
  },
  { 
    label: 'Recompensas', 
    href: '/rewards', 
    icon: Gift, 
    roles: ['student', 'teacher', 'admin'],
    showKey: 'showRewards',
    enableKey: 'enableRewards'
  },
  { 
    label: 'RitmoMarket', 
    href: '/market', 
    icon: ShoppingBag, 
    roles: ['student', 'teacher', 'admin'],
    showKey: 'showMarket',
    enableKey: 'enableMarket'
  },
  { 
    label: 'Postulaciones', 
    href: '/postulations', 
    icon: ClipboardList, 
    roles: ['student', 'teacher', 'admin'],
    showKey: 'showPostulations',
    enableKey: 'enablePostulations'
  },
  { label: 'Usuarios', href: '/users', icon: Users, roles: ['admin'] },
  { label: 'Configuración', href: '/settings', icon: Settings, roles: ['admin'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, updateUser } = useAuth();
  const { settings } = useSettingsStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotificationStore(user?.id);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  if (!user) {
    return <>{children}</>;
  }

  const handleSaveTransform = (transform: { scale: number; position: { x: number; y: number } }) => {
    updateUser({
      photoTransform: {
        scale: transform.scale,
        x: transform.position.x,
        y: transform.position.y
      }
    });
  };

  const avatarStyle = user.photoTransform ? {
    transform: `translate(${user.photoTransform.x}px, ${user.photoTransform.y}px) scale(${user.photoTransform.scale})`,
    transition: 'transform 0.2s ease-out'
  } : {};

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-r border-border">
      <NotificationListener />
      {/* Header Fijo */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-md border-2 border-accent shrink-0">
              <Image 
                src={settings.appLogoUrl} 
                alt="Logo" 
                fill 
                className="object-cover"
                data-ai-hint="academy logo"
              />
            </div>
            <span className="text-xl font-extrabold text-foreground font-headline tracking-tight leading-tight">
              Aprende con Ritmo
            </span>
          </div>

          <Popover onOpenChange={(open) => open && unreadCount > 0 && markAllAsRead()}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-accent/10">
                <Bell className={cn("w-5 h-5", unreadCount > 0 ? "text-accent animate-bounce" : "text-muted-foreground")} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-accent text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-[2rem] p-0 border-none shadow-2xl overflow-hidden" align="end">
              <div className="bg-primary/10 p-4 border-b flex items-center justify-between">
                <h4 className="font-black text-sm text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4 text-accent" /> Notificaciones
                </h4>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 text-[9px] font-black uppercase text-accent hover:bg-accent/10 rounded-lg">
                    Marcar todo leído
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[350px]">
                {notifications.length > 0 ? (
                  <div className="divide-y border-b dark:divide-white/5">
                    {notifications.map((n) => (
                      <div key={n.id} className={cn(
                        "p-4 transition-colors group relative",
                        n.read ? "opacity-60 bg-transparent" : "bg-accent/5"
                      )}>
                        <div className="flex gap-3">
                          <div className={cn(
                            "mt-1 w-2 h-2 rounded-full shrink-0",
                            n.read ? "bg-muted-foreground/30" : "bg-accent animate-pulse"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-foreground leading-tight mb-1">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{n.body}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="w-2.5 h-2.5 text-muted-foreground/50" />
                              <span className="text-[9px] font-bold text-muted-foreground/50 italic">
                                {new Date(n.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.read && (
                            <Button size="icon" variant="ghost" onClick={() => markAsRead(n.id)} className="h-6 w-6 rounded-full hover:bg-emerald-100 text-emerald-600">
                              <CheckCircle2 className="w-3 h-3" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => clearNotification(n.id)} className="h-6 w-6 rounded-full hover:bg-destructive/10 text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center space-y-3">
                    <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                    <p className="text-xs text-muted-foreground font-bold italic">No tienes notificaciones pendientes.</p>
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Menú Scrollable */}
      <nav className="flex-1 overflow-y-auto space-y-1 px-6 py-2 scrollbar-hide">
        {NAV_ITEMS.filter(item => item.roles.includes(user.role)).map((item) => {
          const isActive = pathname === item.href;
          const isAdmin = user.role === 'admin';
          
          // Lógica de visibilidad
          if (!isAdmin && item.showKey && !settings[item.showKey]) {
            return null;
          }

          // Lógica de habilitación (si es visible pero desabilitado -> Próximamente)
          const isEnabled = isAdmin || !item.enableKey || settings[item.enableKey];

          if (!isEnabled) {
            return (
              <div 
                key={item.label} 
                className="flex items-center justify-between px-4 py-3 rounded-xl opacity-50 text-muted-foreground group select-none"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-[7px] font-black uppercase bg-orange-600 text-white px-2 py-0.5 rounded-md shadow-[0_0_8px_rgba(234,88,12,0.4)] animate-pulse border-none">
                  Próximamente
                </span>
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              <span className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                isActive 
                  ? "bg-secondary dark:bg-accent/20 text-secondary-foreground dark:text-accent font-semibold shadow-sm" 
                  : "text-muted-foreground hover:bg-primary/30 dark:hover:bg-slate-800 hover:text-foreground"
              )}>
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-accent" : "text-muted-foreground"
                )} />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {/* Indicador visual para el admin si el módulo está deshabilitado para otros */}
                {isAdmin && item.enableKey && !settings[item.enableKey] && (
                  <span className="text-[6px] font-black uppercase bg-muted text-muted-foreground px-1 py-0.5 rounded-sm">OFF</span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Fijo */}
      <div className="mt-auto pt-4 p-6 border-t border-border bg-white/20 dark:bg-slate-900/20">
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl transition-all duration-200 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20 group cursor-pointer">
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="text-sm">Ayuda por WhatsApp</span>
            </div>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-md bg-card">
            <DialogHeader className="bg-emerald-500/10 p-8 border-b text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <DialogTitle className="text-2xl font-black text-foreground">Canal de Soporte Directo</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium mt-2">
                Estamos aquí para acompañarte en tu formación musical.
              </DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-6 bg-card">
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground leading-tight">Gestión Académica</h4>
                    <p className="text-xs text-muted-foreground font-bold italic">Consultas sobre horarios, cambios de lección o inscripciones.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground leading-tight">Consultas sobre Profesores</h4>
                    <p className="text-xs text-muted-foreground font-bold italic">Preguntas sobre perfiles docentes, especialidades o asignaciones.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground leading-tight">Contenido y Materiales</h4>
                    <p className="text-xs text-muted-foreground font-bold italic">Ayuda con el acceso a la biblioteca o partituras.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground leading-tight">Asistencia en la Plataforma</h4>
                    <p className="text-xs text-muted-foreground font-bold italic">Reporte de errores o ayuda técnica con tu perfil.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  asChild
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-14 font-black text-lg shadow-xl shadow-emerald-500/20 gap-3"
                >
                  <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Chatear con la Academia
                  </a>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 px-4 py-4 bg-primary/5 rounded-2xl border-2 border-primary/10">
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-zoom-in hover:scale-110 transition-transform shrink-0">
                  <Avatar className="w-10 h-10 border-2 border-primary">
                    {user.photoUrl ? (
                      <AvatarImage src={user.photoUrl} className="object-cover" style={avatarStyle} />
                    ) : (
                      <AvatarImage src={`https://picsum.photos/seed/${user.avatarSeed || user.id}/100`} style={avatarStyle} />
                    )}
                    <AvatarFallback className="bg-primary">{user.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </DialogTrigger>
              <DialogContent className="max-sm p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-card">
                <DialogHeader className="sr-only">
                  <DialogTitle>Mi Identidad Musical</DialogTitle>
                  <DialogDescription>Previsualización y ajuste de tu imagen de perfil personal.</DialogDescription>
                </DialogHeader>
                <AvatarPreviewContent 
                  src={user.photoUrl || `https://picsum.photos/seed/${user.avatarSeed || user.id}/600`}
                  name={user.name}
                  subtitle="Mi Identidad Musical"
                  onSave={handleSaveTransform}
                />
              </DialogContent>
            </Dialog>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-sm font-bold truncate dark:text-slate-200">{user.name}</span>
              <span className="text-xs text-muted-foreground capitalize truncate">
                {user.role === 'student' ? 'Estudiante' : user.role === 'teacher' ? 'Profesor' : 'Administrador'}
              </span>
            </div>
          </div>

          <Link href="/profile">
            <span className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
              pathname === '/profile' 
                ? "bg-secondary dark:bg-accent/20 text-secondary-foreground dark:text-accent font-semibold shadow-sm" 
                : "text-muted-foreground hover:bg-primary/30 dark:hover:bg-slate-800 hover:text-foreground"
            )}>
              <UserIcon className={cn(
                "w-5 h-5",
                pathname === '/profile' ? "text-accent" : "text-muted-foreground"
              )} />
              Mi Perfil
            </span>
          </Link>
        </div>

        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 mt-2 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
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
      <aside className="hidden md:block w-72 h-screen sticky top-0 overflow-hidden">
        <SidebarContent />
      </aside>

      <main className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 border-b">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 overflow-hidden rounded-lg border-2 border-accent">
              <Image 
                src={settings.appLogoUrl} 
                alt="Logo" 
                fill 
                className="object-cover"
                data-ai-hint="academy logo"
              />
            </div>
            <span className="font-bold text-foreground leading-tight">Aprende con Ritmo</span>
          </div>
          <div className="flex items-center gap-2">
            <Popover onOpenChange={(open) => open && unreadCount > 0 && markAllAsRead()}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className={cn("w-5 h-5", unreadCount > 0 ? "text-accent" : "")} />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 rounded-2xl">
                {/* Contenido simplificado para móvil */}
                <p className="text-xs font-black p-2 border-b">Notificaciones ({unreadCount})</p>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 border-b last:border-0 text-[10px]">
                      <p className="font-bold">{n.title}</p>
                      <p className="text-muted-foreground">{n.body}</p>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="dark:text-slate-200">
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
          </div>
        </header>

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
