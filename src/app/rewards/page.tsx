
"use client"

import { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Gift, 
  Trophy, 
  Star, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Edit2, 
  Trash2,
  Ticket,
  ChevronRight,
  Zap,
  Info,
  Package,
  History
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useRewardsStore, RewardItem, RewardRedemption } from '@/lib/rewards-store';
import { useCompletionStore } from '@/lib/completion-store';
import { useBookingStore } from '@/lib/booking-store';
import { useSkillsStore } from '@/lib/skills-store';
import { useMilestonesStore } from '@/lib/milestones-store';
import { useResourceStore } from '@/lib/resource-store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getDirectImageUrl } from '@/lib/utils/images';

export default function RewardsPage() {
  const { user, allUsers } = useAuth();
  const { rewards, redemptions, addReward, updateReward, redeemReward, updateRedemptionStatus, loading } = useRewardsStore();
  const { completions } = useCompletionStore();
  const { availabilities } = useBookingStore();
  const { getSkillLevel } = useSkillsStore();
  const { milestones, getAchievedCount } = useMilestonesStore();
  const { resources } = useResourceStore();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
  const [rewardForm, setRewardForm] = useState<Partial<RewardItem>>({
    title: '',
    description: '',
    pointsCost: 100,
    image: '',
    stock: 5,
    category: 'Accesorio',
    isEnabled: true
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAdmin = user?.role === 'admin';

  // Lógica de cálculo de puntos (reutilizada de ProgressPage para consistencia)
  const userPoints = useMemo(() => {
    if (!user) return 0;
    
    let total = 0;

    // 1. Puntos por materiales completados (150 pts cada uno)
    completions.forEach(comp => {
      if (comp.isCompleted && String(comp.studentId) === String(user.id)) {
        total += 150;
      }
    });

    // 2. Puntos por clases asistidas (20 pts por hora)
    const calculateDuration = (timeStr: string): number => {
      try {
        const [start, end] = timeStr.split(' - ');
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
      } catch (e) { return 1; }
    };

    availabilities.forEach(avail => {
      avail.slots.forEach(slot => {
        if (slot.isBooked && slot.status === 'completed' && (slot.studentId === user.id || slot.students?.some(st => st.id === user.id))) {
          total += Math.round(calculateDuration(slot.time) * 20);
        }
      });
    });

    // 3. Puntos por hitos (200 pts cada uno)
    total += getAchievedCount(user.id) * 200;

    // 4. Restar puntos ya gastados en canjes
    const spent = redemptions
      .filter(r => r.studentId === user.id && r.status !== 'cancelled')
      .reduce((acc, curr) => acc + curr.pointsSpent, 0);

    return Math.max(0, total - spent);
  }, [user, completions, availabilities, redemptions, getAchievedCount]);

  const handleRedeem = (reward: RewardItem) => {
    if (userPoints < reward.pointsCost) {
      toast({
        variant: "destructive",
        title: "Puntos insuficientes 🚫",
        description: `Necesitas ${reward.pointsCost - userPoints} puntos más para este premio.`
      });
      return;
    }

    if (reward.stock <= 0) {
      toast({
        variant: "destructive",
        title: "Sin stock 📦",
        description: "Este ítem se ha agotado temporalmente."
      });
      return;
    }

    redeemReward(reward.id, user!.id, reward.pointsCost);
    updateReward(reward.id, { stock: reward.stock - 1 });
    
    toast({
      title: "¡Canje solicitado! 🎁",
      description: "Administración revisará tu solicitud pronto."
    });
  };

  const handleSaveReward = () => {
    if (!rewardForm.title || !rewardForm.pointsCost) return;

    if (editingReward) {
      updateReward(editingReward.id, rewardForm);
      toast({ title: "Premio actualizado ✨" });
    } else {
      addReward(rewardForm as RewardItem);
      toast({ title: "Premio añadido al catálogo 🎊" });
    }
    setIsRewardModalOpen(false);
  };

  const openCreateReward = () => {
    setEditingReward(null);
    setRewardForm({
      title: '',
      description: '',
      pointsCost: 500,
      image: 'https://picsum.photos/seed/gift/400/300',
      stock: 10,
      category: 'Accesorio',
      isEnabled: true
    });
    setIsRewardModalOpen(true);
  };

  if (!isMounted || !user) return null;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground font-headline tracking-tight flex items-center gap-3">
              <Gift className="w-10 h-10 text-accent" />
              Recompensas y Premios 🎁
            </h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">Canjea tu esfuerzo musical por beneficios exclusivos.</p>
          </div>

          <Card className="rounded-[2rem] border-none shadow-xl bg-accent text-white px-8 py-4 flex items-center gap-4 shrink-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            <Trophy className="w-10 h-10 relative z-10" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Tus Puntos Disponibles</p>
              <h2 className="text-3xl font-black">{userPoints.toLocaleString()} pts</h2>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="catalog" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-primary/5 p-1 rounded-2xl h-14">
              <TabsTrigger value="catalog" className="rounded-xl px-8 h-12 font-black data-[state=active]:bg-card data-[state=active]:shadow-md transition-all">
                <ShoppingBag className="w-4 h-4 mr-2" /> Tienda
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl px-8 h-12 font-black data-[state=active]:bg-card data-[state=active]:shadow-md transition-all">
                <History className="w-4 h-4 mr-2" /> Mis Canjes
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="rounded-xl px-8 h-12 font-black data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
                  <Zap className="w-4 h-4 mr-2" /> Gestión
                </TabsTrigger>
              )}
            </TabsList>

            {isAdmin && (
              <Button onClick={openCreateReward} className="bg-accent text-white rounded-2xl h-12 px-6 font-black gap-2 shadow-lg hover:scale-105 transition-all">
                <Plus className="w-5 h-5" /> Nuevo Premio
              </Button>
            )}
          </div>

          <TabsContent value="catalog" className="animate-in fade-in-50 duration-500 outline-none">
            {loading ? (
              <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rewards.filter(r => r.isEnabled).map((reward) => (
                  <Card key={reward.id} className="rounded-[2.5rem] border-2 border-primary/20 overflow-hidden group hover:border-accent/40 hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-video overflow-hidden">
                      <Image 
                        src={getDirectImageUrl(reward.image)} 
                        alt={reward.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/95 text-accent rounded-full font-black px-3 py-1 shadow-sm border-none text-[10px] uppercase">
                          {reward.category}
                        </Badge>
                      </div>
                      {reward.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                          <Badge variant="destructive" className="rounded-full px-6 py-2 font-black text-sm uppercase">Agotado</Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-xl font-black text-foreground font-headline leading-tight line-clamp-1">{reward.title}</CardTitle>
                        <Badge variant="outline" className="border-accent text-accent font-black rounded-lg shrink-0">
                          {reward.pointsCost} pts
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2 mb-4">
                        {reward.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <Package className="w-3.5 h-3.5" />
                        Stock: {reward.stock} unidades
                      </div>
                    </CardContent>
                    <CardFooter className="bg-primary/5 p-6 border-t border-primary/10">
                      <Button 
                        onClick={() => handleRedeem(reward)}
                        disabled={userPoints < reward.pointsCost || reward.stock <= 0}
                        className={cn(
                          "w-full rounded-2xl h-12 font-black text-sm shadow-md transition-all",
                          userPoints >= reward.pointsCost ? "bg-accent text-white hover:scale-105" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {userPoints >= reward.pointsCost ? 'Canjear Premio' : `Faltan ${reward.pointsCost - userPoints} pts`}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="animate-in fade-in-50 duration-500 outline-none">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-accent rounded-full" />
                <h2 className="text-2xl font-black text-foreground">Tu historial de canjes</h2>
              </div>
              
              {redemptions.filter(r => r.studentId === user.id).length > 0 ? (
                redemptions.filter(r => r.studentId === user.id).map((red) => {
                  const reward = rewards.find(r => r.id === red.rewardId);
                  return (
                    <Card key={red.id} className="rounded-2xl border-2 border-primary/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-primary/5 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-accent shrink-0 border border-primary/10">
                          <Ticket className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-black text-lg text-foreground">{reward?.title || 'Premio Desconocido'}</h4>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                              <Star className="w-3 h-3 text-accent" /> {red.pointsSpent} puntos
                            </span>
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {new Date(red.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={cn(
                          "rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest border-none",
                          red.status === 'delivered' ? 'bg-emerald-500 text-white' : 
                          red.status === 'pending' ? 'bg-orange-500 text-white animate-pulse' : 'bg-destructive text-white'
                        )}>
                          {red.status === 'delivered' ? 'Entregado' : red.status === 'pending' ? 'En proceso' : 'Cancelado'}
                        </Badge>
                        {red.status === 'pending' && (
                          <p className="text-[9px] font-bold text-muted-foreground max-w-[120px] leading-tight italic">
                            Acércate a recepción para recoger tu premio.
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="py-20 text-center bg-primary/5 rounded-[3rem] border-4 border-dashed border-primary/10">
                  <Ticket className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-foreground">Aún no tienes canjes</h3>
                  <p className="text-muted-foreground font-bold italic">¡Sigue practicando para sumar puntos y ganar premios!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="animate-in fade-in-50 duration-500 outline-none">
              <Card className="rounded-[2.5rem] border-2 border-accent/20 shadow-md overflow-hidden bg-card">
                <CardHeader className="bg-accent/5 p-8 border-b">
                  <CardTitle className="text-xl font-black text-foreground flex items-center gap-3">
                    <Zap className="w-6 h-6 text-accent" />
                    Solicitudes de Canje Pendientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {redemptions.filter(r => r.status === 'pending').length > 0 ? (
                      redemptions.filter(r => r.status === 'pending').map((red) => {
                        const reward = rewards.find(r => r.id === red.rewardId);
                        const student = allUsers.find(u => u.id === red.studentId);
                        return (
                          <div key={red.id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center shrink-0">
                                <Gift className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-black text-foreground leading-tight">{reward?.title}</p>
                                <p className="text-xs font-bold text-muted-foreground">Alumno: <span className="text-accent">{student?.name}</span></p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{new Date(red.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs gap-2"
                                onClick={() => updateRedemptionStatus(red.id, 'delivered')}
                              >
                                <CheckCircle2 className="w-4 h-4" /> Marcar Entregado
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl font-black text-xs gap-2"
                                onClick={() => updateRedemptionStatus(red.id, 'cancelled')}
                              >
                                <Trash2 className="w-4 h-4" /> Cancelar
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-20 text-center text-muted-foreground font-bold italic">No hay solicitudes pendientes de revisión.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Admin: Modal de Crear/Editar Premio */}
      <Dialog open={isRewardModalOpen} onOpenChange={setIsRewardModalOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
          <DialogHeader className="bg-accent/10 p-8 border-b space-y-2 shrink-0">
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
              <Plus className="w-8 h-8 text-accent" />
              Configurar Premio
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">Añade o modifica ítems del catálogo de recompensas.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6 bg-card overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre del Premio</Label>
                <Input 
                  value={rewardForm.title} 
                  onChange={(e) => setRewardForm(prev => ({...prev, title: e.target.value}))}
                  className="h-12 rounded-xl border-2 font-bold focus:border-accent"
                  placeholder="Ej: Juego de cuerdas"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Costo (Puntos)</Label>
                <Input 
                  type="number"
                  value={rewardForm.pointsCost} 
                  onChange={(e) => setRewardForm(prev => ({...prev, pointsCost: parseInt(e.target.value)}))}
                  className="h-12 rounded-xl border-2 font-bold focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Categoría</Label>
                <Select 
                  value={rewardForm.category} 
                  onValueChange={(val) => setRewardForm(prev => ({...prev, category: val}))}
                >
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Accesorio" className="font-bold">Accesorio Físico</SelectItem>
                    <SelectItem value="Descuento" className="font-bold">Descuento Mensual</SelectItem>
                    <SelectItem value="Digital" className="font-bold">Contenido Digital</SelectItem>
                    <SelectItem value="Especial" className="font-bold">Evento Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Stock Disponible</Label>
                <Input 
                  type="number"
                  value={rewardForm.stock} 
                  onChange={(e) => setRewardForm(prev => ({...prev, stock: parseInt(e.target.value)}))}
                  className="h-12 rounded-xl border-2 font-bold focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">URL de Imagen</Label>
              <Input 
                value={rewardForm.image} 
                onChange={(e) => setRewardForm(prev => ({...prev, image: e.target.value}))}
                className="h-12 rounded-xl border-2 font-bold focus:border-accent"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descripción</Label>
              <Textarea 
                value={rewardForm.description} 
                onChange={(e) => setRewardForm(prev => ({...prev, description: e.target.value}))}
                className="min-h-[100px] rounded-xl border-2 font-bold p-4"
                placeholder="Detalles sobre cómo obtener o usar este premio..."
              />
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/30 border-t flex gap-3 shrink-0">
            <Button variant="outline" onClick={() => setIsRewardModalOpen(false)} className="rounded-xl flex-1 h-14 font-black">Cancelar</Button>
            <Button onClick={handleSaveReward} className="bg-accent text-white rounded-xl flex-1 h-14 font-black shadow-lg shadow-accent/20">
              {editingReward ? 'Guardar Cambios' : 'Crear Premio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
